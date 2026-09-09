<?php
// Session එක ආරම්භ කරන්න
session_start();

// Session එකේ තියෙන සියලුම දත්ත හිස් කරන්න
$_SESSION = array();

// Session Cookie එකත් මකන්න (ආරක්ෂිතව ලොග් අවුට් වීමට)
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Session එක සම්පූර්ණයෙන්ම විනාශ කරන්න
session_destroy();

// ආපහු Login page එකට යවන්න
header("Location: login.php");
exit();
?>