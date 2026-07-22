package com.skillexchange.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.skillexchange.app.api.RequestDto
import com.skillexchange.app.ui.*
import com.skillexchange.app.viewmodels.RequestViewModel

@Composable
fun RequestsScreen(
    navController: NavController,
    viewModel: RequestViewModel,
    isDarkTheme: Boolean,
    currentUserId: String = "u_current"
) {
    val sentRequests by viewModel.sentRequests.collectAsState()
    val receivedRequests by viewModel.receivedRequests.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val notification by viewModel.notification.collectAsState()

    var selectedTabIndex by remember { mutableIntStateOf(0) }

    val bg = if (isDarkTheme) DarkBackground else LightBackground
    val textColor = if (isDarkTheme) Color.White else Color(0xFF0F172A)
    val subTextColor = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B)

    LaunchedEffect(currentUserId) {
        viewModel.loadRequests(currentUserId)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .padding(16.dp)
    ) {
        Text("Swap Inquiries & Requests", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = textColor)
        Text("Review connection requests from peers requesting to swap learning sessions.", fontSize = 12.sp, color = subTextColor)

        Spacer(modifier = Modifier.height(12.dp))

        if (notification != null) {
            Surface(
                color = AccentEmerald.copy(alpha = 0.15f),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
            ) {
                Text(notification!!, color = AccentEmerald, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(10.dp))
            }
        }

        TabRow(
            selectedTabIndex = selectedTabIndex,
            containerColor = if (isDarkTheme) DarkCardBg else LightCardBg
        ) {
            Tab(
                selected = selectedTabIndex == 0,
                onClick = { selectedTabIndex = 0 },
                text = { Text("Received (${receivedRequests.size})", fontWeight = FontWeight.Bold) }
            )
            Tab(
                selected = selectedTabIndex == 1,
                onClick = { selectedTabIndex = 1 },
                text = { Text("Sent (${sentRequests.size})", fontWeight = FontWeight.Bold) }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = PrimaryIndigo)
            }
        } else {
            val list = if (selectedTabIndex == 0) receivedRequests else sentRequests
            if (list.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No requests in this view.", color = subTextColor, fontSize = 13.sp)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(list) { req ->
                        RequestCardItem(
                            request = req,
                            isReceived = selectedTabIndex == 0,
                            isDarkTheme = isDarkTheme,
                            onAccept = { viewModel.updateStatus(currentUserId, req.id, "accepted") },
                            onReject = { viewModel.updateStatus(currentUserId, req.id, "rejected") },
                            onOpenChat = { navController.navigate("chat") },
                            onOpenCall = { navController.navigate("sessions") }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun RequestCardItem(
    request: RequestDto,
    isReceived: Boolean,
    isDarkTheme: Boolean,
    onAccept: () -> Unit,
    onReject: () -> Unit,
    onOpenChat: () -> Unit,
    onOpenCall: () -> Unit
) {
    val textColor = if (isDarkTheme) Color.White else Color(0xFF0F172A)
    val subTextColor = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B)

    GlassCard(isDarkTheme = isDarkTheme) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (isReceived) "From: ${request.requesterName}" else "To: ${request.providerName}",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = textColor
            )
            Text(request.createdAt, fontSize = 10.sp, color = subTextColor)
        }

        Spacer(modifier = Modifier.height(4.dp))
        Text("Topic: ${request.skillTitle}", fontSize = 13.sp, color = PrimaryIndigo, fontWeight = FontWeight.SemiBold)

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            val statusColor = when (request.status.lowercase()) {
                "accepted" -> AccentEmerald
                "rejected" -> AccentRose
                else -> AccentAmber
            }
            Text(
                text = "Status: ${request.status.uppercase()}",
                fontSize = 11.sp,
                fontWeight = FontWeight.ExtraBold,
                color = statusColor
            )

            if (isReceived && request.status == "pending") {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = onReject,
                        colors = ButtonDefaults.buttonColors(containerColor = AccentRose.copy(alpha = 0.2f), contentColor = AccentRose),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp)
                    ) {
                        Text("Reject", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = onAccept,
                        colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp)
                    ) {
                        Text("Accept Swap", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            } else if (request.status == "accepted") {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = onOpenChat, shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(horizontal = 10.dp)) {
                        Icon(Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(14.dp), tint = PrimaryIndigo)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Chat", fontSize = 11.sp, color = PrimaryIndigo)
                    }
                    OutlinedButton(onClick = onOpenCall, shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(horizontal = 10.dp)) {
                        Icon(Icons.Default.Videocam, contentDescription = null, modifier = Modifier.size(14.dp), tint = PrimaryPurple)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Call", fontSize = 11.sp, color = PrimaryPurple)
                    }
                }
            }
        }
    }
}
