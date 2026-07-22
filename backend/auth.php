<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($action == 'register') {
    $full_name = $_POST['full_name'] ?? '';
    $email = $_POST['email'] ?? '';
    $username = $_POST['username'] ?? '';
    $password = password_hash($_POST['password'] ?? '', PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (full_name, email, username, password) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $full_name, $email, $username, $password);

    if ($stmt->execute()) {
        jsonResponse('success', 'User registered successfully');
    } else {
        jsonResponse('error', 'Registration failed: ' . $conn->error);
    }
}

if ($action == 'login') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $conn->prepare("SELECT id, full_name, password FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        if (password_verify($password, $user['password'])) {
            unset($user['password']); // Don't return password hash
            jsonResponse('success', 'Login successful', $user);
        } else {
            jsonResponse('error', 'Invalid password');
        }
    } else {
        jsonResponse('error', 'User not found');
    }
}
?>
