<?php
// Error පණිවිඩ පෙන්වන්න
$message = "";
if (isset($_GET['error'])) {
    $message = "<div style='background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 14px;'>❌ " . htmlspecialchars($_GET['error']) . "</div>";
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | Sew Queen</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            background: #0b0a0f;
            color: #f0eaff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .auth-container {
            width: 100%;
            max-width: 400px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(124, 58, 237, 0.3);
            border-radius: 15px;
            padding: 40px 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            text-align: center;
            backdrop-filter: blur(10px);
        }

        .auth-container img {
            width: 80px;
            height: auto;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
        }

        .auth-container h2 {
            margin-bottom: 25px;
            font-size: 28px;
            background: linear-gradient(135deg, #c084fc, #7c3aed, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #b6aad0;
            font-size: 14px;
            font-weight: bold;
        }

        .form-group input {
            width: 100%;
            padding: 12px 15px;
            background: #1a1a2e;
            border: 1px solid rgba(124, 58, 237, 0.3);
            border-radius: 8px;
            color: white;
            font-size: 15px;
            transition: 0.3s;
        }

        .form-group input:focus {
            outline: none;
            border-color: #a855f7;
            background: #221f35;
        }

        .login-submit {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
            box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
            margin-top: 10px;
        }

        .login-submit:hover {
            transform: translateY(-2px);
            opacity: 0.9;
            box-shadow: 0 6px 25px rgba(124, 58, 237, 0.5);
        }

        .back-link {
            display: block;
            margin-top: 20px;
            color: #a78bfa;
            text-decoration: none;
            font-size: 14px;
        }

        .back-link:hover {
            text-decoration: underline;
        }

        .register-link {
            margin-top: 20px;
            font-size: 14px;
            color: #b6aad0;
        }

        .register-link a {
            color: #ec4899;
            text-decoration: none;
            font-weight: bold;
        }

        .register-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>

<body>

    <div class="auth-container">
        
        <!-- Logo -->
        <img src="https://i.ibb.co/vGN2vVz/IMG-20260908-232029.jpg" alt="Sew Queen Logo">

        <h2>Login</h2>

        <!-- මෙතන Error පණිවිඩ පෙන්වයි -->
        <?php echo $message; ?>

        <!-- වැදගත්: මේ form එක process_login.php එකට යවනවා -->
        <form action="process_login.php" method="POST">
            
            <div class="form-group">
                <label for="whatsapp">WhatsApp Number</label>
                <input type="tel" id="whatsapp" name="whatsapp" placeholder="+94 7X XXX XXXX" required>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required>
            </div>

            <button type="submit" class="login-submit">Login</button>

        </form>

        <div class="register-link">
            Don't have an account? <a href="register.php">Register here</a>
        </div>

        <a href="index.php" class="back-link">&larr; Back to Home</a>

    </div>

</body>

</html>