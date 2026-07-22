package com.skillexchange.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import com.skillexchange.app.ui.*

data class CategoryItem(val name: String, val icon: ImageVector)

@Composable
fun LandingScreen(navController: NavController, isDarkTheme: Boolean) {
    val bg = if (isDarkTheme) DarkBackground else LightBackground
    val textColor = if (isDarkTheme) Color.White else Color(0xFF0F172A)
    val subTextColor = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B)

    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var feedbackMessage by remember { mutableStateOf("") }
    var showSuccessToast by remember { mutableStateOf(false) }

    val categories = listOf(
        CategoryItem("Programming", Icons.Default.Code),
        CategoryItem("Web Dev", Icons.Default.Computer),
        CategoryItem("Mobile Dev", Icons.Default.Smartphone),
        CategoryItem("Data Science", Icons.Default.BarChart),
        CategoryItem("AI & ML", Icons.Default.Psychology),
        CategoryItem("Graphic Design", Icons.Default.Palette),
        CategoryItem("Video Editing", Icons.Default.Videocam),
        CategoryItem("Marketing", Icons.Default.TrendingUp),
        CategoryItem("Communication", Icons.Default.Chat),
        CategoryItem("Languages", Icons.Default.Translate)
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Hero Section
        item {
            GlassCard(isDarkTheme = isDarkTheme) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                ) {
                    Text(
                        text = "DECENTRALIZED KNOWLEDGE EXCHANGE",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryIndigo,
                        modifier = Modifier
                            .background(PrimaryIndigo.copy(alpha = 0.12f), RoundedCornerShape(20.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                Text(
                    text = "Learn from peers, teach what you know, grow together.",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = textColor,
                    lineHeight = 30.sp
                )

                Text(
                    text = "Broaden your professional portfolio, exchange mentorship sessions, and connect with global developers without money.",
                    fontSize = 13.sp,
                    color = subTextColor,
                    modifier = Modifier.padding(top = 8.dp, bottom = 16.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    GradientButton(
                        text = "Explore Skills",
                        onClick = { navController.navigate("explore") },
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedButton(
                        onClick = { navController.navigate("login") },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Sign In", color = PrimaryIndigo, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Platform Features
        item {
            Text(
                text = "Platform Features",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = textColor
            )
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                FeatureCard(
                    icon = Icons.Default.Shield,
                    title = "Secure Match",
                    description = "Admin verification processes guarantee active peer matching.",
                    modifier = Modifier.weight(1f),
                    isDarkTheme = isDarkTheme
                )
                FeatureCard(
                    icon = Icons.Default.Chat,
                    title = "Live Chat",
                    description = "Real-time thread messages to arrange trade details.",
                    modifier = Modifier.weight(1f),
                    isDarkTheme = isDarkTheme
                )
            }
        }

        // Featured Categories
        item {
            Text(
                text = "Featured Categories",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = textColor,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                categories.chunked(2).forEach { rowItems ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        rowItems.forEach { cat ->
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { navController.navigate("explore") },
                                shape = RoundedCornerShape(12.dp),
                                color = if (isDarkTheme) DarkCardBg else LightCardBg,
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isDarkTheme) DarkBorder else LightBorder)
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(cat.icon, contentDescription = cat.name, tint = PrimaryIndigo, modifier = Modifier.size(20.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(cat.name, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = textColor)
                                }
                            }
                        }
                    }
                }
            }
        }

        // Support & Feedback Desk Form
        item {
            GlassCard(isDarkTheme = isDarkTheme) {
                Text("Support & Feedback Desk", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = textColor)
                Text("Submit your inquiry directly to platform administrators.", fontSize = 12.sp, color = subTextColor, modifier = Modifier.padding(bottom = 12.dp))

                if (showSuccessToast) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                            .background(AccentEmerald.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                            .padding(10.dp)
                    ) {
                        Text("Ticket submitted successfully! We will contact you soon.", fontSize = 12.sp, color = AccentEmerald, fontWeight = FontWeight.Bold)
                    }
                }

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Your Name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email Address") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = feedbackMessage,
                    onValueChange = { feedbackMessage = it },
                    label = { Text("Message Text") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
                Spacer(modifier = Modifier.height(12.dp))

                GradientButton(
                    text = "Submit Ticket",
                    onClick = {
                        if (name.isNotBlank() && email.isNotBlank() && feedbackMessage.isNotBlank()) {
                            showSuccessToast = true
                            name = ""
                            email = ""
                            feedbackMessage = ""
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

@Composable
fun FeatureCard(icon: ImageVector, title: String, description: String, modifier: Modifier = Modifier, isDarkTheme: Boolean) {
    GlassCard(modifier = modifier, isDarkTheme = isDarkTheme) {
        Icon(icon, contentDescription = title, tint = PrimaryIndigo, modifier = Modifier.size(24.dp))
        Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = if (isDarkTheme) Color.White else Color(0xFF0F172A), modifier = Modifier.padding(top = 8.dp))
        Text(description, fontSize = 11.sp, color = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B), modifier = Modifier.padding(top = 4.dp))
    }
}
