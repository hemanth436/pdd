package com.skillexchange.app.viewmodels

import androidx.lifecycle.ViewModel
import com.skillexchange.app.api.AdminStatsDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class ReportItem(
    val id: String,
    val reporterName: String,
    val reportedName: String,
    val reason: String,
    val status: String = "pending"
)

class AdminViewModel : ViewModel() {

    private val _stats = MutableStateFlow(AdminStatsDto(totalUsers = 142, totalSkills = 98, pendingRequests = 18, reportsCount = 3))
    val stats: StateFlow<AdminStatsDto> = _stats.asStateFlow()

    private val _reports = MutableStateFlow(
        listOf(
            ReportItem("rep_1", "David Miller", "User #4891", "Inappropriate profile link description", "pending"),
            ReportItem("rep_2", "Sarah Jenkins", "User #1029", "No show for agreed swap session", "pending"),
            ReportItem("rep_3", "Alex Rivera", "User #9012", "Spam messages sent to peers", "resolved")
        )
    )
    val reports: StateFlow<List<ReportItem>> = _reports.asStateFlow()

    fun resolveReport(reportId: String) {
        _reports.value = _reports.value.map {
            if (it.id == reportId) it.copy(status = "resolved") else it
        }
    }
}
