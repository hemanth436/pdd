package com.skillexchange.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skillexchange.app.api.MessageDto
import com.skillexchange.app.data.ChatRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PeerContact(
    val id: String,
    val fullName: String,
    val username: String,
    val category: String,
    val isOnline: Boolean = true
)

class ChatViewModel(
    private val repository: ChatRepository = ChatRepository()
) : ViewModel() {

    private val _contacts = MutableStateFlow<List<PeerContact>>(
        listOf(
            PeerContact("u2", "Alex Rivera", "alex", "Interactive Figma Interfaces", true),
            PeerContact("u1", "Sarah Jenkins", "sarah", "Swift & iOS Architecture", false),
            PeerContact("u3", "Dr. Kenji Sato", "kenji", "PyTorch ML Deep Learning", true)
        )
    )
    val contacts: StateFlow<List<PeerContact>> = _contacts.asStateFlow()

    private val _selectedPeer = MutableStateFlow<PeerContact?>(_contacts.value.firstOrNull())
    val selectedPeer: StateFlow<PeerContact?> = _selectedPeer.asStateFlow()

    private val _messages = MutableStateFlow<List<MessageDto>>(emptyList())
    val messages: StateFlow<List<MessageDto>> = _messages.asStateFlow()

    fun selectPeer(userId: String, peer: PeerContact) {
        _selectedPeer.value = peer
        loadMessages(userId, peer.id)
    }

    fun loadMessages(userId: String, peerId: String) {
        viewModelScope.launch {
            val list = repository.getMessages(userId, peerId)
            _messages.value = list
        }
    }

    fun sendMessage(userId: String, messageText: String) {
        val peer = _selectedPeer.value ?: return
        if (messageText.isBlank()) return

        viewModelScope.launch {
            val sent = repository.sendMessage(userId, peer.id, messageText)
            _messages.value = _messages.value + sent
        }
    }
}
