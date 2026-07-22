package com.skillexchange.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Report
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.skillexchange.app.ui.*
import com.skillexchange.app.viewmodels.AdminViewModel

@Composable
fun AdminScreen(
    navController: NavController,
    viewModel: AdminViewModel,
    isDarkTheme: Boolean
) {
    val stats by viewModel.stats.collectAsState()
    val reports by viewModel.reports.collectAsState()

    val bg = if (isDarkTheme) DarkBackground else LightBackground
    val textColor = if (isDarkTheme) Color.White else Color(0xFF0F172A)
    val subTextColor = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = PrimaryIndigo, modifier = Modifier.size(28.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Admin Moderation Panel", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = textColor)
        }
        Text("System analytics overview & reported moderation tickets.", fontSize = 12.sp, color = subTextColor)

        Spacer(modifier = Modifier.height(16.dp))

        // System Stats Overview Grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            AdminStatBox("Users", stats.totalUsers.toString(), PrimaryIndigo, Modifier.weight(1f), isDarkTheme)
            AdminStatBox("Skills", stats.totalSkills.toString(), PrimaryPurple, Modifier.weight(1f), isDarkTheme)
            AdminStatBox("Pending", stats.pendingRequests.toString(), AccentAmber, Modifier.weight(1f), isDarkTheme)
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text("Reported Moderation Tickets", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = textColor)

        Spacer(modifier = Modifier.height(10.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(reports) { rep ->
                GlassCard(isDarkTheme = isDarkTheme) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Reporter: ${rep.reporterName}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = textColor)
                            Text("Target: ${rep.reportedName}", fontSize = 12.sp, color = AccentRose, fontWeight = FontWeight.SemiBold)
                        }
                        Text(rep.status.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = if (rep.status == "resolved") AccentEmerald else AccentAmber)
                    }
                    Text("Reason: ${rep.reason}", fontSize = 12.sp, color = subTextColor, modifier = Modifier.padding(top = 4.dp, bottom = 8.dp))

                    if (rep.status != "resolved") {
                        Button(
                            onClick = { viewModel.resolveReport(rep.id) },
                            colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp)
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Mark Resolved", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminStatBox(label: String, value: String, accentColor: Color, modifier: Modifier = Modifier, isDarkTheme: Boolean) {
    GlassCard(modifier = modifier, isDarkTheme = isDarkTheme) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Text(value, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = accentColor)
            Text(label, fontSize = 11.sp, color = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B))
        }
    }
}
