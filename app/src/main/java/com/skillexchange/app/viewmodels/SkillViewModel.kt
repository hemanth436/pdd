package com.skillexchange.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skillexchange.app.api.SkillDto
import com.skillexchange.app.data.SkillRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SkillViewModel(
    private val repository: SkillRepository = SkillRepository()
) : ViewModel() {

    private val _userSkills = MutableStateFlow<List<SkillDto>>(emptyList())
    val userSkills: StateFlow<List<SkillDto>> = _userSkills.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    fun fetchUserSkills(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val results = repository.getSkills(userId = userId)
            _userSkills.value = results
            _isLoading.value = false
        }
    }

    fun addSkill(userId: String, title: String, description: String, category: String, type: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.createSkill(userId, title, description, category, type)
            if (result.isSuccess) {
                _actionMessage.value = "Skill listing created successfully!"
                fetchUserSkills(userId)
            } else {
                _actionMessage.value = "Failed to create listing."
            }
            _isLoading.value = false
        }
    }

    fun deleteSkill(userId: String, skillId: String) {
        viewModelScope.launch {
            repository.deleteSkill(skillId)
            _actionMessage.value = "Skill deleted."
            fetchUserSkills(userId)
        }
    }

    fun clearActionMessage() {
        _actionMessage.value = null
    }
}
