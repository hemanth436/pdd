package com.skillexchange.app.viewmodels

import androidx.lifecycle.ViewModel
import com.skillexchange.app.api.UserDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class ProfileViewModel : ViewModel() {

    private val _currentUser = MutableStateFlow(
        UserDto(
            id = "u_current",
            username = "hemanth_dev",
            fullName = "Hemanth Reddy",
            email = "hemanth@example.com",
            role = "admin",
            mobileNumber = "+1 (555) 019-2831",
            bio = "Full-stack developer passionate about peer learning and Android app architectures.",
            skillsOffered = "Web & Android Development",
            skillsNeeded = "AI & Machine Learning",
            experience = "5 Years in Software Engineering",
            education = "B.Tech Computer Science"
        )
    )
    val currentUser: StateFlow<UserDto> = _currentUser.asStateFlow()

    private val _saveMessage = MutableStateFlow<String?>(null)
    val saveMessage: StateFlow<String?> = _saveMessage.asStateFlow()

    fun updateProfile(
        fullName: String,
        email: String,
        mobileNumber: String,
        bio: String,
        skillsOffered: String,
        skillsNeeded: String,
        experience: String,
        education: String
    ) {
        val updated = _currentUser.value.copy(
            fullName = fullName,
            email = email,
            mobileNumber = mobileNumber,
            bio = bio,
            skillsOffered = skillsOffered,
            skillsNeeded = skillsNeeded,
            experience = experience,
            education = education
        )
        _currentUser.value = updated
        _saveMessage.value = "Profile updated successfully!"
    }

    fun clearSaveMessage() {
        _saveMessage.value = null
    }
}
