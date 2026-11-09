package live.restora.nativeapp.data

import live.restora.nativeapp.BuildConfig

/** Canonical sources for staff dashboard and public guest QR destinations. */
object RestoraLinks {
    val webDashboard: String get() = BuildConfig.WEB_APP_URL
    val publicBase: String get() = BuildConfig.PUBLIC_QR_BASE_URL

    /**
     * qrCode from /tables/floor is a code, never a URL.
     * Modern codes contain restaurant/table-key; old printed codes may be one segment.
     * This prevents guests being redirected to the staff dashboard or an attacker-supplied host.
     */
    fun tableQrUrlOrNull(qrCode: String): String? {
        val code = qrCode.trim()
        if (!VALID_CODE.matches(code)) return null
        return "${publicBase.trimEnd('/')}/t/$code"
    }

    private val VALID_CODE = Regex("[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)?")
}
