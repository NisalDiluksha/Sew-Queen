// ============================================================
// SERVICES COMMAND
// File: commands/services.js
//
// Text commands:
//   services
//   .services
//   service
//
// Button handlers for the Services menu are also here.
// ============================================================

async function showServices(ctx) {
    await ctx.sendInteractiveMenu({
        headerTitle: '💼 සේවා මෙනුව',

        bodyText:
            '🛠️ *අපගේ සේවා* 🛠️\n\n' +
            '📌 කරුණාකර සේවාව තෝරන්න:',

        footerText: '© SEW QUEEN',

        buttons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🌐 වෙබ්',
                    id: 'svc_web'
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '📱 ඇප්',
                    id: 'svc_app'
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '📢 අලෙවිකරණය',
                    id: 'svc_marketing'
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🔙 ආපසු',
                    id: 'svc_back'
                })
            }
        ]
    });
}

async function showMainMenu(ctx) {
    const menu = require('./menu');
    await menu.execute(ctx);
}

module.exports = {
    name: 'services',
    aliases: ['service'],

    buttonIds: [
        'main_services',
        'svc_web',
        'svc_app',
        'svc_marketing',
        'svc_back'
    ],

    async execute(ctx) {
        await showServices(ctx);
    },

    async onButton(ctx) {
        switch (ctx.buttonId) {
            case 'main_services':
                await showServices(ctx);
                return;

            case 'svc_back':
                await showMainMenu(ctx);
                return;

            case 'svc_web':
                await ctx.sendText(
                    `🌐 *වෙබ් සංවර්ධනය*\n\n` +
                    `📌 අපි නවීන වෙබ් අඩවි නිර්මාණය කරන්නෙමු.\n` +
                    `💻 භාවිතා කරන තාක්ෂණයන්:\n` +
                    `• React / Next.js\n` +
                    `• Node.js / PHP\n` +
                    `• MySQL / MongoDB\n\n` +
                    `💰 මිල ගණන් සඳහා අප හා සම්බන්ධ වන්න.`
                );
                return;

            case 'svc_app':
                await ctx.sendText(
                    `📱 *මොබයිල් ඇප් සංවර්ධනය*\n\n` +
                    `📌 Android සහ iOS යෙදුම් නිර්මාණය කරන්නෙමු.\n` +
                    `🛠️ භාවිතා කරන තාක්ෂණයන්:\n` +
                    `• Flutter / React Native\n` +
                    `• Kotlin / Swift\n\n` +
                    `💰 උපදෙස් සඳහා අප හා සම්බන්ධ වන්න.`
                );
                return;

            case 'svc_marketing':
                await ctx.sendText(
                    `📈 *ඩිජිටල් අලෙවිකරණය*\n\n` +
                    `📌 ඔබගේ ව්‍යාපාරය ඩිජිටල් ලෝකයට ගෙන එන්නෙමු.\n` +
                    `🎯 අපගේ සේවා:\n` +
                    `• SEO Optimization\n` +
                    `• Social Media Marketing\n` +
                    `• Google Ads Management\n\n` +
                    `💰 සාකච්ඡා සඳහා අමතන්න.`
                );
                return;
        }
    }
};
