<?php
session_start();
// In a real app, you'd check if $_SESSION['user_id'] is set here
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard | SkillSwap</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <div class="sidebar">
        <div class="px-4 mb-4">
            <h4 class="fw-bold text-white">SkillSwap</h4>
        </div>
        <a href="#" class="active"><i class="fas fa-home me-2"></i> Dashboard</a>
        <a href="#"><i class="fas fa-plus-circle me-2"></i> Add Skill</a>
        <a href="#"><i class="fas fa-exchange-alt me-2"></i> Requests</a>
        <a href="#"><i class="fas fa-comments me-2"></i> Messages</a>
        <a href="#"><i class="fas fa-user me-2"></i> Profile</a>
        <a href="#"><i class="fas fa-cog me-2"></i> Settings</a>
        <a href="index.php" class="mt-auto"><i class="fas fa-sign-out-alt me-2"></i> Logout</a>
    </div>

    <div class="main-content">
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold">User Dashboard</h2>
                <div class="dropdown">
                    <button class="btn btn-light rounded-circle shadow-sm" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-bell"></i>
                    </button>
                </div>
            </div>

            <!-- Stats Row -->
            <div class="row g-4 mb-4">
                <div class="col-md-3">
                    <div class="glass-card p-4 text-center">
                        <h3 class="fw-bold">12</h3>
                        <p class="text-muted mb-0">Total Skills</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="glass-card p-4 text-center">
                        <h3 class="fw-bold text-success">5</h3>
                        <p class="text-muted mb-0">Accepted Requests</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="glass-card p-4 text-center">
                        <h3 class="fw-bold text-warning">3</h3>
                        <p class="text-muted mb-0">Pending Skills</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="glass-card p-4 text-center">
                        <h3 class="fw-bold text-info">8</h3>
                        <p class="text-muted mb-0">Messages</p>
                    </div>
                </div>
            </div>

            <!-- Recent Skills -->
            <div class="glass-card p-4 mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="fw-bold">My Offered Skills</h5>
                    <button class="btn btn-primary btn-sm rounded-pill px-3">Add New</button>
                </div>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Skill Title</th>
                            <th>Category</th>
                            <th>Requests</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Web Development</td>
                            <td>Programming</td>
                            <td>4</td>
                            <td><span class="badge bg-success">Active</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                        <!-- More rows -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
