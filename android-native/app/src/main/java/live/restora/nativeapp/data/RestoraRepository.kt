package live.restora.nativeapp.data

import java.time.LocalDate
import java.time.ZoneId

/** The repository is the only layer the ViewModel asks for server data. */
class RestoraRepository(private val api: RestoraApi) {
    fun hasSession(): Boolean = api.hasSavedSession()
    suspend fun authenticate(email: String, password: String): Account {
        api.signIn(email, password)
        return api.me()
    }
    suspend fun authenticateWithGoogle(token: String, nonce: String): Account {
        api.signInWithGoogle(token, nonce)
        return api.me()
    }
    suspend fun restore(): Account = api.me()
    suspend fun signOut() = api.signOut()
    suspend fun orders(): List<Order> = api.orders()
    suspend fun tables(): List<FloorTable> = api.tables()
    suspend fun customers(): List<Customer> = api.customers()
    suspend fun dashboard(): Dashboard {
        val pakistanDay = LocalDate.now(ZoneId.of("Asia/Karachi")).toString()
        return api.today(pakistanDay)
    }
}
