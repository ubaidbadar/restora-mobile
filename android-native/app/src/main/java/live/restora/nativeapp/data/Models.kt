package live.restora.nativeapp.data

import org.json.JSONArray
import org.json.JSONObject

data class Restaurant(val id: String, val name: String)
data class Workplace(
    val restaurant: Restaurant,
    val branchName: String,
    val permissions: Set<String>
) {
    fun can(permission: String): Boolean = permission in permissions
}
data class Account(val name: String, val email: String, val workplace: Workplace?)

data class OrderLine(val name: String, val quantity: Int, val unitPrice: Double)
data class Order(
    val id: String,
    val token: String,
    val type: String,
    val status: String,
    val paymentStatus: String,
    val customer: String,
    val table: String,
    val total: Double,
    val items: List<OrderLine>,
    val createdAt: String
) {
    fun nextStatus(): String? = when (status) {
        "pending" -> "new"
        "new" -> "preparing"
        "preparing" -> "ready"
        "ready" -> if (type == "delivery") "out_for_delivery" else "completed"
        "out_for_delivery" -> "completed"
        else -> null
    }
}
data class FloorTable(
    val id: String,
    val name: String,
    val section: String,
    val seats: Int,
    val busyOrders: Int,
    val guestCalls: Int,
    val archived: Boolean,
    val qrCode: String
)
data class Customer(
    val id: String,
    val name: String,
    val phone: String,
    val khataBalance: Double
)
data class Dashboard(
    val sales: Double,
    val orderCount: Int,
    val newCustomers: Int,
    val khataTotal: Double,
    val cash: Double,
    val digital: Double,
    val notCollected: Double
)

internal fun JSONObject.text(key: String): String =
    if (isNull(key)) "" else optString(key, "")

internal fun <T> JSONArray.objects(convert: (JSONObject) -> T): List<T> =
    buildList {
        for (index in 0 until length()) {
            optJSONObject(index)?.let { add(convert(it)) }
        }
    }

internal fun JSONObject.toAccount(): Account {
    val user = optJSONObject("user") ?: JSONObject()
    val workplace = optJSONObject("workplace")?.let { work ->
        val restaurant = work.optJSONObject("restaurant") ?: JSONObject()
        Workplace(
            restaurant = Restaurant(restaurant.text("_id"), restaurant.text("name")),
            branchName = work.optJSONObject("branch")?.text("name") ?: "",
            permissions = (work.optJSONArray("permissions") ?: JSONArray())
                .let { arr -> (0 until arr.length()).mapNotNull { arr.optString(it).takeIf(String::isNotBlank) } }
                .toSet()
        )
    }
    return Account(user.text("name"), user.text("email"), workplace)
}

internal fun JSONObject.toOrder(): Order {
    val customer = optJSONObject("customer")
    return Order(
        id = text("_id"),
        token = text("dailyToken"),
        type = text("type"),
        status = text("status"),
        paymentStatus = text("paymentStatus"),
        customer = customer?.text("name") ?: "",
        table = text("tableName"),
        total = optDouble("total", 0.0),
        items = (optJSONArray("items") ?: JSONArray()).objects {
            OrderLine(it.text("name"), it.optInt("qty", 0), it.optDouble("price", 0.0))
        },
        createdAt = text("createdAt")
    )
}

internal fun JSONObject.toFloorTable(): FloorTable = FloorTable(
    id = text("_id"),
    name = text("name"),
    section = text("section"),
    seats = optInt("seats", 0),
    busyOrders = optJSONArray("orders")?.length() ?: 0,
    guestCalls = optJSONArray("requests")?.length() ?: 0,
    archived = optBoolean("archived", false),
    qrCode = text("qrCode")
)
internal fun JSONObject.toCustomer(): Customer = Customer(
    id = text("_id"),
    name = text("name"),
    phone = text("phone"),
    khataBalance = optDouble("khataBalance", 0.0)
)
internal fun JSONObject.toDashboard(): Dashboard {
    val stats = optJSONObject("stats") ?: JSONObject()
    return Dashboard(
        sales = stats.optDouble("sales", 0.0),
        orderCount = stats.optInt("orderCount", 0),
        newCustomers = stats.optInt("newCustomers", 0),
        khataTotal = stats.optDouble("khataTotal", 0.0),
        cash = stats.optDouble("cash", 0.0),
        digital = stats.optDouble("digital", 0.0),
        notCollected = stats.optDouble("notCollected", 0.0)
    )
}
