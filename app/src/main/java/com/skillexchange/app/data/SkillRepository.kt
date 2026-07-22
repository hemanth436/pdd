package com.skillexchange.app.data

import com.skillexchange.app.api.CreateSkillBody
import com.skillexchange.app.api.RetrofitClient
import com.skillexchange.app.api.SkillDto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class SkillRepository {

    private val api = RetrofitClient.instance

    private val fallbackSkills = mutableListOf(
        SkillDto(
            id = "s101",
            userId = "u1",
            title = "Swift & iOS Core Architecture",
            description = "Learn MVC/MVVM layout modeling, state widgets, and API fetching bindings in SwiftUI.",
            category = "Mobile Development",
            type = "offered",
            ownerName = "Sarah Jenkins",
            ownerAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
        ),
        SkillDto(
            id = "s102",
            userId = "u2",
            title = "Interactive Figma Interfaces",
            description = "Figma component variables, auto layouts, and responsive prototyping rules.",
            category = "Graphic Design",
            type = "offered",
            ownerName = "Alex Rivera",
            ownerAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        ),
        SkillDto(
            id = "s103",
            userId = "u3",
            title = "PyTorch ML Deep Learning",
            description = "Gradient descents, convolution neural nets (CNN), and model weight optimization.",
            category = "AI & Machine Learning",
            type = "offered",
            ownerName = "Dr. Kenji Sato",
            ownerAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        ),
        SkillDto(
            id = "s104",
            userId = "u4",
            title = "Full-Stack Node.js & Supabase",
            description = "Express REST APIs, Postgres Row-Level Security, and Real-Time WebSocket channels.",
            category = "Web Development",
            type = "requested",
            ownerName = "Michael Chang",
            ownerAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
        )
    )

    suspend fun getSkills(category: String? = null, type: String? = null, search: String? = null, userId: String? = null): List<SkillDto> {
        return withContext(Dispatchers.IO) {
            try {
                val response = api.getSkills(category, type, search, userId)
                if (response.isSuccessful && response.body() != null) {
                    val remote = response.body()!!
                    if (remote.isNotEmpty()) return@withContext remote
                }
            } catch (_: Exception) {
                // Offline fallback logic
            }

            // Filter fallback skills
            var list = fallbackSkills.toList()
            if (!category.isNullOrBlank()) {
                list = list.filter { it.category.equals(category, ignoreCase = true) }
            }
            if (!type.isNullOrBlank()) {
                list = list.filter { it.type.equals(type, ignoreCase = true) }
            }
            if (!search.isNullOrBlank()) {
                val query = search.lowercase()
                list = list.filter { it.title.lowercase().contains(query) || it.description.lowercase().contains(query) }
            }
            if (!userId.isNullOrBlank()) {
                list = list.filter { it.userId == userId }
            }
            list
        }
    }

    suspend fun createSkill(userId: String, title: String, description: String, category: String, type: String): Result<SkillDto> {
        return withContext(Dispatchers.IO) {
            val body = CreateSkillBody(userId, title, description, category, type)
            try {
                val response = api.createSkill(body)
                val created = response.body()
                if (response.isSuccessful && created != null) {
                    fallbackSkills.add(0, created)
                    return@withContext Result.success(created)
                }
            } catch (_: Exception) { }

            // Local fallback creation
            val newSkill = SkillDto(
                id = "s_${System.currentTimeMillis()}",
                userId = userId,
                title = title,
                description = description,
                category = category,
                type = type,
                ownerName = "Current User"
            )
            fallbackSkills.add(0, newSkill)
            Result.success(newSkill)
        }
    }

    suspend fun deleteSkill(skillId: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                api.deleteSkill(skillId)
            } catch (_: Exception) {}
            fallbackSkills.removeAll { it.id == skillId }
            true
        }
    }
}
