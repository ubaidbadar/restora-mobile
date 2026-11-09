package live.restora.nativeapp.data

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.nio.charset.StandardCharsets
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * A server session cookie is credential material. Encrypt at rest using a non-exportable
 * Android Keystore key. Backups are disabled in the application manifest.
 */
class SecureCookieStore(context: Context) {
    private val preferences = context.getSharedPreferences("session_private", Context.MODE_PRIVATE)
    private val alias = "restora_native_session_aes_v1"

    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (store.getKey(alias, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(
                alias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            ).setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()
        )
        return generator.generateKey()
    }

    fun read(): String? {
        val stored = preferences.getString("cookie", null) ?: return null
        return try {
            val split = stored.split('.', limit = 2)
            if (split.size != 2) return null
            val iv = Base64.decode(split[0], Base64.NO_WRAP)
            val ciphertext = Base64.decode(split[1], Base64.NO_WRAP)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, iv))
            String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8)
        } catch (_: Exception) {
            // E.g. key invalidated by a device lock change: require sign-in again.
            clear()
            null
        }
    }

    fun write(cookie: String) {
        require(cookie.isNotBlank())
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key())
        val iv = Base64.encodeToString(cipher.iv, Base64.NO_WRAP)
        val encrypted = Base64.encodeToString(
            cipher.doFinal(cookie.toByteArray(StandardCharsets.UTF_8)),
            Base64.NO_WRAP
        )
        check(preferences.edit().putString("cookie", "$iv.$encrypted").commit()) {
            "Could not save the secure session"
        }
    }

    fun clear() {
        preferences.edit().remove("cookie").commit()
    }
}
