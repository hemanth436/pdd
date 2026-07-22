package com.skillexchange.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF6366f1),
    secondary = Color(0xFF10b981),
    tertiary = Color(0xFFf59e0b)
)

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF4f46e5),
    secondary = Color(0xFF10b981),
    tertiary = Color(0xFFf59e0b),
    background = Color(0xFFF9FAFB)
)

@Composable
fun SkillExchangeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
