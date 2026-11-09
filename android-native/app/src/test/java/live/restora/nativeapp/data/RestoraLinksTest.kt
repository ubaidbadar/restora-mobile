package live.restora.nativeapp.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class RestoraLinksTest {
    @Test fun guestLinksAreOnThePublicWebsite() {
        assertEquals(
            "https://restora.live/t/ubaids-tandoor-house/t1-7k2m9q",
            RestoraLinks.tableQrUrlOrNull("ubaids-tandoor-house/t1-7k2m9q")
        )
        assertEquals("https://restora.live/t/oldcode23", RestoraLinks.tableQrUrlOrNull("oldcode23"))
    }

    @Test fun invalidCodesCannotBecomeExternalUrls() {
        listOf("", " ", "https://app.restora.live/t/x", "../admin", "a//b",
            "a/b?next=admin", "a/b#frag", "x@y", "/t/a", "a/b/c").forEach {
            assertNull(RestoraLinks.tableQrUrlOrNull(it))
        }
    }

    @Test fun dashboardAndGuestLinksUseDifferentHosts() {
        assertEquals("https://app.restora.live", RestoraLinks.webDashboard)
        assertEquals("https://restora.live", RestoraLinks.publicBase)
        assertTrue(RestoraLinks.webDashboard != RestoraLinks.publicBase)
        assertEquals(
            "415170912813-7ikcdht16n2vgumkkpvaslda5c8kbbop.apps.googleusercontent.com",
            live.restora.nativeapp.BuildConfig.GOOGLE_WEB_CLIENT_ID
        )
    }
}
