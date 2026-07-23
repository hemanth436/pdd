package com.skillexchange.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.skillexchange.app.data.TokenManager
import com.skillexchange.app.screens.*
import com.skillexchange.app.ui.ScreenRoute
import com.skillexchange.app.ui.SkillSwapBottomNavigation
import com.skillexchange.app.ui.SkillSwapTopAppBar
import com.skillexchange.app.ui.theme.SkillExchangeTheme
import com.skillexchange.app.viewmodels.*

class MainActivity : ComponentActivity() {

    private lateinit var tokenManager: TokenManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tokenManager = TokenManager(this)

        setContent {
            var isDarkTheme by remember { mutableStateOf(true) }
            val navController = rememberNavController()
            val navBackStackEntry by navController.currentBackStackEntryAsState()
            val currentRoute = navBackStackEntry?.destination?.route ?: ScreenRoute.LANDING.route

            val marketplaceViewModel: MarketplaceViewModel = viewModel()
            val skillViewModel: SkillViewModel = viewModel()
            val requestViewModel: RequestViewModel = viewModel()
            val chatViewModel: ChatViewModel = viewModel()
            val profileViewModel: ProfileViewModel = viewModel()
            val adminViewModel: AdminViewModel = viewModel()

            val showBottomNav = currentRoute in listOf(
                ScreenRoute.EXPLORE.route,
                ScreenRoute.DASHBOARD.route,
                ScreenRoute.SKILLS.route,
                ScreenRoute.REQUESTS.route,
                ScreenRoute.CHAT.route,
                ScreenRoute.SESSIONS.route
            )

            SkillExchangeTheme(darkTheme = isDarkTheme) {
                Scaffold(
                    topBar = {
                        if (currentRoute != "login" && currentRoute != "register") {
                            SkillSwapTopAppBar(
                                currentRoute = currentRoute,
                                isDarkTheme = isDarkTheme,
                                onToggleTheme = { isDarkTheme = !isDarkTheme },
                                onNavigateToProfile = { navController.navigate("profile") }
                            )
                        }
                    },
                    bottomBar = {
                        if (showBottomNav) {
                            SkillSwapBottomNavigation(
                                currentRoute = currentRoute,
                                onNavigate = { route -> navController.navigate(route) },
                                isDarkTheme = isDarkTheme
                            )
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = if (tokenManager.isLoggedIn()) ScreenRoute.DASHBOARD.route else ScreenRoute.LANDING.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(ScreenRoute.LANDING.route) {
                            LandingScreen(navController = navController, isDarkTheme = isDarkTheme)
                        }
                        composable("login") {
                            LoginScreen(
                                navController = navController,
                                onLoginSuccess = {
                                    tokenManager.saveAuthSession("dummy_token", "u_current", "user", "Demo User", "user@example.com")
                                    navController.navigate(ScreenRoute.DASHBOARD.route) {
                                        popUpTo(ScreenRoute.LANDING.route) { inclusive = true }
                                    }
                                }
                            )
                        }
                        composable("register") {
                            RegisterScreen(
                                navController = navController,
                                onRegisterSuccess = { fullName, email ->
                                    tokenManager.saveAuthSession(
                                        "token_" + System.currentTimeMillis(),
                                        "u_" + System.currentTimeMillis(),
                                        "user",
                                        if (fullName.isNotBlank()) fullName else "New User",
                                        if (email.isNotBlank()) email else "user@example.com"
                                    )
                                    navController.navigate(ScreenRoute.DASHBOARD.route) {
                                        popUpTo(ScreenRoute.LANDING.route) { inclusive = true }
                                    }
                                }
                            )
                        }
                        composable(ScreenRoute.EXPLORE.route) {
                            MarketplaceScreen(
                                navController = navController,
                                viewModel = marketplaceViewModel,
                                isDarkTheme = isDarkTheme,
                                currentUserId = tokenManager.getUserId()
                            )
                        }
                        composable(ScreenRoute.DASHBOARD.route) {
                            DashboardScreen(navController = navController, viewModel = skillViewModel)
                        }
                        composable(ScreenRoute.SKILLS.route) {
                            MySkillsScreen(
                                navController = navController,
                                viewModel = skillViewModel,
                                isDarkTheme = isDarkTheme,
                                currentUserId = tokenManager.getUserId()
                            )
                        }
                        composable(ScreenRoute.REQUESTS.route) {
                            RequestsScreen(
                                navController = navController,
                                viewModel = requestViewModel,
                                isDarkTheme = isDarkTheme,
                                currentUserId = tokenManager.getUserId()
                            )
                        }
                        composable(ScreenRoute.CHAT.route) {
                            ChatScreen(navController = navController, userName = "Alex Rivera")
                        }
                        composable(ScreenRoute.SESSIONS.route) {
                            SessionsScreen(navController = navController, isDarkTheme = isDarkTheme)
                        }
                        composable(ScreenRoute.PROFILE.route) {
                            ProfileScreen(
                                navController = navController,
                                viewModel = profileViewModel,
                                isDarkTheme = isDarkTheme,
                                onLogout = {
                                    tokenManager.clearSession()
                                    navController.navigate("login") {
                                        popUpTo(0)
                                    }
                                }
                            )
                        }
                        composable(ScreenRoute.ADMIN.route) {
                            AdminScreen(navController = navController, viewModel = adminViewModel, isDarkTheme = isDarkTheme)
                        }
                    }
                }
            }
        }
    }
}
