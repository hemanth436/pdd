package com.skillexchange.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.skillexchange.app.api.SkillDto
import com.skillexchange.app.ui.*
import com.skillexchange.app.viewmodels.MarketplaceViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MarketplaceScreen(
    navController: NavController,
    viewModel: MarketplaceViewModel,
    isDarkTheme: Boolean,
    currentUserId: String = "u_current"
) {
    val skills by viewModel.skills.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val selectedType by viewModel.selectedType.collectAsState()
    val requestedSkillIds by viewModel.requestedSkillIds.collectAsState()
    val userMessage by viewModel.userMessage.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedSkillDetail by remember { mutableStateOf<SkillDto?>(null) }

    val bg = if (isDarkTheme) DarkBackground else LightBackground
    val textColor = if (isDarkTheme) Color.White else Color(0xFF0F172A)
    val subTextColor = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B)

    val categories = listOf("All", "Programming", "Web Development", "Mobile Development", "Data Science", "AI & Machine Learning", "Graphic Design")
    val types = listOf("All", "offered", "requested")

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bg)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Header Title
            Text("Skill Marketplace", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = textColor)
            Text("Discover peer mentors, learn, and share competency listings.", fontSize = 12.sp, color = subTextColor)

            Spacer(modifier = Modifier.height(12.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = {
                    searchQuery = it
                    viewModel.setSearchQuery(it)
                },
                placeholder = { Text("Search Python, Figma, Swift...", fontSize = 13.sp, color = subTextColor) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = PrimaryIndigo) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryIndigo,
                    unfocusedBorderColor = if (isDarkTheme) DarkBorder else LightBorder
                )
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Category Filter Chips
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(categories) { cat ->
                    val isCatSelected = if (cat == "All") selectedCategory.isEmpty() else selectedCategory == cat
                    FilterChip(
                        selected = isCatSelected,
                        onClick = { viewModel.setCategory(if (cat == "All") "" else cat) },
                        label = { Text(cat, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryIndigo,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Type Filter Chips (Offered vs Requested)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(types) { t ->
                    val isTypeSelected = if (t == "All") selectedType.isEmpty() else selectedType == t
                    FilterChip(
                        selected = isTypeSelected,
                        onClick = { viewModel.setType(if (t == "All") "" else t) },
                        label = { Text(if (t == "All") "All Types" else t.replaceFirstChar { it.uppercase() }, fontSize = 11.sp) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (userMessage != null) {
                Surface(
                    color = AccentEmerald.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                ) {
                    Text(
                        userMessage!!,
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
            } else if (skills.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No skill listings match your filters.", color = subTextColor, fontSize = 13.sp)
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(skills) { skill ->
                        MarketplaceSkillItem(
                            skill = skill,
                            isDarkTheme = isDarkTheme,
                            isRequested = requestedSkillIds.contains(skill.id),
                            onViewDetail = { selectedSkillDetail = skill },
                            onRequestSwap = { viewModel.sendSwapRequest(currentUserId, skill) }
                        )
                    }
                }
            }
        }

        // Skill Detail Dialog Overlay
        if (selectedSkillDetail != null) {
            val detail = selectedSkillDetail!!
            AlertDialog(
                onDismissRequest = { selectedSkillDetail = null },
                confirmButton = {
                    if (requestedSkillIds.contains(detail.id)) {
                        Button(onClick = {}, enabled = false) { Text("Requested") }
                    } else {
                        Button(
                            onClick = {
                                viewModel.sendSwapRequest(currentUserId, detail)
                                selectedSkillDetail = null
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                        ) {
                            Text("Confirm Swap Request")
                        }
                    }
                },
                dismissButton = {
                    TextButton(onClick = { selectedSkillDetail = null }) { Text("Close") }
                },
                title = { Text(detail.title, fontWeight = FontWeight.Bold) },
                text = {
                    Column {
                        CategoryBadge(category = detail.category, isDarkTheme = isDarkTheme)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Instructor: ${detail.ownerName}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(detail.description, fontSize = 12.sp, color = subTextColor)
                    }
                }
            )
        }
    }
}

@Composable
fun MarketplaceSkillItem(
    skill: SkillDto,
    isDarkTheme: Boolean,
    isRequested: Boolean,
    onViewDetail: () -> Unit,
    onRequestSwap: () -> Unit
) {
    GlassCard(isDarkTheme = isDarkTheme) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(PrimaryIndigo.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = skill.ownerName.take(1).uppercase(),
                    fontWeight = FontWeight.Bold,
                    color = PrimaryIndigo,
                    fontSize = 16.sp
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(skill.ownerName, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = if (isDarkTheme) Color.White else Color(0xFF0F172A))
                Text("Category: ${skill.category}", fontSize = 11.sp, color = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B))
            }
            Spacer(modifier = Modifier.weight(1f))
            CategoryBadge(category = skill.type, isDarkTheme = isDarkTheme)
        }

        Spacer(modifier = Modifier.height(10.dp))

        Text(skill.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = if (isDarkTheme) Color.White else Color(0xFF0F172A))
        Text(
            skill.description,
            fontSize = 12.sp,
            color = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF64748B),
            maxLines = 2,
            modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onViewDetail) {
                Text("View Detail", fontSize = 12.sp, color = PrimaryIndigo, fontWeight = FontWeight.Bold)
            }

            if (isRequested) {
                Button(
                    onClick = {},
                    enabled = false,
                    colors = ButtonDefaults.buttonColors(disabledContainerColor = AccentEmerald.copy(alpha = 0.2f), disabledContentColor = AccentEmerald),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Requested ✓", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            } else {
                Button(
                    onClick = onRequestSwap,
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Request Swap", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
