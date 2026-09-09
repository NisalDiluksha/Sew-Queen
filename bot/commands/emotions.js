const axios = require('axios');

const ACTIONS = [
    'hug', 'kiss', 'pat', 'slap', 'cuddle', 'wink', 'wave', 'smile',
    'dance', 'cry', 'bite', 'bonk', 'kick', 'punch', 'highfive', 'yeet',
    'happy', 'sad', 'confused', 'bored', 'kill', 'stare', 'nervous',
    'scream', 'thinking', 'yes'
];

const FALLBACK = {
    happy: 'smile',
    sad: 'cry',
    confused: 'think',
    bored: 'sleep',
    nervous: 'awoo',
    scream: 'cry',
    thinking: 'think',
    yes: 'thumbsup',
    stare: 'glomp'
};

function makeCommand(action) {
    return {
        name: action,
        aliases: [],

        async execute(ctx) {
            const endpoint = FALLBACK[action] || action;
            const mention = ctx.args[0] || '';

            try {
                const { data } = await axios.get(
                    `https://api.waifu.pics/sfw/${endpoint}`,
                    { timeout: 15000 }
                );

                if (!data?.url) {
                    return ctx.sendText('❌ Emotion image එක ගන්න බැරි වුණා.');
                }

                const isGif = /\.(gif|mp4|webp)(\?|$)/i.test(data.url);

                if (isGif) {
                    await ctx.sendMessage({
                        video: { url: data.url },
                        gifPlayback: true,
                        caption:
                            `🐉 *${action.toUpperCase()}*\n` +
                            `${mention ? `📢 ${mention}\n` : ''}` +
                            `✨ *SEW QUEEN*`
                    });
                } else {
                    await ctx.sendMessage({
                        image: { url: data.url },
                        caption:
                            `🐉 *${action.toUpperCase()}*\n` +
                            `${mention ? `📢 ${mention}\n` : ''}` +
                            `✨ *SEW QUEEN*`
                    });
                }
            } catch (error) {
                console.error('emotion error', action, error.message);
                await ctx.sendText('❌ Emotion command එක fail වුණා. පස්සේ try කරන්න.');
            }
        }
    };
}

module.exports = ACTIONS.map(makeCommand);
