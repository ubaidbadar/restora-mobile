package live.restora.nativeapp.data

import live.restora.nativeapp.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

class ApiException(val status: Int, val errorCode: String, message: String) : IOException(message)

/**
 * Small HTTPS-only client. All I/O is on Dispatchers.IO; no credentials are logged.
 * Better Auth session cookies are captured from Set-Cookie and sent as Cookie.
 */
class RestoraApi(private val cookies: SecureCookieStore) {
    private val base = BuildConfig.API_BASE_URL.trimEnd('/')

    init {
        require(base.startsWith("https://")) { "Native API must use HTTPS" }
    }

    fun hasSavedSession(): Boolean = cookies.read() != null

    suspend fun signIn(email: String, password: String) {
        request(
            path = "/auth/sign-in/email",
            method = "POST",
            json = JSONObject().put("email", email).put("password", password),
            useSession = false
        )
        if (!hasSavedSession()) throw IOException("Sign-in did not return a session cookie.")
    }

    suspend fun signOut() {
        try {
            request("/auth/sign-out", method = "POST", json = JSONObject())
        } finally {
            cookies.clear()
        }
    }

    suspend fun me(): Account = JSONObject(request("/me")).toAccount()
    suspend fun orders(): List<Order> = JSONArray(request("/orders")).objects { it.toOrder() }
    suspend fun tables(): List<FloorTable> =
        JSONArray(request("/tables/floor")).objects { it.toFloorTable() }
    suspend fun customers(): List<Customer> =
        JSONArray(request("/customers")).objects { it.toCustomer() }

    suspend fun today(day: String): Dashboard =
        JSONObject(request("/dashboard?scope=branch&from=$day&to=$day")).toDashboard()

    private suspend fun request(
        path: String,
        method: String = "GET",
        json: JSONObject? = null,
        useSession: Boolean = true
    ): String = withContext(Dispatchers.IO) {
        require(path.startsWith("/") && !path.startsWith("//"))
        val connection = URL("$base$path").openConnection() as HttpURLConnection
        try {
            connection.requestMethod = method
            connection.connectTimeout = 20_000
            connection.readTimeout = 20_000
            connection.instanceFollowRedirects = false
            connection.setRequestProperty("Accept", "application/json")
            if (useSession) cookies.read()?.let {
                connection.setRequestProperty("Cookie", it)
            }
            if (json != null) {
                connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")
                connection.doOutput = true
                connection.outputStream.use {
                    it.write(json.toString().toByteArray(StandardCharsets.UTF_8))
                }
            }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val answer = stream?.bufferedReader(StandardCharsets.UTF_8)?.use { it.readText() }.orEmpty()

            if (status !in 200..299) {
                val error = runCatching { JSONObject(answer) }.getOrDefault(JSONObject())
                throw ApiException(
                    status = status,
                    errorCode = error.optString("code", ""),
                    message = error.optString("message", "Request failed (HTTP $status)")
                )
            }

            // Keep only Better Auth's cookies, not unrelated application cookies.
            val returnedCookies = connection.headerFields.entries
                .firstOrNull { (name, _) -> name.equals("Set-Cookie", ignoreCase = true) }
                ?.value.orEmpty()
                .map { it.substringBefore(';').trim() }
                .filter { raw ->
                    raw.substringBefore('=').removePrefix("__Secure-").startsWith("better-auth.")
                }
            if (returnedCookies.isNotEmpty()) cookies.write(returnedCookies.joinToString("; "))

            answer.ifBlank { "{}" }
        } finally {
            connection.disconnect()
        }
    }
}
