package com.skillexchange.app.api

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("status") val status: String? = "success",
    @SerializedName("message") val message: String? = "OK",
    @SerializedName("data") val data: T? = null
)

data class UserDto(
    @SerializedName("id") val id: String = "u1",
    @SerializedName("username") val username: String = "user",
    @SerializedName("full_name") val fullName: String = "User",
    @SerializedName("email") val email: String = "user@example.com",
    @SerializedName("role") val role: String = "user",
    @SerializedName("mobile_number") val mobileNumber: String? = null,
    @SerializedName("bio") val bio: String? = null,
    @SerializedName("skills_offered") val skillsOffered: String? = null,
    @SerializedName("skills_needed") val skillsNeeded: String? = null,
    @SerializedName("experience") val experience: String? = null,
    @SerializedName("education") val education: String? = null,
    @SerializedName("profile_photo") val profilePhoto: String? = null
)

data class SkillDto(
    @SerializedName("_id") val id: String = "",
    @SerializedName("userId") val userId: String = "",
    @SerializedName("title") val title: String = "",
    @SerializedName("description") val description: String = "",
    @SerializedName("category") val category: String = "Programming",
    @SerializedName("type") val type: String = "offered",
    @SerializedName("ownerName") val ownerName: String = "Instructor",
    @SerializedName("ownerAvatar") val ownerAvatar: String = ""
)

data class RequestDto(
    @SerializedName("_id") val id: String = "",
    @SerializedName("requesterId") val requesterId: String = "",
    @SerializedName("providerId") val providerId: String = "",
    @SerializedName("skillId") val skillId: String = "",
    @SerializedName("status") val status: String = "pending",
    @SerializedName("createdAt") val createdAt: String = "",
    @SerializedName("requesterName") val requesterName: String = "Requester",
    @SerializedName("providerName") val providerName: String = "Provider",
    @SerializedName("skillTitle") val skillTitle: String = "Skill Swap"
)

data class MessageDto(
    @SerializedName("_id") val id: String = "",
    @SerializedName("senderId") val senderId: String = "",
    @SerializedName("receiverId") val receiverId: String = "",
    @SerializedName("messageText") val messageText: String = "",
    @SerializedName("createdAt") val createdAt: String = ""
)

data class FeedbackBody(
    val name: String,
    val email: String,
    val messageText: String
)

data class CreateSkillBody(
    val userId: String,
    val title: String,
    val description: String,
    val category: String,
    val type: String
)

data class CreateRequestBody(
    val requesterId: String,
    val providerId: String,
    val skillId: String
)

data class AdminStatsDto(
    val totalUsers: Int = 124,
    val totalSkills: Int = 86,
    val pendingRequests: Int = 14,
    val reportsCount: Int = 2
)
