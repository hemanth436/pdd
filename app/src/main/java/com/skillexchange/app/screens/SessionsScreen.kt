package com.skillexchange.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.skillexchange.app.ui.*

data class SessionItem(
    val id: String,
    val peerName: String,
    val topic: String,
    val time: String,
    val isLive: Boolean = false
)

@Composable
fun SessionsScreen(navController: NavController, isDarkTheme: Boolean) {
    var activeCallSession by remember { mutableStateOf<SessionItem?>(null) }
    var isMicMuted by remember { mutableStateOf(false) }
    var isVideoOn by remember { mutableStateOf(true) }

    val bg = if (isDarkTheme) DarkBackground else LightBackground
    val textColor = if (isDarkTheme) Color.White else Color(0xFF0F172A)
    val subTextColor = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B)

    val upcomingSessions = listOf(
        SessionItem("ses_1", "Alex Rivera", "Interactive Figma Interfaces", "Today, 4:00 PM EST", isLive = true),
        SessionItem("ses_2", "Sarah Jenkins", "Swift & iOS Core Architecture", "Tomorrow, 2:30 PM EST"),
        SessionItem("ses_3", "Dr. Kenji Sato", "PyTorch ML Deep Learning", "Friday, 11:00 AM EST")
    )

    if (activeCallSession != null) {
        // Video Call View Modal
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF050811))
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Header Call Meta
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(top = 24.dp)) {
                    Text(activeCallSession!!.peerName, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text("Session: ${activeCallSession!!.topic}", fontSize = 12.sp, color = PrimaryIndigo)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("🔴 LIVE WEBRTC SESSION (00:04:12)", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = AccentRose)
                }

                // Video Preview Container Box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(360.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(Color(0xFF0D121F))
                        .border(1.dp, PrimaryIndigo, RoundedCornerShape(24.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    if (isVideoOn) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.AccountCircle, contentDescription = null, tint = PrimaryIndigo, modifier = Modifier.size(80.dp))
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Peer Video Feed Connected", fontSize = 12.sp, color = Color.White)
                        }
                    } else {
                        Text("Video Disabled", color = Color(0xFF94A3B8), fontSize = 13.sp)
                    }

                    // Self PIP Window
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(16.dp)
                            .size(90.dp, 120.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF1E293B))
                            .border(1.dp, Color.White.copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("You", fontSize = 10.sp, color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }

                // Call Controls Row
                Row(
                    horizontalArrangement = Arrangement.spacedBy(20.dp),
                    modifier = Modifier.padding(bottom = 32.dp)
                ) {
                    IconButton(
                        onClick = { isMicMuted = !isMicMuted },
                        modifier = Modifier
                            .size(56.dp)
                            .background(if (isMicMuted) AccentRose else Color(0xFF1E293B), CircleShape)
                    ) {
                        Icon(if (isMicMuted) Icons.Default.MicOff else Icons.Default.Mic, contentDescription = "Mic", tint = Color.White)
                    }

                    IconButton(
                        onClick = { isVideoOn = !isVideoOn },
                        modifier = Modifier
                            .size(56.dp)
                            .background(if (!isVideoOn) AccentRose else Color(0xFF1E293B), CircleShape)
                    ) {
                        Icon(if (isVideoOn) Icons.Default.Videocam else Icons.Default.VideocamOff, contentDescription = "Camera", tint = Color.White)
                    }

                    IconButton(
                        onClick = { activeCallSession = null },
                        modifier = Modifier
                            .size(56.dp)
                            .background(AccentRose, CircleShape)
                    ) {
                        Icon(Icons.Default.CallEnd, contentDescription = "End Call", tint = Color.White)
                    }
                }
            }
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(bg)
                .padding(16.dp)
        ) {
            Text("Learning & Video Sessions", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = textColor)
            Text("Scheduled mentorship calls and WebRTC video meeting links.", fontSize = 12.sp, color = subTextColor)

            Spacer(modifier = Modifier.height(16.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(upcomingSessions) { session ->
                    GlassCard(isDarkTheme = isDarkTheme) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(session.peerName, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = textColor)
                                Text("Topic: ${session.topic}", fontSize = 12.sp, color = PrimaryIndigo, fontWeight = FontWeight.SemiBold)
                                Text(session.time, fontSize = 11.sp, color = subTextColor, modifier = Modifier.padding(top = 2.dp))
                            }

                            if (session.isLive) {
                                Button(
                                    onClick = { activeCallSession = session },
                                    colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Icon(Icons.Default.Videocam, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Join Call", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            } else {
                                OutlinedButton(
                                    onClick = { activeCallSession = session },
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Text("Start Call", fontSize = 12.sp, color = PrimaryIndigo)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
