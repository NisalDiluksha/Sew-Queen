<?php

session_start();
require_once "../config.php";

if (isset($_SESSION["admin_id"])) {
    header("Location: dashboard.php");
    exit;
}

$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $username = trim($_POST["username"]);
    $password = $_POST["password"];

    if ($username == "" || $password == "") {

        $error = "Please enter username and password.";

    } else {

        $stmt = $conn->prepare(
            "SELECT id, username, password FROM admins WHERE username = ? LIMIT 1"
        );

        $stmt->bind_param("s", $username);
        $stmt->execute();

        $result = $stmt->get_result();

        if ($result->num_rows == 1) {

            $admin = $result->fetch_assoc();

            $hashed_password = hash("sha256", $password);

            if ($hashed_password == $admin["password"]) {

                session_regenerate_id(true);

                $_SESSION["admin_id"] = $admin["id"];
                $_SESSION["admin_username"] = $admin["username"];

                header("Location: dashboard.php");
                exit;

            } else {

                $error = "Invalid username or password.";

            }

        } else {

            $error = "Invalid username or password.";

        }

        $stmt->close();
    }
}

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Sew Queen | Admin Login</title>

    <style>

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            min-height: 100vh;

            display: flex;
            align-items: center;
            justify-content: center;

            background: #08080c;
            color: white;

            padding: 20px;
        }

        .login-box {
            width: 100%;
            max-width: 420px;

            padding: 35px;

            background: #101016;

            border: 1px solid rgba(255,255,255,0.08);

            border-radius: 18px;
        }

        .logo {
            text-align: center;

            font-size: 30px;
            font-weight: bold;

            margin-bottom: 8px;
        }

        .logo span {
            color: #25d366;
        }

        .subtitle {
            text-align: center;

            color: #96969f;

            margin-bottom: 30px;
        }

        .form-group {
            margin-bottom: 18px;
        }

        label {
            display: block;

            margin-bottom: 8px;

            color: #d7d7dc;
        }

        input {
            width: 100%;

            padding: 13px 14px;

            background: #08080c;

            border: 1px solid rgba(255,255,255,0.1);

            border-radius: 9px;

            color: white;

            outline: none;
        }

        input:focus {
            border-color: #25d366;
        }

        button {
            width: 100%;

            padding: 14px;

            border: none;

            border-radius: 9px;

            background: #25d366;

            color: white;

            font-size: 16px;

            font-weight: bold;

            cursor: pointer;
        }

        button:hover {
            opacity: 0.9;
        }

        .error {
            background: rgba(255,70,70,0.1);

            border: 1px solid rgba(255,70,70,0.25);

            color: #ff7b7b;

            padding: 12px;

            border-radius: 8px;

            margin-bottom: 18px;

            text-align: center;
        }

        .back {
            display: block;

            text-align: center;

            margin-top: 20px;

            color: #888892;

            text-decoration: none;
        }

        .back:hover {
            color: white;
        }

    </style>

</head>

<body>

    <div class="login-box">

        <div class="logo">
            Sew <span>Queen</span>
        </div>

        <div class="subtitle">
            Admin Panel Login
        </div>

        <?php if ($error != ""): ?>

            <div class="error">
                <?php echo htmlspecialchars($error); ?>
            </div>

        <?php endif; ?>

        <form method="POST">

            <div class="form-group">

                <label for="username">
                    Username
                </label>

                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    required
                >

            </div>

            <div class="form-group">

                <label for="password">
                    Password
                </label>

                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    required
                >

            </div>

            <button type="submit">
                Login
            </button>

        </form>

        <a href="../index.php" class="back">
            ← Back to Website
        </a>

    </div>

</body>

</html>