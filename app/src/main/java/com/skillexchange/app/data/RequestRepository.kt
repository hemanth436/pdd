package com.skillexchange.app.data

import com.skillexchange.app.api.CreateRequestBody
import com.skillexchange.app.api.RequestDto
import com.skillexchange.app.api.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class RequestRepository {
    private val api = RetrofitClient.instance

    private val fallbackSent = mutableListOf(
        RequestDto(
            id = "req_101",
            requesterId = "u_current",
            providerId = "u1",
            skillId = "s101",
            status = "pending",
            createdAt = "2026-07-20",
            requesterName = "You",
            providerName = "Sarah Jenkins",
            skillTitle = "Swift & iOS Core Architecture"
        )
    )

    private val fallbackReceived = mutableListOf(
        RequestDto(
            id = "req_102",
            requesterId = "u2",
            providerId = "u_current",
            skillId = "s102",
            status = "accepted",
            createdAt = "2026-07-21",
            requesterName = "Alex Rivera",
            providerName = "You",
            skillTitle = "Interactive Figma Interfaces"
        )
    )

    suspend fun getRequests(userId: String): Pair<List<RequestDto>, List<RequestDto>> {
        return withContext(Dispatchers.IO) {
            try {
                val res = api.getRequests(userId)
                if (res.isSuccessful && res.body() != null) {
                    val sent = res.body()!!["sent"] ?: emptyList()
                    val received = res.body()!!["received"] ?: emptyList()
                    return@withContext Pair(sent, received)
                }
            } catch (_: Exception) {}

            Pair(fallbackSent.toList(), fallbackReceived.toList())
        }
    }

    suspend fun createRequest(requesterId: String, providerId: String, skillId: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                api.createRequest(CreateRequestBody(requesterId, providerId, skillId))
            } catch (_: Exception) {}

            val newReq = RequestDto(
                id = "req_${System.currentTimeMillis()}",
                requesterId = requesterId,
                providerId = providerId,
                skillId = skillId,
                status = "pending",
                createdAt = "Just now",
                requesterName = "You",
                providerName = "Peer Instructor",
                skillTitle = "Skill Swap Inquiry"
            )
            fallbackSent.add(0, newReq)
            true
        }
    }

    suspend fun updateRequestStatus(requestId: String, status: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                api.updateRequestStatus(requestId, mapOf("status" to status))
            } catch (_: Exception) {}

            var index = fallbackReceived.indexOfFirst { it.id == requestId }
            if (index != -1) {
                fallbackReceived[index] = fallbackReceived[index].copy(status = status)
            }
            index = fallbackSent.indexOfFirst { it.id == requestId }
            if (index != -1) {
                fallbackSent[index] = fallbackSent[index].copy(status = status)
            }
            true
        }
    }
}
