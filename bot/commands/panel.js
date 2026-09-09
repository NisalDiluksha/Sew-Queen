// ============================================================
// PANEL COMMAND
// File: commands/panel.js
// ============================================================

async function showPanel(ctx) {
    await ctx.sendInteractiveMenu({
        headerTitle: '📊 පැනලය',

        bodyText:
            '📊 *SEW QUEEN Panel*\n\n' +
            '📌 පද්ධති තත්වය:',

        footerText: '© SEW QUEEN',

        buttons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '📈 සංඛ්‍යාලේඛන',
                    id: 'panel_stats'
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🔙 ආපසු',
                    id: 'panel_back'
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
    name: 'panel',
    aliases: ['stats'],

    buttonIds: [
        'main_panel',
        'panel_stats',
        'panel_back'
    ],

    async execute(ctx) {
        await showPanel(ctx);
    },

    async onButton(ctx) {
        switch (ctx.buttonId) {
            case 'main_panel':
                await showPanel(ctx);
                return;

            case 'panel_back':
                await showMainMenu(ctx);
                return;

            case 'panel_stats': {
                const uptime = process.uptime();

                const hours =
                    Math.floor(uptime / 3600);

                const minutes =
                    Math.floor((uptime % 3600) / 60);

                const platform =
                    process.platform === 'win32'
                        ? 'Windows'
                        : process.platform === 'darwin'
                            ? 'macOS'
                            : 'Linux';

                await ctx.sendText(
                    `📊 *System Statistics*\n\n` +
                    `⏱️ *Uptime:* ${hours}h ${minutes}m\n` +
                    `💻 *Platform:* ${platform}\n` +
                    `📌 *Version:* 2.5.0\n` +
                    `🟢 *Status:* Online\n\n` +
                    `📈 *Performance:*\n` +
                    `• CPU: 12%\n` +
                    `• Memory: 256 MB`
                );
                return;
            }
        }
    }
};
