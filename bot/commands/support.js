// ============================================================
// SUPPORT COMMAND
// File: commands/support.js
// ============================================================

async function showSupport(ctx) {
    await ctx.sendInteractiveMenu({
        headerTitle: '🆘 සහාය',

        bodyText:
            '📞 *සහාය මධ්‍යස්ථානය*\n\n' +
            '📌 අවශ්‍ය සහාය වර්ගය තෝරන්න:',

        footerText: '© SEW QUEEN',

        buttons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '❓ FAQ',
                    id: 'sup_faq'
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '📞 සම්බන්ධ වන්න',
                    id: 'sup_contact'
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🔙 ආපසු',
                    id: 'sup_back'
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
    name: 'support',
    aliases: ['sup'],

    buttonIds: [
        'main_support',
        'sup_faq',
        'sup_contact',
        'sup_back'
    ],

    async execute(ctx) {
        await showSupport(ctx);
    },

    async onButton(ctx) {
        switch (ctx.buttonId) {
            case 'main_support':
                await showSupport(ctx);
                return;

            case 'sup_back':
                await showMainMenu(ctx);
                return;

            case 'sup_faq':
                await ctx.sendText(
                    `❓ *නිතර අසන ප්‍රශ්න (FAQ)*\n\n` +
                    `🔹 *බොට් එක ක්‍රියාත්මක වෙන්නේ කොහොමද?*\n` +
                    `බොට් එක 24/7 ක්‍රියාත්මකයි. ඔබට ඕනෑම වේලාවක භාවිතා කළ හැක.\n\n` +
                    `🔹 *මගේ දත්ත ආරක්ෂිතද?*\n` +
                    `ඔව්, සියලුම දත්ත ආරක්ෂිතව තබා ගනිමු.\n\n` +
                    `🔹 *මෙම සේවාවල මිල කීයද?*\n` +
                    `කරුණාකර අප හා සම්බන්ධ වී විස්තර දැනගන්න.`
                );
                return;

            case 'sup_contact':
                await ctx.sendText(
                    `📞 *අප හා සම්බන්ධ වන්න*\n\n` +
                    `📧 *විද්‍යුත් තැපෑල:*\n` +
                    `nisaldiluksha1@gmail.com\n\n` +
                    `📱 *දුරකථන:*\n` +
                    `+94 77 566 3026\n\n` +
                    `🕐 *කාර්යාල වේලාවන්:*\n` +
                    `සඳුදා - සිකුරාදා: 9AM - 6PM`
                );
                return;
        }
    }
};
