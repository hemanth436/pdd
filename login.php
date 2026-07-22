<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login | SkillSwap</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-gradient-primary d-flex align-items-center" style="min-height: 100vh;">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-5">
                <div class="glass-card p-5 animate-up">
                    <h2 class="text-center fw-bold mb-4">Login</h2>
                    <form action="backend/auth.php?action=login" method="POST">
                        <div class="mb-3">
                            <label class="form-label">Username or Email</label>
                            <input type="text" name="username" class="form-control rounded-pill" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" name="password" class="form-control rounded-pill" required>
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="remember">
                            <label class="form-check-label" for="remember">Remember Me</label>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 rounded-pill py-2">Login</button>
                    </form>
                    <p class="text-center mt-3">New here? <a href="register.php">Sign Up</a></p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
