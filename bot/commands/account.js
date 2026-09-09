// ============================================================
// ACCOUNT COMMAND
// File: commands/account.js
// ============================================================

async function showAccount(ctx) {
    await ctx.sendInteractiveMenu({
        headerTitle: '⚙️ ගිණුම',

        bodyText:
            '👤 *ගිණුම් මෙනුව*\n\n' +
            '📌 ඔබගේ ගිණුම් තොරතුරු:',

        footerText: '© SEW QUEEN',

        buttons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '👤 පැතිකඩ',
                    id: 'acc_profile'
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '⚙️ සැකසුම්',
                    id: 'acc_settings'
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🔙 ආපසු',
                    id: 'acc_back'
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
    name: 'account',
    aliases: ['acc', 'profile'],

    buttonIds: [
        'main_account',
        'acc_profile',
        'acc_settings',
        'acc_back'
    ],

    async execute(ctx) {
        await showAccount(ctx);
    },

    async onButton(ctx) {
        switch (ctx.buttonId) {
            case 'main_account':
                await showAccount(ctx);
                return;

            case 'acc_back':
                await showMainMenu(ctx);
                return;

            case 'acc_profile': {
                const owner = await ctx.db.getSetting(
                    'owner_number',
                    'Not set'
                );

                await ctx.sendText(
                    `👤 *ඔබගේ පැතිකඩ*\n\n` +
                    `📌 *අංකය:* ${ctx.jid.replace('@s.whatsapp.net', '')}\n` +
                    `📌 *ගිණුම් තත්වය:* 🟢 Active\n` +
                    `📌 *බොට් හිමිකරු:* ${owner}`
                );
                return;
            }

            case 'acc_settings': {
                const prefix = await ctx.db.getSetting(
                    'prefix',
                    '.'
                );

                await ctx.sendText(
                    `⚙️ *සැකසුම් (Settings)*\n\n` +
                    `🔹 *වත්මන් සැකසුම්:*\n` +
                    `• Prefix: *${prefix}*\n` +
                    `• Mode: PUBLIC\n` +
                    `• භාෂාව: සිංහල\n` +
                    `• දැනුම්දීම්: ON 🔔`
                );
                return;
            }
        }
    }
};
