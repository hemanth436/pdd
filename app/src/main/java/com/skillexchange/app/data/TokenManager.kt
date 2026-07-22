package com.skillexchange.app.data

import android.content.Context
import android.content.SharedPreferences

class TokenManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("skillswap_auth_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USERNAME = "username"
        private const val KEY_FULL_NAME = "full_name"
        private const val KEY_EMAIL = "email"
        private const val KEY_ROLE = "user_role"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_REMEMBER_ME = "remember_me"
    }

    fun saveAuthSession(
        token: String,
        userId: String,
        username: String,
        fullName: String,
        email: String,
        role: String = "user",
        rememberMe: Boolean = true
    ) {
        prefs.edit().apply {
            putString(KEY_TOKEN, token)
            putString(KEY_USER_ID, userId)
            putString(KEY_USERNAME, username)
            putString(KEY_FULL_NAME, fullName)
            putString(KEY_EMAIL, email)
            putString(KEY_ROLE, role)
            putBoolean(KEY_IS_LOGGED_IN, true)
            putBoolean(KEY_REMEMBER_ME, rememberMe)
            apply()
        }
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun getUserId(): String = prefs.getString(KEY_USER_ID, "u_demo_1") ?: "u_demo_1"

    fun getUsername(): String = prefs.getString(KEY_USERNAME, "demouser") ?: "demouser"

    fun getFullName(): String = prefs.getString(KEY_FULL_NAME, "Demo User") ?: "Demo User"

    fun getEmail(): String = prefs.getString(KEY_EMAIL, "user@example.com") ?: "user@example.com"

    fun getRole(): String = prefs.getString(KEY_ROLE, "user") ?: "user"

    fun isLoggedIn(): Boolean = prefs.getBoolean(KEY_IS_LOGGED_IN, false)

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
