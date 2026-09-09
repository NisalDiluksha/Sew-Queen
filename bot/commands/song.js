const axios = require('axios');
const yts = require('yt-search');
const { ytmp3 } = require('@vreden/youtube_scraper');

module.exports = {
    name: 'song',
    aliases: ['audio', 'music'],
    buttonPrefixes: [
        'song_audio_',
        'song_link_'
    ],

    async execute(ctx) {
        const { args, sendMessage, sendText, sendInteractiveMenu } = ctx;

        if (!args || !args.length) {
            return sendText(
                '🎵 *Song Downloader*\n\n' +
                'සින්දුවේ නම හෝ කලාකරුවාගේ නම සඳහන් කරන්න.\n\n' +
                'Example:\n' +
                '.song Manike Mage Hithe'
            );
        }

        const query = args.join(' ');

        try {
            await sendText(`🔍 *"${query}" සෙවුම් කරමින් පවතී...*`);

            const search = await yts(query);
            const data = search.videos[0];
            if (!data) {
                return sendText('❌ අදාළ ගීතය සොයාගත නොහැකි විය. කරුණාකර වෙනත් නමක් උත්සාහ කරන්න.');
            }

            let desc = `🎵 *${data.title}*\n⏱️ *Duration:* ${data.timestamp}\n👀 *Views:* ${data.views.toLocaleString()}\n\nකරුණාකර ඔබට අවශ්‍ය ක්‍රමය තෝරන්න:`;

            if (typeof sendInteractiveMenu === 'function') {
                return await sendInteractiveMenu({
                    headerTitle: '🎵 Song Downloader',
                    bodyText: desc,
                    footerText: '© SEW QUEEN',
                    image: data.thumbnail,
                    buttons: [
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📥 Audio File (ਬොට් හරහා)', id: `song_audio_${data.videoId}` }) },
                        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔗 Direct Download Link', id: `song_link_${data.videoId}` }) }
                    ]
                });
            } else {
                return sendText(
                    `🎵 *${data.title}*\n\n` +
                    `බොට් හරහා Audio ලබා ගැනීමට: .songfile ${data.videoId}\n` +
                    `සෘජු ලින්ක් එක ලබා ගැනීමට: .songlink ${data.videoId}`
                );
            }

        } catch (error) {
            console.error('❌ Song command error:', error.stack || error.message);
            await sendText('❌ *සෙවුම් කිරීමේදී දෝෂයක් සිදු විය.*');
        }
    },

    async onButton(ctx) {
        const { buttonId, sendText, sendMessage } = ctx;

        if (buttonId && buttonId.startsWith('song_audio_')) {
            const videoId = buttonId.replace('song_audio_', '');
            const videoUrl = `https://youtube.com/watch?v=${videoId}`;

            try {
                await sendText('⏳ *ගීතය ඩවුන්ලෝඩ් කරමින් පවතී...*');
                const songData = await ytmp3(videoUrl, "64");

                if (!songData || !songData.status || !songData.download?.url) {
                    return sendText('❌ ගීතයේ ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීමට නොහැකි විය.');
                }

                await sendMessage({
                    audio: { url: songData.download.url },
                    mimetype: 'audio/mpeg',
                    ptt: false
                });

                await sendText('✅ *ගීතය සාර්ථකව එවනු ලැබීය!* 🎵');
            } catch (e) {
                console.error(e);
                await sendText('❌ *ගීතය යැවීමේදී දෝෂයක් සිදු විය.*');
            }
        } 
        else if (buttonId && buttonId.startsWith('song_link_')) {
            const videoId = buttonId.replace('song_link_', '');
            const videoUrl = `https://youtube.com/watch?v=${videoId}`;

            try {
                await sendText('⏳ *සෘජු ඩවුන්ලෝඩ් ලින්ක් එක සකස් කරමින් පවතී...*');
                const songData = await ytmp3(videoUrl, "128");

                if (!songData || !songData.status || !songData.download?.url) {
                    return sendText('❌ ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීමට නොහැකි විය.');
                }

                const directLink = songData.download.url;
                
                // බ්‍රවුසරයේ ලින්ක් එක ඕපන් වූ විට ප්ලේ නොවී ඩවුන්ලෝඩ් වීම සඳහා Force Download Format එකක් ලබා දීම
                await sendText(
                    `🔗 *Direct Download Link*\n\n` +
                    `මෙම ලින්ක් එක මත ක්ලික් කර බ්‍රවුසරයෙන් බාගත කරගන්න (ලින්ක් එක මිනිත්තු කිහිපයකින් කල් ඉකුත් වේ):\n\n` +
                    `${directLink}\n\n` +
                    `💡 _ලින්ක් එකෙන් ඩවුන්ලෝඩ් නොවන්නේ නම්, බ්‍රවුසරයේ "Download" හෝ "Save As" ඔප්ෂන් එක භාවිත කරන්න._`
                );
            } catch (e) {
                console.error(e);
                await sendText('❌ *ලින්ක් එක ලබා ගැනීමේදී දෝෂයක් සිදු විය.*');
            }
        }
    }
};