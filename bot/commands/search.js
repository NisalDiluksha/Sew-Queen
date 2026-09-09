const axios = require('axios');
const yts = require('yt-search');

async function sendError(ctx, error) {
    console.error('search error:', error.message);
    await ctx.sendText('❌ Search එක fail වුණා. පස්සේ try කරන්න.');
}

module.exports = [
    {
        name: 'google',
        aliases: ['gsearch'],
        async execute(ctx) {
            const query = ctx.args.join(' ');
            if (!query) {
                return ctx.sendText('🔎 Usage: `.google Sew Queen`');
            }

            try {
                const { data } = await axios.get(
                    'https://api.duckduckgo.com/',
                    {
                        params: {
                            q: query,
                            format: 'json',
                            no_html: 1,
                            skip_disambig: 1
                        },
                        timeout: 15000
                    }
                );

                const related = (data.RelatedTopics || [])
                    .filter(item => item.Text && item.FirstURL)
                    .slice(0, 5)
                    .map((item, i) => `${i + 1}. *${item.Text}*\n${item.FirstURL}`)
                    .join('\n\n');

                await ctx.sendText(
                    `🔎 *Google / Search*\n` +
                    `📌 Query: *${query}*\n\n` +
                    (data.AbstractText
                        ? `📒 ${data.AbstractText}\n${data.AbstractURL || ''}\n\n`
                        : '') +
                    (related || 'ප්‍රතිඵල හම්බුණේ නැහැ.') +
                    `\n\n✨ *SEW QUEEN*`
                );
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    },
    {
        name: 'wiki',
        aliases: ['wikipedia'],
        async execute(ctx) {
            const query = ctx.args.join(' ');
            if (!query) {
                return ctx.sendText('📚 Usage: `.wiki Sri Lanka`');
            }

            try {
                const { data } = await axios.get(
                    'https://en.wikipedia.org/api/rest_v1/page/summary/' +
                        encodeURIComponent(query),
                    { timeout: 15000 }
                );

                await ctx.sendText(
                    `📚 *${data.title}*\n\n` +
                    `${data.extract || 'No summary.'}\n\n` +
                    `${data.content_urls?.desktop?.page || ''}\n\n✨ *SEW QUEEN*`
                );
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    },
    {
        name: 'joke',
        aliases: [],
        async execute(ctx) {
            try {
                const { data } = await axios.get(
                    'https://official-joke-api.appspot.com/random_joke',
                    { timeout: 12000 }
                );

                await ctx.sendText(
                    `😂 *Joke*\n\n${data.setup}\n\n👉 ${data.punchline}\n\n✨ *SEW QUEEN*`
                );
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    },
    {
        name: 'meme',
        aliases: [],
        async execute(ctx) {
            try {
                const { data } = await axios.get(
                    'https://meme-api.com/gimme',
                    { timeout: 15000 }
                );

                await ctx.sendMessage({
                    image: { url: data.url },
                    caption: `🤣 *${data.title}*\n\n✨ *SEW QUEEN*`
                });
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    },
    {
        name: 'fact',
        aliases: [],
        async execute(ctx) {
            try {
                const { data } = await axios.get(
                    'https://uselessfacts.jsph.pl/api/v2/facts/random',
                    { timeout: 12000 }
                );

                await ctx.sendText(`📌 *Fact*\n\n${data.text}\n\n✨ *SEW QUEEN*`);
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    },
    {
        name: 'advice',
        aliases: [],
        async execute(ctx) {
            try {
                const { data } = await axios.get(
                    'https://api.adviceslip.com/advice',
                    { timeout: 12000 }
                );

                await ctx.sendText(
                    `💡 *Advice*\n\n${data.slip.advice}\n\n✨ *SEW QUEEN*`
                );
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    },
    {
        name: 'quote',
        aliases: [],
        async execute(ctx) {
            try {
                const { data } = await axios.get(
                    'https://api.quotable.io/random',
                    { timeout: 12000 }
                );

                await ctx.sendText(
                    `💬 *"${data.content}"*\n\n— ${data.author}\n\n✨ *SEW QUEEN*`
                );
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    },
    {
        name: 'lyrics',
        aliases: ['lyric'],
        async execute(ctx) {
            const query = ctx.args.join(' ');
            if (!query) {
                return ctx.sendText('🎵 Usage: `.lyrics Shape of You`');
            }

            try {
                const search = await yts(query + ' lyrics');
                const video = search.videos[0];
                const [artist, ...titleParts] = query.split(' ');
                const title = titleParts.join(' ') || query;

                let lyrics = '';
                try {
                    const { data } = await axios.get(
                        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
                        { timeout: 12000 }
                    );
                    lyrics = (data.lyrics || '').slice(0, 3500);
                } catch {}

                await ctx.sendText(
                    `🎵 *Lyrics search*\n` +
                    `📌 ${video ? video.title : query}\n` +
                    `${video ? video.url : ''}\n\n` +
                    (lyrics || 'Lyrics auto-fetch එක fail වුණා. YouTube link එක බලන්න.') +
                    `\n\n✨ *SEW QUEEN*`
                );
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    },
    {
        name: 'pokedex',
        aliases: ['pokemon'],
        async execute(ctx) {
            const name = (ctx.args[0] || '').toLowerCase();
            if (!name) {
                return ctx.sendText('🐾 Usage: `.pokedex pikachu`');
            }

            try {
                const { data } = await axios.get(
                    `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`,
                    { timeout: 15000 }
                );

                const types = data.types.map(item => item.type.name).join(', ');
                const image =
                    data.sprites.other?.['official-artwork']?.front_default ||
                    data.sprites.front_default;

                await ctx.sendMessage({
                    image: { url: image },
                    caption:
                        `🐾 *${data.name.toUpperCase()}*\n` +
                        `ID: ${data.id}\n` +
                        `Type: ${types}\n` +
                        `Height: ${data.height}\n` +
                        `Weight: ${data.weight}\n\n✨ *SEW QUEEN*`
                });
            } catch (error) {
                await ctx.sendText('❌ Pokemon හම්බුණේ නැහැ.');
            }
        }
    },
    {
        name: 'anime',
        aliases: ['manga'],
        async execute(ctx) {
            const query = ctx.args.join(' ');
            if (!query) {
                return ctx.sendText('🌸 Usage: `.anime Naruto`');
            }

            try {
                const { data } = await axios.get(
                    'https://api.jikan.moe/v4/anime',
                    {
                        params: { q: query, limit: 1 },
                        timeout: 15000
                    }
                );

                const anime = data.data?.[0];
                if (!anime) {
                    return ctx.sendText('❌ Anime හම්බුණේ නැහැ.');
                }

                await ctx.sendMessage({
                    image: {
                        url: anime.images?.jpg?.image_url
                    },
                    caption:
                        `🌸 *${anime.title}*\n` +
                        `⭐ Score: ${anime.score || 'N/A'}\n` +
                        `📺 Episodes: ${anime.episodes || 'N/A'}\n` +
                        `📌 ${anime.synopsis ? anime.synopsis.slice(0, 600) : ''}\n\n✨ *SEW QUEEN*`
                });
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    },
    {
        name: 'gify',
        aliases: ['gif'],
        async execute(ctx) {
            const query = ctx.args.join(' ') || 'cute';

            try {
                const { data } = await axios.get(
                    `https://api.waifu.pics/sfw/dance`,
                    { timeout: 15000 }
                );

                await ctx.sendMessage({
                    video: { url: data.url },
                    gifPlayback: true,
                    caption: `🎞️ *GIF* • ${query}\n\n✨ *SEW QUEEN*`
                });
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    },
    {
        name: 'ytsearch',
        aliases: ['yts'],
        async execute(ctx) {
            const query = ctx.args.join(' ');
            if (!query) {
                return ctx.sendText('▶️ Usage: `.ytsearch Manike Mage Hithe`');
            }

            try {
                const search = await yts(query);
                const videos = (search.videos || []).slice(0, 5);
                const list = videos
                    .map(
                        (item, i) =>
                            `${i + 1}. *${item.title}*\n⏱️ ${item.timestamp} • ${item.url}`
                    )
                    .join('\n\n');

                await ctx.sendText(
                    `▶️ *YouTube Search*\n📌 ${query}\n\n${list}\n\n✨ *SEW QUEEN*`
                );
            } catch (error) {
                await sendError(ctx, error);
            }
        }
    }
];
