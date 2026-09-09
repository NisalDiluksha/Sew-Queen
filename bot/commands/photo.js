const axios = require('axios');

async function sendRandomImage(ctx, query) {
    const url =
        'https://source.unsplash.com/800x1000/?' +
        encodeURIComponent(query || 'fashion');

    await ctx.sendMessage({
        image: { url },
        caption: `🖼️ *${query || 'wallpaper'}*\n\n✨ *SEW QUEEN*`
    });
}

module.exports = [
    {
        name: 'wallpaper',
        aliases: ['wp'],
        async execute(ctx) {
            try {
                await sendRandomImage(ctx, ctx.args.join(' ') || 'aesthetic');
            } catch (error) {
                await ctx.sendText('❌ Wallpaper ගන්න බැරි වුණා.');
            }
        }
    },
    {
        name: 'unsplash',
        aliases: [],
        async execute(ctx) {
            const query = ctx.args.join(' ') || 'nature';
            try {
                await sendRandomImage(ctx, query);
            } catch (error) {
                await ctx.sendText('❌ Unsplash image ගන්න බැරි වුණා.');
            }
        }
    },
    {
        name: 'pinterest',
        aliases: ['pin'],
        async execute(ctx) {
            const query = ctx.args.join(' ');
            if (!query) {
                return ctx.sendText('📌 Usage: `.pinterest sewing`');
            }

            try {
                const { data } = await axios.get(
                    'https://api.duckduckgo.com/',
                    {
                        params: {
                            q: query + ' pinterest',
                            format: 'json'
                        },
                        timeout: 12000
                    }
                );

                const image =
                    data.Image ||
                    'https://source.unsplash.com/800x1000/?' +
                        encodeURIComponent(query);

                await ctx.sendMessage({
                    image: { url: image.startsWith('http') ? image : 'https:' + image },
                    caption:
                        `📌 *Pinterest search*\n${query}\n\n✨ *SEW QUEEN*`
                });
            } catch (error) {
                await sendRandomImage(ctx, query);
            }
        }
    }
];
