<?php
session_start();

// ---------------------------------------------------------
// පැරණි PHP අනුවාද සඳහා Compatibility Fix (OpenSSL නැතුව)
// ---------------------------------------------------------
if (!function_exists('password_verify')) {
    function password_verify($password, $hash) {
        return crypt($password, $hash) === $hash;
    }
}
// ---------------------------------------------------------

// Database සම්බන්ධතාව
$host = "localhost";
$user = "root";          // ඔබේ MySQL username
$pass = "";              // ඔබේ MySQL password (හිස් නම් මෙහෙම තියන්න)
$dbname = "sew_queen";   // ඔබේ database එකේ නම

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Form එකෙන් එන දත්ත ලබා ගැනීම
$whatsapp = $_POST['whatsapp'];
$password = $_POST['password'];

// WhatsApp අංකය භාවිතා කර user ගවේෂණය කිරීම
$stmt = $conn->prepare("SELECT * FROM sew_queen_users WHERE whatsapp = ?");
$stmt->bind_param("s", $whatsapp);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // User හමු වුණා
    $row = $result->fetch_assoc();
    
    // මුරපදය නිවැරදිද කියලා තහවුරු කිරීම
    if (password_verify($password, $row['password'])) {
        // සාර්ථකයි! Session එකට save කරන්න
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['name'] = $row['name'];
        $_SESSION['whatsapp'] = $row['whatsapp'];

        // 👉 වෙනස් කළ තැන: දැන් යවන්නේ User Dashboard එකට
        header("Location: sewqueenuserdashboard.php");
        exit();
    } else {
        // වැරදි මුරපදය
        header("Location: login.php?error=" . urlencode("Invalid password. Please try again."));
        exit();
    }
} else {
    // WhatsApp අංකය හමු නොවුණා
    header("Location: login.php?error=" . urlencode("Account not found. Please register first."));
    exit();
}

$conn->close();
?>