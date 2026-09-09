module.exports = {
    name: 'alive',
    aliases: ['status', 'bot'],

    buttonIds: ['sew_developer'], 

    async execute(ctx) {
        const imageUrl = 'https://i.ibb.co/207Sfhyp/sew-queen.jpg';
        const start = Date.now();

        const caption =
            '╔════════════════════════════════╗\n' +
            '║       ✨ *SEW QUEEN BOT* ✨     ║\n' +
            '╠════════════════════════════════╣\n' +
            '║                                ║\n' +
            '║        🟢 *BOT ALIVE*          ║\n' +
            '║                                ║\n' +
            '║   🤖 Status : *ONLINE*         ║\n' +
            '║   ⚡ Speed  : *' + (Date.now() - start) + ' ms*                 ║\n' +
            '║   🔥 System : *ACTIVE*         ║\n' +
            '║                                ║\n' +
            '║   🎀 SEW QUEEN is ready!       ║\n' +
            '║                                ║\n' +
            '╚════════════════════════════════╝\n\n' +
            '💫 *Your bot is alive and ready to work!*';

        await ctx.sendInteractiveMenu({
            headerTitle: '🟢 SEW QUEEN BOT',
            bodyText: caption,
            footerText: '© SEW QUEEN',
            image: imageUrl,
            buttons: [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '👨‍💻 Chat with Developer',
                        id: 'sew_developer'
                    })
                }
            ]
        });
    },

    async onButton(ctx) {
        // ඔයාගේ Developer අංකය සඳහා Click-to-Chat Link එක
        const devLink = 'https://wa.me/94775663026';

        try {
            // === බොත්තම click කළාම user ගේ chat එකට Auto මැසේජ් එක යවනවා ===
            await ctx.sendText(
                'Hi Sew Queen Whatsapp Bot Developer\n\n' +
                '👨‍💻 Developer සමඟ කතා කිරීමට පහත Link එක Click කරන්න:\n' +
                devLink
            );

        } catch (error) {
            console.error('Error sending message:', error);
            await ctx.sendText('❌ Error එකක් ආවා. ආයෙත් උත්සාහ කරන්න.');
        }
    }
};