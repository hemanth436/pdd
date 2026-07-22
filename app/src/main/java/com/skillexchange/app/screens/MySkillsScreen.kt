package com.skillexchange.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.skillexchange.app.ui.*
import com.skillexchange.app.viewmodels.SkillViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MySkillsScreen(
    navController: NavController,
    viewModel: SkillViewModel,
    isDarkTheme: Boolean,
    currentUserId: String = "u_current"
) {
    val userSkills by viewModel.userSkills.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val actionMessage by viewModel.actionMessage.collectAsState()

    var showAddDialog by remember { mutableStateOf(false) }
    var skillTitle by remember { mutableStateOf("") }
    var skillDesc by remember { mutableStateOf("") }
    var skillCategory by remember { mutableStateOf("Programming") }
    var skillType by remember { mutableStateOf("offered") }

    val bg = if (isDarkTheme) DarkBackground else LightBackground
    val textColor = if (isDarkTheme) Color.White else Color(0xFF0F172A)
    val subTextColor = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B)

    val categoryOptions = listOf("Programming", "Web Development", "Mobile Development", "Data Science", "AI & Machine Learning", "Graphic Design")

    LaunchedEffect(currentUserId) {
        viewModel.fetchUserSkills(currentUserId)
    }

    Scaffold(
        containerColor = bg,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = PrimaryIndigo,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Skill Listing")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("My Skills & Listings", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = textColor)
                    Text("Competencies you are teaching or want to learn.", fontSize = 12.sp, color = subTextColor)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (actionMessage != null) {
                Surface(
                    color = AccentEmerald.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                ) {
                    Text(
                        actionMessage!!,
                        color = AccentEmerald,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }

            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = PrimaryIndigo)
                }
            } else if (userSkills.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Folder, contentDescription = null, tint = subTextColor, modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("No Active Listings", fontWeight = FontWeight.Bold, color = textColor)
                        Text("Tap + to publish your first skill topic.", fontSize = 12.sp, color = subTextColor)
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(userSkills) { skill ->
                        GlassCard(isDarkTheme = isDarkTheme) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                CategoryBadge(category = skill.type, isDarkTheme = isDarkTheme)
                                IconButton(onClick = { viewModel.deleteSkill(currentUserId, skill.id) }) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = AccentRose)
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(skill.category.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = subTextColor)
                            Text(skill.title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = textColor)
                            Text(skill.description, fontSize = 12.sp, color = subTextColor, modifier = Modifier.padding(top = 4.dp))
                        }
                    }
                }
            }
        }

        // Add Skill Dialog Modal
        if (showAddDialog) {
            AlertDialog(
                onDismissRequest = { showAddDialog = false },
                confirmButton = {
                    Button(
                        onClick = {
                            if (skillTitle.isNotBlank() && skillDesc.isNotBlank()) {
                                viewModel.addSkill(currentUserId, skillTitle, skillDesc, skillCategory, skillType)
                                skillTitle = ""
                                skillDesc = ""
                                showAddDialog = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                    ) {
                        Text("Publish Listing")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showAddDialog = false }) { Text("Cancel") }
                },
                title = { Text("Create Skill Listing", fontWeight = FontWeight.Bold) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = skillTitle,
                            onValueChange = { skillTitle = it },
                            label = { Text("Skill Title") },
                            placeholder = { Text("E.g. Advanced Python, UI Design") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = skillDesc,
                            onValueChange = { skillDesc = it },
                            label = { Text("Description") },
                            modifier = Modifier.fillMaxWidth(),
                            maxLines = 3
                        )
                        Text("Listing Type:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Row {
                            RadioButton(selected = skillType == "offered", onClick = { skillType = "offered" })
                            Text("I can teach (Offer)", fontSize = 12.sp, modifier = Modifier.align(Alignment.CenterVertically))
                        }
                        Row {
                            RadioButton(selected = skillType == "requested", onClick = { skillType = "requested" })
                            Text("I want to learn (Request)", fontSize = 12.sp, modifier = Modifier.align(Alignment.CenterVertically))
                        }
                    }
                }
            )
        }
    }
}
