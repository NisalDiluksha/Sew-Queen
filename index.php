<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Sew Queen | WhatsApp Bot</title>

    <link rel="stylesheet" href="style.css">
</head>

<body>

    <!-- NAVBAR -->
    <nav class="navbar">

        <div class="logo">
            <!-- ලෝගෝ එක සහ "Sew Queen" නම එකට -->
            <a href="#" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
                <img src="https://i.ibb.co/vGN2vVz/IMG-20260908-232029.jpg" alt="Sew Queen Logo" style="height: 40px; width: auto; border-radius: 8px;">
                <span style="font-weight: bold; font-size: 1.2rem;">Sew Queen</span>
            </a>
        </div>

        <div class="nav-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#commands">Commands</a>
        </div>

        <!-- Login/Register බොත්තම් (වෙනස් කර නැත) -->
        <div class="nav-button" style="display: flex; gap: 10px;">
            <a href="login.php" class="login-btn" style="padding: 10px 20px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; text-decoration: none; color: white; font-weight: bold;">Login</a>
            <a href="register.php" class="register-btn" style="padding: 10px 20px; background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 8px; text-decoration: none; color: white; font-weight: bold;">Register</a>
        </div>

    </nav>


    <!-- HERO SECTION -->
    <section class="hero" id="home">

        <div class="hero-content">

            <!-- දෙකම එකට අල්ලගෙන ඉන්න Wrapper එක -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px;">
                
                <!-- 1. ලෝගෝ එක -->
                <img src="https://i.ibb.co/vGN2vVz/IMG-20260908-232029.jpg" alt="Sew Queen Logo" style="width: 180px; height: auto; border-radius: 15px; box-shadow: 0 0 20px rgba(255,255,255,0.2);">

                <!-- 2. ලෝගෝ එකට කෙලින්ම යටින් බැජ් එක -->
                <div class="badge">
                    WhatsApp Bot
                </div>

            </div>

            <!-- 3. ඊට පස්සේ Heading එක -->
            <h1>
                Meet <span>Sew Queen</span>
            </h1>

            <p>
                A powerful and modern WhatsApp bot designed
                to make your WhatsApp experience easier and smarter.
            </p>

            <div class="hero-buttons">

                <!-- Connect WhatsApp බොත්තම මෙතනට ආපහු එකතු කළා -->
                <a href="#" class="primary-btn">
                    Connect WhatsApp
                </a>

                <a href="#features" class="secondary-btn">
                    Explore Features
                </a>

            </div>

        </div>

    </section>


    <!-- HOW IT WORKS SECTION -->
    <section class="how-it-works" style="padding: 80px 20px; background: #0a0a0f; text-align: center;">
        <div class="section-title" style="max-width: 800px; margin: 0 auto 50px auto;">
            <p style="color: #a855f7; font-size: 14px; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase;">HOW IT WORKS</p>
            <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 10px; color: white;">Get Started in Minutes</h2>
            <span style="color: #bbb;">Three simple steps to unleash the power of Sew Queen.</span>
        </div>

        <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; max-width: 1000px; margin: 0 auto;">
            
            <div class="step-card" style="background: #1a1a2e; padding: 30px; border-radius: 15px; width: 280px; border: 1px solid #333; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <div style="font-size: 3rem; margin-bottom: 15px;">🔗</div>
                <h3 style="color: #fff; margin-bottom: 10px; font-size: 1.4rem;">1. Connect</h3>
                <p style="color: #aaa; line-height: 1.6;">Scan the QR code to link your WhatsApp account securely with Sew Queen.</p>
            </div>

            <div class="step-card" style="background: #1a1a2e; padding: 30px; border-radius: 15px; width: 280px; border: 1px solid #333; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <div style="font-size: 3rem; margin-bottom: 15px;">⚙️</div>
                <h3 style="color: #fff; margin-bottom: 10px; font-size: 1.4rem;">2. Customize</h3>
                <p style="color: #aaa; line-height: 1.6;">Set up your commands, welcome messages, and powerful automation features easily.</p>
            </div>

            <div class="step-card" style="background: #1a1a2e; padding: 30px; border-radius: 15px; width: 280px; border: 1px solid #333; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <div style="font-size: 3rem; margin-bottom: 15px;">🤖</div>
                <h3 style="color: #fff; margin-bottom: 10px; font-size: 1.4rem;">3. Automate</h3>
                <p style="color: #aaa; line-height: 1.6;">Sit back and relax. Sew Queen will handle all the responses and tasks for you.</p>
            </div>

        </div>
    </section>


    <!-- FEATURES SECTION -->
    <section class="features-section" id="features">

        <div class="section-title">

            <p>FEATURES</p>

            <h2>
                Everything You Need
            </h2>

            <span>
                Powerful features packed into Sew Queen.
            </span>

        </div>


        <div class="features-container">

            <!-- අලුත් කාඩ්පත් 3ක් ඇතුළත් කර ඇත -->
            <div class="feature-card">

                <div class="feature-icon">
                    ⚡
                </div>

                <h3>
                    Fast Response
                </h3>

                <p>
                    Get quick responses and smooth performance
                    whenever you use Sew Queen.
                </p>

            </div>


            <div class="feature-card">

                <div class="feature-icon">
                    🤖
                </div>

                <h3>
                    Smart Bot
                </h3>

                <p>
                    A powerful WhatsApp bot with useful commands
                    and automated features.
                </p>

            </div>


            <div class="feature-card">

                <div class="feature-icon">
                    🔒
                </div>

                <h3>
                    Reliable
                </h3>

                <p>
                    Built with a clean and reliable system
                    for a better experience.
                </p>

            </div>

            <!-- මෙතැන් සිට අමතර කාඩ්පත් 3 -->
            <div class="feature-card">

                <div class="feature-icon">
                    💬
                </div>

                <h3>
                    WhatsApp Integration
                </h3>

                <p>
                    Connect directly to your WhatsApp account
                    with a seamless and secure login system.
                </p>

            </div>


            <div class="feature-card">

                <div class="feature-icon">
                    ⚙️
                </div>

                <h3>
                    Bot Automation
                </h3>

                <p>
                    Automate replies, group management, and tasks
                    to save time and provide instant support.
                </p>

            </div>


            <div class="feature-card">

                <div class="feature-icon">
                    🧠
                </div>

                <h3>
                    Meta AI Ready
                </h3>

                <p>
                    Powered by Meta's advanced AI technologies
                    for smarter and more natural conversations.
                </p>

            </div>

        </div>

    </section>


    <!-- COMMANDS SECTION -->
    <section class="commands-section" id="commands">

        <div class="section-title">

            <p>COMMANDS</p>

            <h2>
                Powerful Commands
            </h2>

            <span>
                Explore what Sew Queen can do.
            </span>

        </div>


        <div class="commands-container">

            <div class="command-card">
                <h3>.menu</h3>
                <p>Show all available commands.</p>
            </div>

            <div class="command-card">
                <h3>.ping</h3>
                <p>Check the bot response speed.</p>
            </div>

            <div class="command-card">
                <h3>.owner</h3>
                <p>Get the bot owner's information.</p>
            </div>

            <div class="command-card">
                <h3>.alive</h3>
                <p>Check whether the bot is online.</p>
            </div>

        </div>

    </section>


    <!-- FOOTER -->
    <footer>

        <div class="footer-content">

            <h3 style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                <img src="https://i.ibb.co/vGN2vVz/IMG-20260908-232029.jpg" alt="Sew Queen Logo" style="height: 35px; border-radius: 5px;">
                Sew Queen
            </h3>

            <p>
                Powerful WhatsApp Bot
            </p>

            <span>
                © 2026 Sew Queen. All rights reserved.
            </span>

        </div>

    </footer>


    <script src="script.js"></script>

</body>

</html>