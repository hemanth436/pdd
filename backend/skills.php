<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

// Get all skills
if ($action == 'list') {
    $result = $conn->query("SELECT s.*, u.full_name as owner_name FROM skills s JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC");
    $skills = [];
    while ($row = $result->fetch_assoc()) {
        $skills[] = $row;
    }
    jsonResponse('success', 'Skills fetched', $skills);
}

// Add new skill
if ($action == 'add') {
    $user_id = $_POST['user_id'];
    $title = $_POST['title'];
    $description = $_POST['description'];
    $category = $_POST['category'];

    $stmt = $conn->prepare("INSERT INTO skills (user_id, title, description, category) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $user_id, $title, $description, $category);

    if ($stmt->execute()) {
        jsonResponse('success', 'Skill added successfully');
    } else {
        jsonResponse('error', 'Failed to add skill');
    }
}
?>
