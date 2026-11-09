package live.restora.nativeapp.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items as gridItems
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.PasswordVisualTransformation
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import live.restora.nativeapp.data.Account
import live.restora.nativeapp.data.Customer
import live.restora.nativeapp.data.Dashboard
import live.restora.nativeapp.data.FloorTable
import live.restora.nativeapp.data.Order
import java.text.NumberFormat
import java.util.Locale

private val pakistanLocale = Locale.Builder().setLanguage("en").setRegion("PK").build()
private fun rupees(value: Double): String = "Rs " + NumberFormat.getNumberInstance(pakistanLocale).format(value)

@Composable
fun RestoraApp(model: RestoraViewModel) {
    val state by model.state.collectAsStateWithLifecycle()
    when (val session = state.session) {
        SessionState.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        is SessionState.SignedOut -> SignInScreen(
            message = session.message,
            busy = state.busy,
            onSignIn = model::signIn
        )
        is SessionState.ConnectionError -> Column(
            Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text("Could not start Restora", style = MaterialTheme.typography.headlineSmall)
            Spacer(Modifier.height(12.dp))
            Text(session.message)
            Spacer(Modifier.height(20.dp))
            Button(onClick = model::restoreSession, modifier = Modifier.heightIn(min = 48.dp)) {
                Text("Retry")
            }
            TextButton(onClick = model::signOut) { Text("Sign out of this phone") }
        }
        is SessionState.Active -> WorkspaceApp(
            account = session.account,
            state = state,
            onSelect = model::selectTab,
            onRefresh = model::refresh,
            onSignOut = model::signOut
        )
    }
}

@Composable
private fun SignInScreen(
    message: String?,
    busy: Boolean,
    onSignIn: (String, String) -> Unit
) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    Column(
        Modifier.fillMaxSize().padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("Restora", style = MaterialTheme.typography.displaySmall, fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary)
        Text("Welcome back", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(24.dp))
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        if (!message.isNullOrBlank()) {
            Spacer(Modifier.height(12.dp))
            Text(message, color = MaterialTheme.colorScheme.error)
        }
        Spacer(Modifier.height(20.dp))
        Button(
            onClick = { onSignIn(email, password) },
            enabled = email.isNotBlank() && password.isNotBlank() && !busy,
            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
        ) { Text(if (busy) "Signing in…" else "Sign in") }
        Text(
            "This native preview does not yet support account creation or recovery. Use the current Restora app for those actions.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 16.dp)
        )
    }
}

@Composable
private fun WorkspaceApp(
    account: Account,
    state: AppState,
    onSelect: (Tab) -> Unit,
    onRefresh: (Tab) -> Unit,
    onSignOut: () -> Unit
) {
    val workplace = account.workplace
    if (workplace == null) {
        Column(
            Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text("Select your restaurant", style = MaterialTheme.typography.headlineSmall)
            Text("Restaurant onboarding is not yet available in the native preview. You can use the existing Restora app to finish setup.")
            Spacer(Modifier.height(16.dp))
            OutlinedButton(onClick = onSignOut) { Text("Sign out") }
        }
        return
    }
    val tabs = remember(workplace.permissions) {
        Tab.entries.filter { tab -> tab.permission?.let(workplace::can) ?: true }
    }
    val selected = state.selectedTab.takeIf { it in tabs } ?: tabs.first()

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            Surface(shadowElevation = 1.dp) {
                Row(
                    Modifier.fillMaxWidth().heightIn(min = 60.dp).padding(horizontal = 18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(selected.title, style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold)
                        Text(workplace.branchName.ifBlank { workplace.restaurant.name },
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            style = MaterialTheme.typography.labelMedium,
                            maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                    if (selected != Tab.MORE) TextButton(onClick = { onRefresh(selected) }) {
                        Text("Refresh")
                    }
                }
            }
        },
        bottomBar = {
            NavigationBar {
                tabs.forEach { tab ->
                    NavigationBarItem(
                        selected = selected == tab,
                        onClick = { onSelect(tab) },
                        icon = { Text(when (tab) {
                            Tab.TODAY -> "◫"
                            Tab.ORDERS -> "☷"
                            Tab.TABLES -> "▦"
                            Tab.CUSTOMERS -> "♙"
                            Tab.MORE -> "⚙"
                        }) },
                        label = { Text(tab.title) },
                        alwaysShowLabel = true
                    )
                }
            }
        }
    ) { insets ->
        Box(Modifier.padding(insets).fillMaxSize()) {
            // Only the active tab is composed. Lazy lists create visible rows only.
            when (selected) {
                Tab.TODAY -> TodayScreen(state.today, onRefresh = { onRefresh(Tab.TODAY) })
                Tab.ORDERS -> OrdersScreen(state.orders, onRefresh = { onRefresh(Tab.ORDERS) })
                Tab.TABLES -> TablesScreen(state.tables, onRefresh = { onRefresh(Tab.TABLES) })
                Tab.CUSTOMERS -> CustomersScreen(state.customers, onRefresh = { onRefresh(Tab.CUSTOMERS) })
                Tab.MORE -> MoreScreen(account, busy = state.busy, onSignOut)
            }
        }
    }
}

@Composable
private fun <T> ContentState(
    slot: Loadable<T>,
    onRetry: () -> Unit,
    content: @Composable (T) -> Unit
) {
    val data = slot.value
    when {
        data != null -> content(data)
        slot.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        slot.error != null -> Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text(slot.error, color = MaterialTheme.colorScheme.error)
            Spacer(Modifier.height(12.dp))
            OutlinedButton(onClick = onRetry) { Text("Try again") }
        }
        else -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Nothing to show yet")
        }
    }
}

@Composable
private fun TodayScreen(slot: Loadable<Dashboard>, onRefresh: () -> Unit) {
    ContentState(slot, onRefresh) { stats ->
        val rows = listOf(
            "Sales today" to rupees(stats.sales),
            "Orders" to stats.orderCount.toString(),
            "Average order" to rupees(if (stats.orderCount == 0) 0.0 else stats.sales / stats.orderCount),
            "New customers" to stats.newCustomers.toString(),
            "Khata outstanding" to rupees(stats.khataTotal),
            "Cash collected" to rupees(stats.cash),
            "Digital collected" to rupees(stats.digital),
            "Not collected" to rupees(stats.notCollected)
        )
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(rows, key = { it.first }) { (title, value) ->
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(18.dp)) {
                        Text(title, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(value, style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

private val statusFilters = listOf(
    "new" to "New", "preparing" to "Preparing", "ready" to "Ready",
    "out_for_delivery" to "On the way", "completed" to "Done", "cancelled" to "Cancelled"
)

@Composable
private fun OrdersScreen(slot: Loadable<List<Order>>, onRefresh: () -> Unit) {
    var status by rememberSaveable { mutableStateOf("new") }
    var expanded by remember { mutableStateOf<Order?>(null) }
    ContentState(slot, onRefresh) { orders ->
        val displayed = remember(orders, status) {
            orders.filter {
                it.status == status || (status == "new" && it.status == "pending")
            }.let { filtered ->
                if (status == "completed" || status == "cancelled")
                    filtered.sortedByDescending(Order::createdAt)
                else filtered.sortedBy(Order::createdAt)
            }
        }
        Column(Modifier.fillMaxSize()) {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(statusFilters, key = { it.first }) { (value, label) ->
                    val count = orders.count {
                        it.status == value || (value == "new" && it.status == "pending")
                    }
                    FilterChip(
                        selected = status == value,
                        onClick = { status = value },
                        label = { Text("$label · $count") },
                        modifier = Modifier.heightIn(min = 48.dp)
                    )
                }
            }
            if (displayed.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No orders in this stage")
                }
            } else {
                val listState = rememberLazyListState()
                LazyColumn(
                    state = listState,
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(displayed, key = Order::id) { order ->
                        OrderRow(order = order, onClick = { expanded = order })
                    }
                }
            }
        }
    }
    expanded?.let { order ->
        AlertDialog(
            onDismissRequest = { expanded = null },
            title = { Text("Order #${order.token}") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("${order.type.replace('_', ' ')} · ${order.paymentStatus}")
                    order.items.take(8).forEach { line ->
                        Text("${line.quantity} × ${line.name} · ${rupees(line.unitPrice * line.quantity)}")
                    }
                    Text("Total: ${rupees(order.total)}", fontWeight = FontWeight.Bold)
                    Text("Editing, payment and status updates are not yet available in this preview.",
                        style = MaterialTheme.typography.bodySmall)
                }
            },
            confirmButton = {
                TextButton(onClick = { expanded = null }) { Text("Close") }
            }
        )
    }
}

@Composable
private fun OrderRow(order: Order, onClick: () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        tonalElevation = 1.dp
    ) {
        Column(Modifier.fillMaxWidth().padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("#${order.token}", style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold)
                Spacer(Modifier.weight(1f))
                Text(rupees(order.total), style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold)
            }
            Spacer(Modifier.height(6.dp))
            Text(
                buildString {
                    append(order.type.replace('_', ' '))
                    if (order.table.isNotBlank()) append(" · Table ${order.table}")
                    append(" · ${order.paymentStatus}")
                },
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (order.customer.isNotBlank()) Text(order.customer,
                fontWeight = FontWeight.Medium, modifier = Modifier.padding(top = 8.dp))
            Spacer(Modifier.height(10.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline)
            order.items.take(4).forEach { line ->
                Text("${line.quantity} × ${line.name}",
                    modifier = Modifier.padding(top = 6.dp))
            }
            if (order.items.size > 4) {
                Text("+ ${order.items.size - 4} more",
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun TablesScreen(slot: Loadable<List<FloorTable>>, onRefresh: () -> Unit) {
    ContentState(slot, onRefresh) { all ->
        val tables = remember(all) {
            all.filterNot(FloorTable::archived).sortedWith(
                compareBy(String.CASE_INSENSITIVE_ORDER) { it.name }
            )
        }
        if (tables.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No tables in this branch")
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 112.dp),
                contentPadding = PaddingValues(12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                gridItems(tables, key = FloorTable::id) { table ->
                    Card(Modifier.fillMaxWidth().heightIn(min = 104.dp)) {
                        Column(Modifier.padding(12.dp)) {
                            Text(table.name, style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold, maxLines = 1)
                            Text(
                                when {
                                    table.guestCalls > 0 -> "${table.guestCalls} guest calls"
                                    table.busyOrders > 0 -> "${table.busyOrders} open orders"
                                    else -> "Free"
                                },
                                color = if (table.guestCalls > 0) MaterialTheme.colorScheme.error
                                else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            if (table.seats > 0) Text("${table.seats} seats",
                                style = MaterialTheme.typography.bodySmall)
                            if (table.section.isNotBlank()) Text(table.section,
                                style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CustomersScreen(slot: Loadable<List<Customer>>, onRefresh: () -> Unit) {
    var search by rememberSaveable { mutableStateOf("") }
    ContentState(slot, onRefresh) { all ->
        val customers = remember(all, search) {
            val query = search.trim()
            all.filter {
                query.isEmpty() || it.name.contains(query, ignoreCase = true) ||
                    (query.any(Char::isDigit) && it.phone.contains(query.filter(Char::isDigit)))
            }
        }
        Column(Modifier.fillMaxSize()) {
            OutlinedTextField(
                value = search, onValueChange = { search = it },
                label = { Text("Name or phone") }, singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)
            )
            if (customers.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No customers found")
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(customers, key = Customer::id) { customer ->
                        Card(Modifier.fillMaxWidth()) {
                            Row(
                                Modifier.fillMaxWidth().padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(Modifier.weight(1f)) {
                                    Text(customer.name, fontWeight = FontWeight.SemiBold)
                                    Text(customer.phone,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                if (customer.khataBalance > 0.0) {
                                    Spacer(Modifier.width(8.dp))
                                    Text(rupees(customer.khataBalance),
                                        color = MaterialTheme.colorScheme.error)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MoreScreen(account: Account, busy: Boolean, onSignOut: () -> Unit) {
    var confirmSignOut by remember { mutableStateOf(false) }
    val workplace = account.workplace
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(20.dp)) {
                    Text(account.name, style = MaterialTheme.typography.titleLarge)
                    Text(account.email, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(12.dp))
                    Text(workplace?.restaurant?.name ?: "No restaurant")
                    Text(workplace?.branchName.orEmpty(),
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        item {
            Card(Modifier.fillMaxWidth()) {
                Text(
                    "Native Android preview · More settings, offline sync, printing and management tools will be added before release.",
                    modifier = Modifier.padding(18.dp)
                )
            }
        }
        item {
            OutlinedButton(
                onClick = { confirmSignOut = true },
                enabled = !busy,
                modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)
            ) { Text("Sign out") }
        }
    }
    if (confirmSignOut) {
        AlertDialog(
            onDismissRequest = { confirmSignOut = false },
            title = { Text("Sign out?") },
            text = { Text("This will remove your saved session from this phone.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmSignOut = false
                    onSignOut()
                }) { Text("Sign out") }
            },
            dismissButton = {
                TextButton(onClick = { confirmSignOut = false }) { Text("Cancel") }
            }
        )
    }
}
