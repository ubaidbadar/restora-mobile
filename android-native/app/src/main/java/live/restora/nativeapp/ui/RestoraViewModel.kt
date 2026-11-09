package live.restora.nativeapp.ui

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.withContext
import live.restora.nativeapp.data.Account
import live.restora.nativeapp.data.ApiException
import live.restora.nativeapp.data.Customer
import live.restora.nativeapp.data.Dashboard
import live.restora.nativeapp.data.FloorTable
import live.restora.nativeapp.data.Order
import live.restora.nativeapp.data.RestoraApi
import live.restora.nativeapp.data.RestoraRepository
import live.restora.nativeapp.data.SecureCookieStore

enum class Tab(val title: String, val permission: String?) {
    TODAY("Today", "reports:view"),
    ORDERS("Orders", "orders:view"),
    TABLES("Tables", "tables:view"),
    CUSTOMERS("Customers", "customers:view"),
    MORE("More", null)
}

sealed interface SessionState {
    data object Loading : SessionState
    data class SignedOut(val message: String? = null) : SessionState
    data class Active(val account: Account) : SessionState
    data class ConnectionError(val message: String) : SessionState
}

data class Loadable<T>(val value: T? = null, val loading: Boolean = false, val error: String? = null)

data class AppState(
    val session: SessionState = SessionState.Loading,
    val selectedTab: Tab = Tab.ORDERS,
    val busy: Boolean = false,
    val today: Loadable<Dashboard> = Loadable(),
    val orders: Loadable<List<Order>> = Loadable(),
    val tables: Loadable<List<FloorTable>> = Loadable(),
    val customers: Loadable<List<Customer>> = Loadable()
)

/**
 * A single UDF state holder. UI never initiates requests from the body of a composable.
 * Tab data is loaded once on first selection and only reloaded by an explicit refresh.
 */
class RestoraViewModel(private val repository: RestoraRepository) : ViewModel() {
    private val mutableState = MutableStateFlow(AppState())
    val state: StateFlow<AppState> = mutableState.asStateFlow()
    private val loadedTabs = mutableSetOf<Tab>()
    private val loadingTabs = mutableSetOf<Tab>()

    init {
        restoreSession()
    }

    fun restoreSession() {
        mutableState.update { it.copy(session = SessionState.Loading) }
        viewModelScope.launch {
            try {
                val exists = withContext(Dispatchers.IO) { repository.hasSession() }
                if (!exists) {
                    mutableState.update { it.copy(session = SessionState.SignedOut()) }
                    return@launch
                }
                openSession(repository.restore())
            } catch (error: ApiException) {
                mutableState.update {
                    it.copy(session = if (error.status == 401)
                        SessionState.SignedOut() else SessionState.ConnectionError(error.userMessage()))
                }
            } catch (error: Exception) {
                mutableState.update {
                    it.copy(session = SessionState.ConnectionError(error.userMessage()))
                }
            }
        }
    }

    fun signInWithGoogle(idToken: String, nonce: String) {
        if (mutableState.value.busy || idToken.isBlank() || nonce.isBlank()) return
        mutableState.update { it.copy(busy = true, session = SessionState.SignedOut()) }
        viewModelScope.launch {
            try {
                openSession(repository.authenticateWithGoogle(idToken, nonce))
            } catch (error: Exception) {
                mutableState.update { it.copy(session = SessionState.SignedOut(error.userMessage())) }
            } finally {
                mutableState.update { it.copy(busy = false) }
            }
        }
    }

    fun signIn(email: String, password: String) {
        if (email.isBlank() || password.isBlank() || mutableState.value.busy) return
        mutableState.update { it.copy(busy = true, session = SessionState.SignedOut()) }
        viewModelScope.launch {
            try {
                openSession(repository.authenticate(email.trim(), password))
            } catch (error: Exception) {
                mutableState.update { it.copy(session = SessionState.SignedOut(error.userMessage())) }
            } finally {
                mutableState.update { it.copy(busy = false) }
            }
        }
    }

    private fun openSession(account: Account) {
        loadedTabs.clear()
        loadingTabs.clear()
        val first = Tab.entries.firstOrNull { tab ->
            tab.permission?.let { account.workplace?.can(it) } == true
        } ?: Tab.MORE
        mutableState.value = AppState(
            session = SessionState.Active(account),
            selectedTab = first
        )
        selectTab(first)
    }

    fun selectTab(tab: Tab) {
        val account = (mutableState.value.session as? SessionState.Active)?.account ?: return
        val permission = tab.permission
        if (permission != null && account.workplace?.can(permission) != true) return
        mutableState.update { it.copy(selectedTab = tab) }
        if (loadedTabs.add(tab)) refresh(tab)
    }

    fun refresh(tab: Tab = mutableState.value.selectedTab) {
        if (!loadingTabs.add(tab) || tab == Tab.MORE) {
            loadingTabs.remove(Tab.MORE)
            return
        }
        when (tab) {
            Tab.TODAY -> mutableState.update { it.copy(today = it.today.copy(loading = true, error = null)) }
            Tab.ORDERS -> mutableState.update { it.copy(orders = it.orders.copy(loading = true, error = null)) }
            Tab.TABLES -> mutableState.update { it.copy(tables = it.tables.copy(loading = true, error = null)) }
            Tab.CUSTOMERS -> mutableState.update { it.copy(customers = it.customers.copy(loading = true, error = null)) }
            Tab.MORE -> Unit
        }
        viewModelScope.launch {
            try {
                when (tab) {
                    Tab.TODAY -> {
                        val answer = repository.dashboard()
                        mutableState.update { it.copy(today = Loadable(value = answer)) }
                    }
                    Tab.ORDERS -> {
                        val answer = repository.orders()
                        mutableState.update { it.copy(orders = Loadable(value = answer)) }
                    }
                    Tab.TABLES -> {
                        val answer = repository.tables()
                        mutableState.update { it.copy(tables = Loadable(value = answer)) }
                    }
                    Tab.CUSTOMERS -> {
                        val answer = repository.customers()
                        mutableState.update { it.copy(customers = Loadable(value = answer)) }
                    }
                    Tab.MORE -> Unit
                }
            } catch (error: Exception) {
                val message = error.userMessage()
                when (tab) {
                    Tab.TODAY -> mutableState.update { it.copy(today = it.today.copy(loading = false, error = message)) }
                    Tab.ORDERS -> mutableState.update { it.copy(orders = it.orders.copy(loading = false, error = message)) }
                    Tab.TABLES -> mutableState.update { it.copy(tables = it.tables.copy(loading = false, error = message)) }
                    Tab.CUSTOMERS -> mutableState.update { it.copy(customers = it.customers.copy(loading = false, error = message)) }
                    Tab.MORE -> Unit
                }
            } finally {
                loadingTabs.remove(tab)
            }
        }
    }

    fun signOut() {
        if (mutableState.value.busy) return
        mutableState.update { it.copy(busy = true) }
        viewModelScope.launch {
            try {
                repository.signOut()
            } catch (_: Exception) {
                // Repository clears the local secure credential even if offline.
            } finally {
                loadedTabs.clear()
                loadingTabs.clear()
                mutableState.value = AppState(session = SessionState.SignedOut())
            }
        }
    }

    private fun Exception.userMessage(): String =
        if (this is ApiException && message.isNullOrBlank()) "HTTP $status"
        else message?.takeIf { it.isNotBlank() } ?: "Could not connect. Try again."

    class Factory(private val context: Context) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
            require(modelClass.isAssignableFrom(RestoraViewModel::class.java))
            val repository = RestoraRepository(RestoraApi(SecureCookieStore(context)))
            @Suppress("UNCHECKED_CAST")
            return RestoraViewModel(repository) as T
        }
    }
}
