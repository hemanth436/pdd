package com.skillexchange.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Save
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
import com.skillexchange.app.viewmodels.ProfileViewModel

@Composable
fun ProfileScreen(
    navController: NavController,
    viewModel: ProfileViewModel,
    isDarkTheme: Boolean,
    onLogout: () -> Unit
) {
    val user by viewModel.currentUser.collectAsState()
    val saveMessage by viewModel.saveMessage.collectAsState()

    var fullName by remember(user) { mutableStateOf(user.fullName) }
    var email by remember(user) { mutableStateOf(user.email) }
    var mobileNumber by remember(user) { mutableStateOf(user.mobileNumber ?: "") }
    var bio by remember(user) { mutableStateOf(user.bio ?: "") }
    var skillsOffered by remember(user) { mutableStateOf(user.skillsOffered ?: "") }
    var skillsNeeded by remember(user) { mutableStateOf(user.skillsNeeded ?: "") }
    var experience by remember(user) { mutableStateOf(user.experience ?: "") }
    var education by remember(user) { mutableStateOf(user.education ?: "") }

    val bg = if (isDarkTheme) DarkBackground else LightBackground
    val textColor = if (isDarkTheme) Color.White else Color(0xFF0F172A)
    val subTextColor = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("My Profile", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = textColor)
        Text("Manage your identity, qualifications, and exchange subjects.", fontSize = 12.sp, color = subTextColor)

        if (saveMessage != null) {
            Surface(
                color = AccentEmerald.copy(alpha = 0.15f),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(saveMessage!!, color = AccentEmerald, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(10.dp))
            }
        }

        // Profile Avatar Card
        GlassCard(isDarkTheme = isDarkTheme) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(PrimaryIndigo.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = fullName.take(1).uppercase(),
                        fontWeight = FontWeight.Black,
                        fontSize = 24.sp,
                        color = PrimaryIndigo
                    )
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(fullName, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = textColor)
                    Text("@${user.username}", fontSize = 12.sp, color = subTextColor)
                    Spacer(modifier = Modifier.height(4.dp))
                    CategoryBadge(category = "Role: ${user.role}", isDarkTheme = isDarkTheme)
                }
            }
        }

        // Form Fields
        GlassCard(isDarkTheme = isDarkTheme) {
            Text("General Details", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = textColor)
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(value = fullName, onValueChange = { fullName = it }, label = { Text("Full Name") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email Address") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = mobileNumber, onValueChange = { mobileNumber = it }, label = { Text("Mobile Number") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = skillsOffered, onValueChange = { skillsOffered = it }, label = { Text("Skills Offered Category") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = skillsNeeded, onValueChange = { skillsNeeded = it }, label = { Text("Skills Needed Category") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = bio, onValueChange = { bio = it }, label = { Text("Biography") }, modifier = Modifier.fillMaxWidth(), maxLines = 3)
        }

        GlassCard(isDarkTheme = isDarkTheme) {
            Text("Credentials & Experience", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = textColor)
            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(value = experience, onValueChange = { experience = it }, label = { Text("Experience Level") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = education, onValueChange = { education = it }, label = { Text("Education / Certificates") }, modifier = Modifier.fillMaxWidth())
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = {
                    viewModel.updateProfile(fullName, email, mobileNumber, bio, skillsOffered, skillsNeeded, experience, education)
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                modifier = Modifier.weight(1f).height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Save, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Save Changes", fontWeight = FontWeight.Bold)
            }

            OutlinedButton(
                onClick = onLogout,
                colors = ButtonDefaults.outlinedButtonColors(contentColor = AccentRose),
                modifier = Modifier.weight(1f).height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.ExitToApp, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Log Out", fontWeight = FontWeight.Bold)
            }
        }
    }
}
