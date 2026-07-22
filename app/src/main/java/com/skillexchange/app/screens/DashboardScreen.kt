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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.skillexchange.app.api.SkillDto
import com.skillexchange.app.ui.GlassCard
import com.skillexchange.app.ui.PrimaryIndigo
import com.skillexchange.app.ui.PrimaryPurple
import com.skillexchange.app.viewmodels.SkillViewModel

@Composable
fun DashboardScreen(
    navController: NavController,
    viewModel: SkillViewModel,
    isDarkTheme: Boolean = true
) {
    val userSkills by viewModel.userSkills.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.fetchUserSkills("u_current")
    }

    val bg = if (isDarkTheme) Color(0xFF0B0F19) else Color(0xFFF8FAFC)
    val textColor = if (isDarkTheme) Color.White else Color(0xFF0F172A)
    val subTextColor = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .padding(16.dp)
    ) {
        Text("Overview Dashboard", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = textColor)
        Text("Track metrics, recent skill offerings, and active swap requests.", fontSize = 12.sp, color = subTextColor)

        Spacer(modifier = Modifier.height(16.dp))

        // Stats Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard("Active Skills", userSkills.size.toString(), Icons.Default.Folder, Modifier.weight(1f), isDarkTheme)
            StatCard("Inquiries", "5", Icons.Default.CompareArrows, Modifier.weight(1f), isDarkTheme)
            StatCard("Messages", "8", Icons.Default.Chat, Modifier.weight(1f), isDarkTheme)
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Recent Skill Listings",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = textColor
        )

        Spacer(modifier = Modifier.height(8.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = PrimaryIndigo)
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(userSkills) { skill ->
                    SkillItem(skill, isDarkTheme, onRequest = { navController.navigate("requests") })
                }
            }
        }
    }
}

@Composable
fun StatCard(label: String, value: String, icon: ImageVector, modifier: Modifier = Modifier, isDarkTheme: Boolean) {
    GlassCard(modifier = modifier, isDarkTheme = isDarkTheme) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Icon(icon, contentDescription = null, tint = PrimaryIndigo, modifier = Modifier.size(22.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = if (isDarkTheme) Color.White else Color(0xFF0F172A))
            Text(text = label, fontSize = 11.sp, color = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B))
        }
    }
}

@Composable
fun SkillItem(skill: SkillDto, isDarkTheme: Boolean, onRequest: () -> Unit) {
    GlassCard(isDarkTheme = isDarkTheme) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .background(PrimaryIndigo.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(skill.title.take(1).uppercase(), fontWeight = FontWeight.Bold, color = PrimaryIndigo, fontSize = 16.sp)
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = skill.title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = if (isDarkTheme) Color.White else Color(0xFF0F172A))
                Text(text = "Category: ${skill.category}", fontSize = 11.sp, color = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B))
            }
            Button(
                onClick = onRequest,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 10.dp)
            ) {
                Text("View", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
