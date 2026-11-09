package live.restora.nativeapp.data

import org.junit.Assert.assertEquals
import org.junit.Test

class OrderStatusTest {
    private fun order(status: String, type: String = "takeaway") = Order(
        id = "id", token = "7", type = type, status = status,
        paymentStatus = "unpaid", customer = "", table = "", total = 0.0,
        items = emptyList(), createdAt = ""
    )

    @Test fun guestOrdersRequireAcceptance() {
        assertEquals("new", order("pending").nextStatus())
    }

    @Test fun deliveryRequiresDispatch() {
        assertEquals("out_for_delivery", order("ready", "delivery").nextStatus())
    }

    @Test fun dineInAndTakeawayFinishAfterReady() {
        assertEquals("completed", order("ready", "dine_in").nextStatus())
        assertEquals("completed", order("ready", "takeaway").nextStatus())
    }

    @Test fun terminalStatesCannotAdvance() {
        assertEquals(null, order("completed").nextStatus())
        assertEquals(null, order("cancelled").nextStatus())
    }
}
