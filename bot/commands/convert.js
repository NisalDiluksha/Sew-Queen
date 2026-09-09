const axios = require('axios');

module.exports = [
    {
        name: 'tts',
        aliases: ['say'],
        async execute(ctx) {
            const text = ctx.args.join(' ');
            if (!text) {
                return ctx.sendText('🔊 Usage: `.tts ආයුබෝවන්`');
            }

            const url =
                'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=si&q=' +
                encodeURIComponent(text.slice(0, 180));

            try {
                await ctx.sendMessage({
                    audio: { url },
                    mimetype: 'audio/mp4',
                    ptt: true
                });
            } catch (error) {
                console.error('tts error', error.message);
                await ctx.sendText('❌ TTS fail වුණා.');
            }
        }
    },
    {
        name: 'tinyurl',
        aliases: ['short', 'shorturl'],
        async execute(ctx) {
            const link = ctx.args[0];
            if (!link) {
                return ctx.sendText('🔗 Usage: `.tinyurl https://example.com`');
            }

            try {
                const { data } = await axios.get(
                    'https://tinyurl.com/api-create.php',
                    {
                        params: { url: link },
                        timeout: 12000
                    }
                );

                await ctx.sendText(
                    `🔗 *Short URL*\n\n${data}\n\n✨ *SEW QUEEN*`
                );
            } catch (error) {
                await ctx.sendText('❌ URL shorten කරන්න බැරි වුණා.');
            }
        }
    }
];
