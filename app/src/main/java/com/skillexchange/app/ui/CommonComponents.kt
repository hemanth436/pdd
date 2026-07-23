package com.skillexchange.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Color Palette Definition
val DarkBackground = Color(0xFF0B0F19)
val DarkCardBg = Color(0xFF0D121F)
val DarkBorder = Color(0xFF1E293B)
val LightBackground = Color(0xFFF8FAFC)
val LightCardBg = Color(0xFFFFFFFF)
val LightBorder = Color(0xFFE2E8F0)

val PrimaryIndigo = Color(0xFF6366F1)
val PrimaryPurple = Color(0xFF8B5CF6)
val AccentEmerald = Color(0xFF10B981)
val AccentAmber = Color(0xFFF59E0B)
val AccentRose = Color(0xFFEF4444)

enum class ScreenRoute(val route: String, val title: String, val icon: ImageVector) {
    LANDING("landing", "Home", Icons.Default.Home),
    EXPLORE("explore", "Explore", Icons.Default.Search),
    DASHBOARD("dashboard", "Overview", Icons.Default.Dashboard),
    SKILLS("skills", "Skills", Icons.Default.Folder),
    REQUESTS("requests", "Requests", Icons.Default.CompareArrows),
    CHAT("chat", "Messages", Icons.Default.Chat),
    SESSIONS("sessions", "Sessions", Icons.Default.Videocam),
    PROFILE("profile", "Profile", Icons.Default.Person),
    ADMIN("admin", "Admin", Icons.Default.AdminPanelSettings)
}

@Composable
fun SkillSwapTopAppBar(
    currentRoute: String,
    isDarkTheme: Boolean,
    onToggleTheme: () -> Unit,
    onNavigateToProfile: () -> Unit
) {
    val isDark = isDarkTheme
    val bg = if (isDark) DarkCardBg else LightCardBg
    val contentColor = if (isDark) Color.White else Color(0xFF0F172A)

    Surface(
        color = bg,
        shadowElevation = 4.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = "Logo",
                    tint = PrimaryIndigo,
                    modifier = Modifier.size(26.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "SkillSwap",
                    fontWeight = FontWeight.Black,
                    fontSize = 18.sp,
                    color = PrimaryIndigo
                )
                Text(
                    text = "Exchange",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = contentColor
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onToggleTheme) {
                    Text(if (isDark) "☀️" else "🌙", fontSize = 18.sp)
                }
                IconButton(onClick = onNavigateToProfile) {
                    Icon(Icons.Default.AccountCircle, contentDescription = "Profile", tint = PrimaryIndigo)
                }
            }
        }
    }
}

@Composable
fun SkillSwapBottomNavigation(
    currentRoute: String,
    onNavigate: (String) -> Unit,
    isDarkTheme: Boolean
) {
    val bg = if (isDarkTheme) DarkCardBg else LightCardBg
    val items = listOf(
        ScreenRoute.EXPLORE,
        ScreenRoute.DASHBOARD,
        ScreenRoute.SKILLS,
        ScreenRoute.REQUESTS,
        ScreenRoute.CHAT,
        ScreenRoute.SESSIONS
    )

    NavigationBar(
        containerColor = bg,
        tonalElevation = 8.dp
    ) {
        items.forEach { screen ->
            val selected = currentRoute == screen.route
            NavigationBarItem(
                selected = selected,
                onClick = { onNavigate(screen.route) },
                alwaysShowLabel = true,
                icon = {
                    Icon(
                        imageVector = screen.icon,
                        contentDescription = screen.title,
                        tint = if (selected) PrimaryIndigo else Color(0xFF94A3B8),
                        modifier = Modifier.size(20.dp)
                    )
                },
                label = {
                    Text(
                        text = screen.title,
                        fontSize = 9.sp,
                        maxLines = 1,
                        softWrap = false,
                        overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                        color = if (selected) PrimaryIndigo else Color(0xFF94A3B8)
                    )
                }
            )
        }
    }
}

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    isDarkTheme: Boolean = true,
    content: @Composable ColumnScope.() -> Unit
) {
    val bg = if (isDarkTheme) DarkCardBg else LightCardBg
    val border = if (isDarkTheme) DarkBorder else LightBorder

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(bg)
            .border(1.dp, border, RoundedCornerShape(20.dp))
            .padding(16.dp)
    ) {
        Column {
            content()
        }
    }
}

@Composable
fun GradientButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    enabled: Boolean = true
) {
    Button(
        onClick = onClick,
        enabled = enabled && !isLoading,
        modifier = modifier
            .height(48.dp)
            .background(
                brush = Brush.horizontalGradient(listOf(PrimaryIndigo, PrimaryPurple)),
                shape = RoundedCornerShape(12.dp)
            ),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
        shape = RoundedCornerShape(12.dp)
    ) {
        if (isLoading) {
            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
        } else {
            Text(text, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
    }
}

@Composable
fun CategoryBadge(category: String, isDarkTheme: Boolean = true) {
    val bg = PrimaryIndigo.copy(alpha = 0.15f)
    Text(
        text = category.uppercase(),
        fontSize = 9.sp,
        fontWeight = FontWeight.ExtraBold,
        color = PrimaryIndigo,
        modifier = Modifier
            .background(bg, RoundedCornerShape(50.dp))
            .border(1.dp, PrimaryIndigo.copy(alpha = 0.3f), RoundedCornerShape(50.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    )
}
