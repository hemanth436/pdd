package com.skillexchange.app.api

import kotlinx.serialization.Serializable

@Serializable
data class Skill(
    val id: Int? = null,
    val title: String,
    val description: String,
    val category: String,
    val user_id: String? = null,
    val owner_name: String? = "Anonymous"
) {
    val ownerName: String get() = owner_name ?: "Anonymous"
}

@Serializable
data class Profile(
    val id: String,
    val full_name: String,
    val email: String,
    val bio: String? = null
)
