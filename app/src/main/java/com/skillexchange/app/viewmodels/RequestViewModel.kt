package com.skillexchange.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skillexchange.app.api.RequestDto
import com.skillexchange.app.data.RequestRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class RequestViewModel(
    private val repository: RequestRepository = RequestRepository()
) : ViewModel() {

    private val _sentRequests = MutableStateFlow<List<RequestDto>>(emptyList())
    val sentRequests: StateFlow<List<RequestDto>> = _sentRequests.asStateFlow()

    private val _receivedRequests = MutableStateFlow<List<RequestDto>>(emptyList())
    val receivedRequests: StateFlow<List<RequestDto>> = _receivedRequests.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _notification = MutableStateFlow<String?>(null)
    val notification: StateFlow<String?> = _notification.asStateFlow()

    fun loadRequests(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val (sent, received) = repository.getRequests(userId)
            _sentRequests.value = sent
            _receivedRequests.value = received
            _isLoading.value = false
        }
    }

    fun updateStatus(userId: String, requestId: String, status: String) {
        viewModelScope.launch {
            _receivedRequests.value = _receivedRequests.value.map {
                if (it.id == requestId) it.copy(status = status) else it
            }
            repository.updateRequestStatus(requestId, status)
            _notification.value = "Swap request $status!"
            loadRequests(userId)
        }
    }

    fun clearNotification() {
        _notification.value = null
    }
}
