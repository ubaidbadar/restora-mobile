package live.restora.nativeapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.remember
import androidx.lifecycle.viewmodel.compose.viewModel
import live.restora.nativeapp.ui.RestoraApp
import live.restora.nativeapp.ui.RestoraTheme
import live.restora.nativeapp.ui.RestoraViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val appContext = applicationContext
        setContent {
            val factory = remember { RestoraViewModel.Factory(appContext) }
            val model: RestoraViewModel = viewModel(factory = factory)
            RestoraTheme { RestoraApp(model) }
        }
    }
}
