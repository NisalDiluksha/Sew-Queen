// ============================================================
// PING COMMAND
// Example of how to add a new command.
//
// Create a new file inside /commands and export:
//   name
//   aliases (optional)
//   execute(ctx)
//
// No changes to bot.js are required.
// ============================================================

module.exports = {
    name: 'ping',

    aliases: ['p'],

    buttonIds: [],

    async execute(ctx) {
        const started = Date.now();

        await ctx.sendText('🏓 Pong!');

        const ms = Date.now() - started;

        // Keep the output simple and safe.
        console.log(`🏓 Ping command handled in ${ms}ms`);
    },

    async onButton() {
        // No buttons for this command.
    }
};
