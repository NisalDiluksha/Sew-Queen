<?php
// ---------------------------------------------------------
// පැරණි PHP අනුවාද සඳහා Compatibility Fix (OpenSSL නැතුව)
// ---------------------------------------------------------
if (!defined('PASSWORD_DEFAULT')) {
    define('PASSWORD_DEFAULT', 1);
}

if (!function_exists('password_hash')) {
    function password_hash($password, $algo) {
        // OpenSSL නැති නිසා basic salt එකක් හදනවා
        $salt = '$2y$10$' . substr(md5(uniqid(mt_rand(), true)), 0, 22);
        return crypt($password, $salt);
    }
}

if (!function_exists('password_verify')) {
    function password_verify($password, $hash) {
        return crypt($password, $hash) === $hash;
    }
}
// ---------------------------------------------------------

// Database සම්බන්ධතාව
$host = "localhost";
$user = "root";          
$pass = "";              
$dbname = "sew_queen";   

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Form එකෙන් එන දත්ත ලබා ගැනීම
$name = $_POST['name'];
$whatsapp = $_POST['whatsapp'];
$gmail = $_POST['gmail'];
$password = $_POST['password'];

// මුරපදය Hash කිරීම
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// දත්ත ඇතුළත් කිරීම
$sql = "INSERT INTO sew_queen_users (name, whatsapp, gmail, password) VALUES ('$name', '$whatsapp', '$gmail', '$hashed_password')";

if ($conn->query($sql) === TRUE) {
    header("Location: register.php?registered=success");
    exit();
} else {
    header("Location: register.php?error=" . urlencode($conn->error));
    exit();
}

$conn->close();
?>