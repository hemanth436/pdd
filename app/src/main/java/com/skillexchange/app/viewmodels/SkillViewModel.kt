package com.skillexchange.app.viewmodels

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skillexchange.app.api.Skill
import com.skillexchange.app.api.SupabaseConfig
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.launch

class SkillViewModel : ViewModel() {
    var skills = mutableStateOf<List<Skill>>(emptyList())
    var isLoading = mutableStateOf(false)
    var errorMessage = mutableStateOf("")

    fun fetchSkills() {
        viewModelScope.launch {
            isLoading.value = true
            try {
                val result = SupabaseConfig.client.postgrest["skills"].select().decodeList<Skill>()
                skills.value = result
            } catch (e: Exception) {
                errorMessage.value = e.message ?: "Unknown error"
            } finally {
                isLoading.value = false
            }
        }
    }

    fun addSkill(title: String, description: String, category: String) {
        viewModelScope.launch {
            try {
                val newSkill = Skill(title = title, description = description, category = category)
                SupabaseConfig.client.postgrest["skills"].insert(newSkill)
                fetchSkills() // Refresh list
            } catch (e: Exception) {
                errorMessage.value = e.message ?: "Failed to add skill"
            }
        }
    }
}
