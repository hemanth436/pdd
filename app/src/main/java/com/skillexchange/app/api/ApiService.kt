package com.skillexchange.app.api

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.*

// Data Models
data class ApiResponse<T>(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: T?
)

data class User(
    @SerializedName("id") val id: Int,
    @SerializedName("full_name") val fullName: String,
    @SerializedName("username") val username: String
)


interface ApiService {
    @FormUrlEncoded
    @POST("auth.php?action=login")
    suspend fun login(
        @Field("username") username: String,
        @Field("password") password: String
    ): Response<ApiResponse<User>>

    @GET("skills.php?action=list")
    suspend fun getSkills(): Response<ApiResponse<List<Skill>>>
}
