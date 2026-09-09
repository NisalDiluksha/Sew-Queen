<?php
// 1. Handle AJAX Backend Requests at the very beginning to prevent HTML output conflict
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['check'])) {
    ob_start();
    session_start();
    require_once "config.php";
    $result = $conn->query("SELECT qr_code, pairing_code FROM bot_sessions LIMIT 1");
    $qr_code = null;
    $pairing_code = null;
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $qr_code = $row['qr_code'];
        $pairing_code = $row['pairing_code'];
    }
    
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['qr_code' => $qr_code, 'pairing_code' => $pairing_code]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    ob_start();
    session_start();
    require_once "config.php";
    $input = json_decode(file_get_contents('php://input'), true);
    $phone = isset($input['phone']) ? $input['phone'] : '';
    
    if (!empty($phone)) {
        $check = $conn->query("SELECT id FROM bot_sessions LIMIT 1");
        if ($check && $check->num_rows > 0) {
            $row = $check->fetch_assoc();
            $id = $row['id'];
            // අලුත් Request එකක් යවන විට පරණ pairing_code සහ qr_code දෙකම NULL කර reset කරයි
            $stmt = $conn->prepare("UPDATE bot_sessions SET requested_phone = ?, pairing_code = NULL, qr_code = NULL WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("si", $phone, $id);
                $stmt->execute();
                $stmt->close();
            }
        }
        ob_end_clean();
        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'message' => 'Request saved']);
        exit;
    }
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Invalid phone']);
    exit;
}

// 2. Normal Page Session Check
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$logged_in_name = isset($_SESSION['name']) ? $_SESSION['name'] : 'User';
$logged_in_whatsapp = isset($_SESSION['whatsapp']) ? $_SESSION['whatsapp'] : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sew Queen – Bot Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #0b0a0f; color: #e8e4f0; display: flex; min-height: 100vh; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1a1825; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: #9d5cf5; }

        .sidebar { width: 260px; background: linear-gradient(180deg, #12101e 0%, #1a172b 100%); border-right: 1px solid rgba(124, 58, 237, 0.25); display: flex; flex-direction: column; padding: 28px 18px 30px; position: sticky; top: 0; height: 100vh; overflow-y: auto; flex-shrink: 0; transition: transform 0.3s ease; z-index: 100; }
        .sidebar-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid rgba(124, 58, 237, 0.20); }
        .sidebar-brand .brand-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed, #a855f7, #ec4899); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; box-shadow: 0 8px 24px rgba(124, 58, 237, 0.40); flex-shrink: 0; }
        .sidebar-brand .brand-text h1 { font-size: 20px; font-weight: 700; background: linear-gradient(135deg, #f5e9ff, #c4b5fd, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .sidebar-brand .brand-text span { font-size: 11px; font-weight: 500; color: #8b7aa8; letter-spacing: 0.8px; text-transform: uppercase; -webkit-text-fill-color: #8b7aa8; }
        
        .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .sidebar-nav .nav-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: #5d4e78; padding: 16px 12px 8px; }
        .sidebar-nav a { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 12px; color: #b6aad0; text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.20s ease; }
        .sidebar-nav a i { width: 20px; font-size: 16px; text-align: center; color: #7d6b9e; }
        .sidebar-nav a:hover { background: rgba(124, 58, 237, 0.15); color: #f0eaff; }
        .sidebar-nav a.active { background: linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(236, 72, 153, 0.15)); color: #fff; box-shadow: inset 0 0 0 1px rgba(124, 58, 237, 0.30); }
        .sidebar-nav a.active i { color: #c084fc; }
        .sidebar-nav a .badge { margin-left: auto; background: linear-gradient(135deg, #7c3aed, #ec4899); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 10px; border-radius: 20px; }

        .sidebar-footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(124, 58, 237, 0.15); }
        .sidebar-footer .user-card { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); }
        .sidebar-footer .user-card .avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #ec4899); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px; color: #fff; }
        .sidebar-footer .user-card .user-info .name { font-size: 13px; font-weight: 600; color: #e4def0; }
        .sidebar-footer .user-card .user-info .role { font-size: 11px; color: #8b7aa8; }
        .sidebar-footer .user-card .logout-btn { color: #8b7aa8; background: none; border: none; font-size: 16px; cursor: pointer; padding: 4px; }

        .main-content { flex: 1; padding: 28px 36px 40px; overflow-y: auto; background: radial-gradient(ellipse at 20% 20%, #14111f 0%, #0b0a0f 100%); min-height: 100vh; }
        .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .topbar .page-title h2 { font-size: 24px; font-weight: 700; color: #f0eaff; }
        .topbar .page-title p { font-size: 14px; color: #8b7aa8; margin-top: 2px; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; margin-bottom: 32px; }
        .stat-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(124, 58, 237, 0.12); border-radius: 18px; padding: 20px 22px; transition: all 0.25s ease; }
        .stat-card:hover { border-color: rgba(124, 58, 237, 0.30); transform: translateY(-2px); }
        .stat-card .stat-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .stat-card .stat-icon.purple { background: rgba(124, 58, 237, 0.20); color: #a78bfa; }
        .stat-card .stat-icon.pink { background: rgba(236, 72, 153, 0.20); color: #f472b6; }
        .stat-card .stat-icon.gold { background: rgba(245, 158, 11, 0.20); color: #fbbf24; }
        .stat-card .stat-icon.green { background: rgba(52, 211, 153, 0.18); color: #34d399; }
        .stat-card .stat-number { font-size: 28px; font-weight: 700; color: #f0eaff; margin-top: 10px; }
        .stat-card .stat-label { font-size: 13px; color: #8b7aa8; font-weight: 500; }
        .stat-card .stat-change { font-size: 12px; font-weight: 600; margin-top: 8px; display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 20px; }
        .stat-card .stat-change.up { background: rgba(52, 211, 153, 0.15); color: #34d399; }
        .stat-card .stat-change.down { background: rgba(244, 63, 94, 0.15); color: #fb7185; }

        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px; }
        @media (max-width: 1000px) { .dashboard-grid { grid-template-columns: 1fr; } }
        
        .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(124, 58, 237, 0.10); border-radius: 18px; padding: 24px 26px; }
        .card .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .card .card-header h3 { font-size: 16px; font-weight: 600; color: #f0eaff; display: flex; align-items: center; gap: 10px; }
        .card .card-header h3 i { color: #7c3aed; font-size: 18px; }
        .card .card-header .card-action { font-size: 12px; font-weight: 600; color: #7c3aed; background: rgba(124, 58, 237, 0.15); padding: 4px 14px; border-radius: 20px; border: none; cursor: pointer; }

        .bot-status-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
        .bot-status-item .left .status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 10px; }
        .bot-status-item .left .status-dot.online { background: #34d399; box-shadow: 0 0 12px rgba(52, 211, 153, 0.40); }
        .bot-status-item .left .status-dot.pairing { background: #fbbf24; animation: pulse-dot 1.4s infinite; }
        .bot-status-item .left .status-dot.offline { background: #64748b; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; transform: scale(0.85); } }
        .bot-status-item .left .info .name { font-size: 14px; font-weight: 600; color: #e8e4f0; }
        .bot-status-item .left .info .sub { font-size: 12px; color: #7d6b9e; }
        .bot-status-item .right .status-text { font-size: 12px; font-weight: 600; padding: 4px 14px; border-radius: 20px; background: rgba(124, 58, 237, 0.12); color: #a78bfa; }
        .bot-status-item .right .status-text.online { background: rgba(52, 211, 153, 0.15); color: #34d399; }
        .bot-status-item .right .status-text.pairing { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

        .tabs { display: flex; gap: 8px; margin-bottom: 20px; background: rgba(124, 58, 237, 0.08); padding: 4px; border-radius: 30px; }
        .tab-btn { flex: 1; padding: 8px; border: none; background: transparent; color: #8b7aa8; font-weight: 600; border-radius: 30px; cursor: pointer; transition: 0.3s; font-size: 12px; }
        .tab-btn.active { background: #7c3aed; color: #fff; box-shadow: 0 0 12px rgba(124, 58, 237, 0.4); }
        .tab-content { display: none; }
        .tab-content.active { display: block; }

        .qr-request-box { margin-bottom: 15px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 12px; padding: 15px; }
        .qr-request-box label { display: block; font-size: 12px; color: #b6aad0; font-weight: 600; margin-bottom: 8px; }
        .input-group { display: flex; gap: 8px; }
        .input-group input { flex: 1; padding: 10px 14px; background: #1a1a2e; border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 8px; color: white; font-size: 14px; outline: none; }
        .input-group input:focus { border-color: #a855f7; }
        .input-group button { background: linear-gradient(135deg, #7c3aed, #a855f7); border: none; border-radius: 8px; color: white; font-weight: bold; padding: 0 15px; cursor: pointer; font-size: 12px; white-space: nowrap; }

        .code-box { background: rgba(0, 0, 0, 0.4); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 15px; border: 2px dashed rgba(124, 58, 237, 0.3); font-family: 'Orbitron', monospace; font-size: 32px; font-weight: 900; color: #c084fc; letter-spacing: 4px; text-shadow: 0 0 15px rgba(192, 132, 252, 0.4); }
        .code-box .empty-code { color: #555; font-size: 20px; letter-spacing: 2px; }

        .qr-code-area { background: #1a1a2e; border: 1px dashed rgba(124, 58, 237, 0.4); border-radius: 12px; padding: 15px; text-align: center; min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .qr-code-area i { font-size: 40px; color: #7c3aed; margin-bottom: 8px; }
        .qr-code-area p { color: #8b7aa8; font-size: 12px; }
        .qr-img { width: 200px; height: 200px; border-radius: 10px; border: 2px solid #34d399; background: white; padding: 6px; }

        .config-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
        .config-row .label { font-size: 14px; color: #d4cee6; }
        .config-row .value .tag { background: rgba(124, 58, 237, 0.15); padding: 2px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; color: #a78bfa; }
        .toggle-switch { width: 40px; height: 22px; background: #2a2540; border-radius: 30px; position: relative; cursor: pointer; display: inline-block; vertical-align: middle; }
        .toggle-switch.active { background: linear-gradient(135deg, #7c3aed, #a855f7); }
        .toggle-switch .thumb { width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.25s; }
        .toggle-switch.active .thumb { left: 20px; }

        .activity-item { display: flex; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
        .activity-item .act-icon { width: 32px; height: 32px; border-radius: 50%; background: rgba(124, 58, 237, 0.12); display: flex; align-items: center; justify-content: center; color: #a78bfa; font-size: 13px; }
        .activity-item .act-text { font-size: 13px; color: #d4cee6; }
        .activity-item .act-time { font-size: 11px; color: #5d4e78; margin-left: auto; }

        .menu-toggle { display: none; background: none; border: none; color: #b6aad0; font-size: 24px; cursor: pointer; }
        @media (max-width: 768px) {
            .sidebar { position: fixed; transform: translateX(-100%); width: 280px; z-index: 100; box-shadow: 0 0 60px rgba(0, 0, 0, 0.70); }
            .sidebar.open { transform: translateX(0); }
            .menu-toggle { display: block; }
            .main-content { padding: 20px 18px 30px; }
            .stats-grid { grid-template-columns: 1fr 1fr; }
            .dashboard-grid { grid-template-columns: 1fr; }
        }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.60); z-index: 90; }
        .sidebar-overlay.show { display: block; }
        .loading-msg { color: #25d366; font-size: 12px; margin-top: 6px; display: none; text-align: center; }
        .error-msg { color: #ff6b6b; font-size: 12px; margin-top: 6px; display: none; text-align: center; }
    </style>
</head>
<body>

    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
            <div class="brand-icon"><i class="fas fa-crown"></i></div>
            <div class="brand-text"><h1>Sew Queen</h1><span>Bot Manager</span></div>
        </div>
        <nav class="sidebar-nav">
            <div class="nav-label">Main</div>
            <a href="#" class="active"><i class="fas fa-th-large"></i> Dashboard</a>
            <a href="#"><i class="fas fa-robot"></i> Bot <span class="badge">Live</span></a>
            <a href="#"><i class="fas fa-qrcode"></i> Pair Code</a>
            <a href="#"><i class="fas fa-sliders-h"></i> Settings</a>
            <div class="nav-label">Admin</div>
            <a href="#"><i class="fas fa-users"></i> Users</a>
            <a href="#"><i class="fas fa-chart-line"></i> Analytics</a>
            <a href="#"><i class="fas fa-file-alt"></i> Logs</a>
        </nav>
        <div class="sidebar-footer">
            <div class="user-card">
                <div class="avatar"><?php echo strtoupper(substr($logged_in_name, 0, 2)); ?></div>
                <div class="user-info">
                    <div class="name"><?php echo htmlspecialchars($logged_in_name); ?></div>
                    <div class="role">WhatsApp User</div>
                </div>
                <a href="logout.php" class="logout-btn" title="Logout"><i class="fas fa-sign-out-alt"></i></a>
            </div>
        </div>
    </aside>

    <main class="main-content">
        <header class="topbar">
            <div class="page-title">
                <div style="display:flex;align-items:center;gap:10px;">
                    <button class="menu-toggle" id="menuToggle"><i class="fas fa-bars"></i></button>
                    <h2>Dashboard</h2>
                    <span style="background: rgba(52, 211, 153, 0.15); color: #34d399; font-size: 10px; font-weight: 600; padding: 2px 10px; border-radius: 30px;">System Online</span>
                </div>
                <p>Welcome back, <?php echo htmlspecialchars($logged_in_name); ?> · Manage your bot with ease.</p>
            </div>
        </header>

        <section class="stats-grid">
            <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-robot"></i></div><div class="stat-number">1</div><div class="stat-label">Active Bots</div><div class="stat-change up"><i class="fas fa-arrow-up"></i> Stable</div></div>
            <div class="stat-card"><div class="stat-icon pink"><i class="fas fa-users"></i></div><div class="stat-number">128</div><div class="stat-label">Total Users</div><div class="stat-change up"><i class="fas fa-arrow-up"></i> 12%</div></div>
            <div class="stat-card"><div class="stat-icon gold"><i class="fas fa-qrcode"></i></div><div class="stat-number">Live</div><div class="stat-label">Connection Mode</div><div class="stat-change up">Secure</div></div>
            <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div><div class="stat-number">99.8%</div><div class="stat-label">Uptime</div><div class="stat-change up"><i class="fas fa-arrow-up"></i> Optimal</div></div>
        </section>

        <div class="dashboard-grid">
            <div class="card">
                <div class="card-header"><h3><i class="fas fa-robot"></i> Bot Status</h3><button class="card-action" onclick="location.reload()">Refresh</button></div>
                <div class="bot-status-item"><div class="left"><span class="status-dot online"></span><div class="info"><div class="name">Sew Queen Main Bot</div><div class="sub">ID: SQ-001</div></div></div><div class="right"><span class="status-text online">Active</span></div></div>

                <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);">
                    <div class="config-row"><span class="label"><i class="fas fa-power-off"></i> Auto-Start Bot</span><div class="value"><span class="tag">Enabled</span><div class="toggle-switch active" onclick="toggleSwitch(this)"><span class="thumb"></span></div></div></div>
                    <div class="config-row"><span class="label"><i class="fas fa-clock"></i> Keep Alive</span><div class="value"><span class="tag">30 min</span><div class="toggle-switch active" onclick="toggleSwitch(this)"><span class="thumb"></span></div></div></div>
                    <div class="config-row"><span class="label"><i class="fas fa-shield-alt"></i> Auto-Reconnect</span><div class="value"><span class="tag">On</span><div class="toggle-switch active" onclick="toggleSwitch(this)"><span class="thumb"></span></div></div></div>
                </div>
            </div>

            <div>
                <!-- Pair Code & QR Integration Card -->
                <div class="card" style="margin-bottom:24px;">
                    <div class="card-header"><h3><i class="fas fa-qrcode"></i> Pairing Terminal</h3></div>

                    <!-- Tabs Switcher -->
                    <div class="tabs">
                        <button class="tab-btn active" onclick="switchTab('pair')">PAIR CODE</button>
                        <button class="tab-btn" onclick="switchTab('qr')">QR SCAN</button>
                    </div>

                    <!-- Pair Code Tab -->
                    <div id="tab-pair" class="tab-content active">
                        <div class="qr-request-box">
                            <label>Enter WhatsApp Number:</label>
                            <div class="input-group">
                                <input type="text" id="phoneNumber" placeholder="9474xxxxxxx">
                                <button onclick="generateCode()" id="generateBtn">Request</button>
                            </div>
                        </div>

                        <div id="loadingMsg" class="loading-msg">Requesting code from server...</div>
                        <div id="errorMsg" class="error-msg"></div>

                        <div style="font-size: 11px; color: #8b7aa8; margin-bottom: 6px; letter-spacing: 1px;">YOUR CONNECTION CODE</div>
                        <div class="code-box" id="codeDisplay">
                            <span class="empty-code">- - - - - - -</span>
                        </div>
                    </div>

                    <!-- QR Code Tab -->
                    <div id="tab-qr" class="tab-content">
                        <div style="font-size: 11px; color: #8b7aa8; margin-bottom: 10px; letter-spacing: 1px;">SCAN WITH WHATSAPP</div>
                        <div class="qr-code-area" id="qrContent">
                            <i class="fas fa-qrcode"></i>
                            <p>Waiting for QR code generation...</p>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header"><h3><i class="fas fa-bolt" style="color:#fbbf24;"></i> Recent Activity</h3></div>
                    <div class="activity-item"><div class="act-icon"><i class="fas fa-link"></i></div><div class="act-text">Dashboard Loaded</div><div class="act-time">Just now</div></div>
                    <div class="activity-item"><div class="act-icon"><i class="fas fa-user-check"></i></div><div class="act-text">User authenticated</div><div class="act-time">Session active</div></div>
                </div>
            </div>
        </div>
    </main>

    <script>
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        menuToggle.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); });
        overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); });

        function toggleSwitch(el) { el.classList.toggle('active'); }

        function switchTab(tab) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById('tab-' + tab).classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(btn => {
                if (btn.textContent.includes(tab === 'pair' ? 'PAIR CODE' : 'QR SCAN')) {
                    btn.classList.add('active');
                }
            });
        }

        // Global background polling for both QR and Pairing Code
        setInterval(async () => {
            try {
                const checkRes = await fetch('sewqueenuserdashboard.php?check=1');
                const checkData = await checkRes.json();

                // Update QR Code
                if (checkData.qr_code) {
                    document.getElementById('qrContent').innerHTML = `<img src="data:image/png;base64,${checkData.qr_code}" class="qr-img" alt="QR Code">`;
                } else {
                    document.getElementById('qrContent').innerHTML = `<i class="fas fa-qrcode"></i><p>Waiting for QR code generation...</p>`;
                }

                // Update Pairing Code
                if (checkData.pairing_code) {
                    const codeBox = document.getElementById('codeDisplay');
                    if (codeBox.textContent !== checkData.pairing_code) {
                        codeBox.textContent = checkData.pairing_code;
                        document.getElementById('loadingMsg').style.display = 'none';
                        document.getElementById('generateBtn').disabled = false;
                    }
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        }, 2000);

        async function generateCode() {
            const phone = document.getElementById('phoneNumber').value.trim();
            const btn = document.getElementById('generateBtn');
            const codeBox = document.getElementById('codeDisplay');
            const loadingMsg = document.getElementById('loadingMsg');
            const errorMsg = document.getElementById('errorMsg');

            if (!phone) {
                errorMsg.textContent = 'Please enter a phone number.';
                errorMsg.style.display = 'block';
                return;
            }

            btn.disabled = true;
            loadingMsg.style.display = 'block';
            loadingMsg.textContent = "Requesting code from server...";
            errorMsg.style.display = 'none';
            codeBox.innerHTML = '<span class="empty-code">Processing...</span>';

            try {
                const response = await fetch('sewqueenuserdashboard.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phone })
                });

                const data = await response.json();
                if (data.status !== "success") throw new Error(data.message);

                loadingMsg.textContent = "Waiting for bot response...";
                
            } catch (error) {
                errorMsg.textContent = 'Failed: ' + error.message;
                errorMsg.style.display = 'block';
                codeBox.innerHTML = '<span class="empty-code">- - - - - - -</span>';
                btn.disabled = false;
                loadingMsg.style.display = 'none';
            }
        }
    </script>
</body>
</html>