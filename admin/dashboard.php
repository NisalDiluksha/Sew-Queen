<?php

session_start();

if (!isset($_SESSION["admin_id"])) {
    header("Location: login.php");
    exit;
}

require_once "../config.php";

$result = $conn->query("SELECT COUNT(*) AS total FROM users");
$user_count = 0;

if ($result) {
    $row = $result->fetch_assoc();
    $user_count = $row["total"];
}

$bot_result = $conn->query(
    "SELECT setting_value FROM settings WHERE setting_name = 'bot_status' LIMIT 1"
);

$bot_status = "offline";

if ($bot_result && $bot_result->num_rows > 0) {
    $bot_status = $bot_result->fetch_assoc()["setting_value"];
}

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Sew Queen | Dashboard</title>

    <style>

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background: #08080c;
            color: white;
        }

        .navbar {
            height: 75px;
            padding: 0 6%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            background: #0c0c11;
        }

        .logo {
            font-size: 25px;
            font-weight: bold;
        }

        .logo span {
            color: #25d366;
        }

        .admin-info {
            display: flex;
            align-items: center;
            gap: 18px;
        }

        .admin-name {
            color: #a7a7b0;
        }

        .logout {
            text-decoration: none;
            color: white;
            background: #e53935;
            padding: 10px 17px;
            border-radius: 8px;
        }

        .container {
            max-width: 1200px;
            margin: auto;
            padding: 50px 25px;
        }

        .welcome {
            margin-bottom: 35px;
        }

        .welcome h1 {
            font-size: 38px;
            margin-bottom: 8px;
        }

        .welcome p {
            color: #898992;
        }

        .cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        .card {
            background: #111118;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 15px;
            padding: 28px;
        }

        .card-title {
            color: #91919a;
            margin-bottom: 15px;
        }

        .card-value {
            font-size: 36px;
            font-weight: bold;
        }

        .online {
            color: #25d366;
        }

        .offline {
            color: #ff6b6b;
        }

        .actions {
            margin-top: 30px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }

        .action {
            text-decoration: none;
            color: white;
            padding: 25px;
            background: #111118;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 15px;
            transition: 0.3s;
        }

        .action:hover {
            border-color: rgba(37,211,102,0.4);
            transform: translateY(-3px);
        }

        .action h3 {
            margin-bottom: 8px;
        }

        .action p {
            color: #888892;
        }

        @media (max-width: 800px) {

            .cards {
                grid-template-columns: 1fr;
            }

            .actions {
                grid-template-columns: 1fr;
            }

            .admin-info {
                gap: 8px;
            }

            .admin-name {
                display: none;
            }

        }

    </style>

</head>

<body>

    <nav class="navbar">

        <div class="logo">
            Sew <span>Queen</span>
        </div>

        <div class="admin-info">

            <div class="admin-name">
                <?= htmlspecialchars($_SESSION["admin_username"]) ?>
            </div>

            <a href="logout.php" class="logout">
                Logout
            </a>

        </div>

    </nav>


    <main class="container">

        <div class="welcome">

            <h1>
                Admin Dashboard
            </h1>

            <p>
                Manage your Sew Queen WhatsApp Bot.
            </p>

        </div>


        <div class="cards">

            <div class="card">

                <div class="card-title">
                    Total Users
                </div>

                <div class="card-value">
                    <?= $user_count ?>
                </div>

            </div>


            <div class="card">

                <div class="card-title">
                    Bot Status
                </div>

                <div class="card-value <?= $bot_status === 'online' ? 'online' : 'offline' ?>">
                    <?= htmlspecialchars(strtoupper($bot_status)) ?>
                </div>

            </div>


            <div class="card">

                <div class="card-title">
                    Bot Name
                </div>

                <div class="card-value">
                    Sew Queen
                </div>

            </div>

        </div>


        <div class="actions">

            <a href="#" class="action">

                <h3>
                    Bot Settings
                </h3>

                <p>
                    Manage bot settings and configuration.
                </p>

            </a>

            <a href="#" class="action">

                <h3>
                    Users
                </h3>

                <p>
                    View and manage registered users.
                </p>

            </a>

            <!-- ⭐ NEW: Get Pairing Code Button එක -->
            <a href="pair-code.php" class="action" style="border-color: rgba(37,211,102,0.3);">

                <h3>
                    📱 Get Pairing Code
                </h3>

                <p>
                    Generate and display pairing code to connect WhatsApp.
                </p>

            </a>

            <!-- ⭐ NEW: Toggle Bot Button එක (කලින් තිබුණ නම් එකක් දාලා නැතිනම් මෙයත් දාන්න) -->
            <a href="toggle_bot.php" class="action" style="border-color: <?= ($bot_status == 'online') ? '#25d366' : '#ff6b6b' ?>;">

                <h3>
                    <?= ($bot_status == 'online') ? '🟢 Stop Bot' : '🔴 Start Bot' ?>
                </h3>

                <p>
                    Click to turn the bot <?= ($bot_status == 'online') ? 'OFF' : 'ON' ?> instantly.
                </p>

            </a>

        </div>

    </main>

</body>

</html>