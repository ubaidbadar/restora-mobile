package live.restora.nativeapp.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val light = lightColorScheme(
    primary = Color(0xFF4F46E5),
    onPrimary = Color.White,
    background = Color(0xFFF6F7F9),
    onBackground = Color(0xFF0F172A),
    surface = Color.White,
    onSurface = Color(0xFF0F172A),
    surfaceVariant = Color(0xFFF1F3F6),
    onSurfaceVariant = Color(0xFF5B6474),
    outline = Color(0xFFE5E7EB),
    error = Color(0xFFC24A35),
    errorContainer = Color(0xFFFCEFEC),
    onErrorContainer = Color(0xFFA3301F)
)
private val dark = darkColorScheme(
    primary = Color(0xFF6D6AF5),
    onPrimary = Color.White,
    background = Color(0xFF0B0F19),
    onBackground = Color(0xFFF1F5F9),
    surface = Color(0xFF151B28),
    onSurface = Color(0xFFF1F5F9),
    surfaceVariant = Color(0xFF1C2333),
    onSurfaceVariant = Color(0xFF9AA4B5),
    outline = Color(0xFF2A3347),
    error = Color(0xFFE0664F),
    errorContainer = Color(0xFF2B1512),
    onErrorContainer = Color(0xFFF29A87)
)

/** Token-aligned with src/global.css in the existing mobile app. */
@Composable
fun RestoraTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) dark else light,
        content = content
    )
}
