package com.skillexchange.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skillexchange.app.api.SkillDto
import com.skillexchange.app.data.RequestRepository
import com.skillexchange.app.data.SkillRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MarketplaceViewModel(
    private val repository: SkillRepository = SkillRepository(),
    private val requestRepository: RequestRepository = RequestRepository()
) : ViewModel() {

    private val _skills = MutableStateFlow<List<SkillDto>>(emptyList())
    val skills: StateFlow<List<SkillDto>> = _skills.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedCategory = MutableStateFlow("")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _selectedType = MutableStateFlow("")
    val selectedType: StateFlow<String> = _selectedType.asStateFlow()

    private val _requestedSkillIds = MutableStateFlow<Set<String>>(emptySet())
    val requestedSkillIds: StateFlow<Set<String>> = _requestedSkillIds.asStateFlow()

    private val _userMessage = MutableStateFlow<String?>(null)
    val userMessage: StateFlow<String?> = _userMessage.asStateFlow()

    init {
        fetchSkills()
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
        fetchSkills()
    }

    fun setCategory(category: String) {
        _selectedCategory.value = category
        fetchSkills()
    }

    fun setType(type: String) {
        _selectedType.value = type
        fetchSkills()
    }

    fun fetchSkills() {
        viewModelScope.launch {
            _isLoading.value = true
            val results = repository.getSkills(
                category = _selectedCategory.value.ifEmpty { null },
                type = _selectedType.value.ifEmpty { null },
                search = _searchQuery.value.ifEmpty { null }
            )
            _skills.value = results
            _isLoading.value = false
        }
    }

    fun sendSwapRequest(requesterId: String, skill: SkillDto) {
        viewModelScope.launch {
            _requestedSkillIds.value = _requestedSkillIds.value + skill.id
            requestRepository.createRequest(requesterId, skill.userId, skill.id)
            _userMessage.value = "Swap request sent for ${skill.title}!"
        }
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }
}
