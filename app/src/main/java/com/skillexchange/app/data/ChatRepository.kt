package com.skillexchange.app.data

import com.skillexchange.app.api.MessageDto
import com.skillexchange.app.api.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ChatRepository {
    private val api = RetrofitClient.instance

    private val localMessages = mutableListOf(
        MessageDto("m1", "u2", "u_current", "Hey! I accepted your Figma UI request.", "10:15 AM"),
        MessageDto("m2", "u_current", "u2", "Awesome! When are you free for a session?", "10:16 AM"),
        MessageDto("m3", "u2", "u_current", "How about tomorrow at 4 PM EST?", "10:18 AM")
    )

    suspend fun getMessages(userId: String, peerId: String): List<MessageDto> {
        return withContext(Dispatchers.IO) {
            try {
                val res = api.getMessages(userId, peerId)
                val body = res.body()
                if (res.isSuccessful && body != null && body.isNotEmpty()) {
                    return@withContext body
                }
            } catch (_: Exception) {}

            localMessages.filter {
                (it.senderId == userId && it.receiverId == peerId) || (it.senderId == peerId && it.receiverId == userId)
            }
        }
    }

    suspend fun sendMessage(senderId: String, receiverId: String, text: String): MessageDto {
        return withContext(Dispatchers.IO) {
            val msg = MessageDto(
                id = "m_${System.currentTimeMillis()}",
                senderId = senderId,
                receiverId = receiverId,
                messageText = text,
                createdAt = "Just now"
            )
            try {
                api.sendMessage(msg)
            } catch (_: Exception) {}

            localMessages.add(msg)
            msg
        }
    }
}
