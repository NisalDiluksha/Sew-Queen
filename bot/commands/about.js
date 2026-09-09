// ============================================================
// ABOUT COMMAND
// File: commands/about.js
// ============================================================

module.exports = {
    name: 'about',
    aliases: ['info'],

    buttonIds: [
        'main_about'
    ],

    async execute(ctx) {
        await sendAbout(ctx);
    },

    async onButton(ctx) {
        if (ctx.buttonId === 'main_about') {
            await sendAbout(ctx);
        }
    }
};

async function sendAbout(ctx) {
    await ctx.sendText(
        `ℹ️ *SEW QUEEN BOT*\n\n` +
        `🤖 *බොට් නම:* Sew Queen Bot\n` +
        `📌 *අනුවාදය:* v3.0.0\n` +
        `👨‍💻 *සංවර්ධක:* Sew Queen Team\n` +
        `🌐 *වෙබ්:* www.sewqueen.lk\n\n` +
        `✨ *භාවිතා කරන ආකාරය:*\n` +
        `බොත්තම් ඔබා පමණක් සියල්ල කරන්න!`
    );

    const menu = require('./menu');
    await menu.execute(ctx);
}
