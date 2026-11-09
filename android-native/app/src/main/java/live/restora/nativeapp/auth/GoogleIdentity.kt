package live.restora.nativeapp.auth

import android.app.Activity
import android.util.Base64
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import live.restora.nativeapp.BuildConfig
import java.security.SecureRandom

/** Only the ID token and the nonce leave this layer; never store or log Google credentials. */
data class GoogleSignInToken(val idToken: String, val nonce: String)

/**
 * One-tap, user-initiated Google account picker via stable Credential Manager.
 * Requires an Android OAuth client registered with this installation's package and SHA-1.
 */
class GoogleIdentity(private val activity: Activity) {
    suspend fun signIn(): GoogleSignInToken {
        val nonceBytes = ByteArray(32).also { SecureRandom().nextBytes(it) }
        val nonce = Base64.encodeToString(
            nonceBytes, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING
        )
        val option = GetSignInWithGoogleOption.Builder(
            serverClientId = BuildConfig.GOOGLE_WEB_CLIENT_ID
        ).setNonce(nonce).build()
        val request = GetCredentialRequest.Builder().addCredentialOption(option).build()
        val credential = CredentialManager.create(activity)
            .getCredential(context = activity, request = request).credential
        require(credential is CustomCredential &&
            credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
            "Google did not return an ID token."
        }
        val token = GoogleIdTokenCredential.createFrom(credential.data).idToken
        require(token.isNotBlank()) { "Google returned an empty ID token." }
        return GoogleSignInToken(idToken = token, nonce = nonce)
    }
}
