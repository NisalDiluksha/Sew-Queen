const axios = require('axios');

async function findVideo(query) {
    if (/youtu(\.be|be\.com)/i.test(query)) {
        return { url: query, title: query, videoId: '', thumbnail: null, timestamp: '', views: 0 };
    }

    const search = await yts(query);
    const data = search.videos[0];
    if (!data) {
        return null;
    }

    return data;
}

module.exports = [
    {
        name: 'play',
        aliases: ['yta', 'sing', 'ytmp3', 'ytplay', 'ytaudio', 'ytmusic', 'youtubemusic'],
        async execute(ctx) {
            return ctx.runCommand('song', ctx.args);
        }
    },
    {
        name: 'video',
        aliases: ['ytv', 'ytmp4', 'watch', 'stream', 'ytwatch', 'ytvideo', 'youtubevideo'],
        buttonPrefixes: ['vid_file_', 'vid_link_'],
        async execute(ctx) {
            const query = ctx.args.join(' ');
            if (!query) {
                return ctx.sendText('🎬 Usage: `.video Manike Mage Hithe`');
            }

            try {
                await ctx.sendText(`🔍 *"${query}" සෙවුම් කරමින් පවතී...*`);
                const data = await findVideo(query);
                if (!data) {
                    return ctx.sendText('❌ Video එක හම්බුණේ නැහැ.');
                }

                const videoId = data.videoId || data.url;
                await ctx.sendInteractiveMenu({
                    headerTitle: '🎬 Video Downloader',
                    bodyText:
                        `🎬 *${data.title}*\n` +
                        `⏱️ ${data.timestamp || ''}\n\n` +
                        'ඔබට අවශ්‍ය ක්‍රමය තෝරන්න:',
                    footerText: '© SEW QUEEN',
                    image: data.thumbnail,
                    buttons: [
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📥 Send Video',
                                id: `vid_file_${videoId}`
                            })
                        },
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🔗 Direct Link',
                                id: `vid_link_${videoId}`
                            })
                        }
                    ]
                });
            } catch (error) {
                console.error('video error', error.message);
                await ctx.sendText('❌ Video search fail වුණා.');
            }
        },
        async onButton(ctx) {
            const { buttonId, sendText, sendMessage } = ctx;
            const isFile = buttonId.startsWith('vid_file_');
            const raw = buttonId.replace('vid_file_', '').replace('vid_link_', '');
            const videoUrl = raw.includes('http')
                ? raw
                : `https://youtube.com/watch?v=${raw}`;

            try {
                await sendText('⏳ *Video එක සකසමින් පවතී...*');
                const result = await ytmp4(videoUrl, '360');

                if (!result || !result.status || !result.download?.url) {
                    return sendText('❌ Video download link එක ගන්න බැරි වුණා.');
                }

                if (isFile) {
                    await sendMessage({
                        video: { url: result.download.url },
                        caption: `🎬 *SEW QUEEN*\n${result.title || ''}`
                    });
                } else {
                    await sendText(
                        `🔗 *Direct Video Link*\n\n${result.download.url}\n\n✨ *SEW QUEEN*`
                    );
                }
            } catch (error) {
                console.error(error);
                await sendText('❌ Video යැවීමේදී දෝෂයක් සිදු විය.');
            }
        }
    }
];
