package com.skillexchange.app.api

import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @FormUrlEncoded
    @POST("api/auth/login")
    suspend fun login(
        @Field("username") username: String,
        @Field("password") password: String
    ): Response<ApiResponse<UserDto>>

    @POST("api/auth/register")
    suspend fun register(
        @Body user: UserDto
    ): Response<ApiResponse<UserDto>>

    @GET("api/skills")
    suspend fun getSkills(
        @Query("category") category: String? = null,
        @Query("type") type: String? = null,
        @Query("search") search: String? = null,
        @Query("userId") userId: String? = null
    ): Response<List<SkillDto>>

    @POST("api/skills")
    suspend fun createSkill(
        @Body body: CreateSkillBody
    ): Response<SkillDto>

    @DELETE("api/skills/{id}")
    suspend fun deleteSkill(
        @Path("id") skillId: String
    ): Response<Void>

    @GET("api/requests")
    suspend fun getRequests(
        @Query("userId") userId: String
    ): Response<Map<String, List<RequestDto>>>

    @POST("api/requests")
    suspend fun createRequest(
        @Body body: CreateRequestBody
    ): Response<RequestDto>

    @PUT("api/requests/{id}")
    suspend fun updateRequestStatus(
        @Path("id") requestId: String,
        @Body body: Map<String, String>
    ): Response<RequestDto>

    @GET("api/messages")
    suspend fun getMessages(
        @Query("userId") userId: String,
        @Query("peerId") peerId: String
    ): Response<List<MessageDto>>

    @POST("api/messages")
    suspend fun sendMessage(
        @Body message: MessageDto
    ): Response<MessageDto>

    @POST("api/feedback")
    suspend fun submitFeedback(
        @Body feedback: FeedbackBody
    ): Response<ApiResponse<String>>

    @GET("api/status")
    suspend fun getStatus(): Response<Map<String, Any>>
}
