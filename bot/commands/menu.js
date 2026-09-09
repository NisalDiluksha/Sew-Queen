const IMAGE_URL = 'https://i.ibb.co/207Sfhyp/sew-queen.jpg';

function btn(displayText, id) {
    return {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
            display_text: displayText,
            id
        })
    };
}

async function sendPage(ctx, headerTitle, bodyText, buttons) {
    await ctx.sendInteractiveMenu({
        headerTitle,
        bodyText,
        footerText: '© SEW QUEEN • WhatsApp Bot',
        image: IMAGE_URL,
        buttons
    });
}

async function sendMainMenu(ctx) {
    await ctx.sendMessage({
        image: { url: IMAGE_URL },
        caption:
            '╔════════════════════════════════╗\n' +
            '║       ✨ *SEW QUEEN BOT* ✨     ║\n' +
            '╠════════════════════════════════╣\n' +
            '║  👋 *ආයුබෝවන්!*               ║\n' +
            '║  🤖 Welcome to SEW QUEEN BOT   ║\n' +
            '║  ⚡ ඔබට අවශ්‍ය සේවාව තෝරන්න   ║\n' +
            '╚════════════════════════════════╝'
    });

    await sendPage(
        ctx,
        '🏠 SEW QUEEN MAIN MENU',
        '🎀 *Main Menu*\n\n' +
            'පහත category එකක් තෝරන්න. බොත්තම් නැත්නම් ඒ නම type කරන්න.\n\n' +
            '🤖 Status: 🟢 Online',
        [
            btn('📥 Downloader', 'cat_download'),
            btn('🔎 Searches', 'cat_search'),
            btn('➡️ More', 'menu_page_2')
        ]
    );
}

const LISTS = {
    cat_download:
        '┌『 *📥 DOWNLOADER* 』\n' +
        '│ .song / .play / .yta / .music\n' +
        '│ .video / .ytv / .ytmp4\n' +
        '│ .ytsearch\n' +
        '┕━━━━━━━━━━━━━━',
    cat_search:
        '┌『 *🔎 SEARCHES* 』\n' +
        '│ .google .wiki .lyrics\n' +
        '│ .joke .meme .fact .advice .quote\n' +
        '│ .pokedex .anime .gify\n' +
        '┕━━━━━━━━━━━━━━',
    cat_emotions:
        '┌『 *🐉 EMOTIONS* 』\n' +
        '│ .hug .kiss .pat .slap .cuddle\n' +
        '│ .wink .wave .smile .dance .cry\n' +
        '│ .bite .bonk .kick .punch .highfive\n' +
        '│ .yeet .happy .sad .confused .bored\n' +
        '┕━━━━━━━━━━━━━━',
    cat_convert:
        '┌『 *📼 CONVERSION* 』\n' +
        '│ .tts <text>\n' +
        '│ .tinyurl <link>\n' +
        '│ .tourl (reply to image)\n' +
        '┕━━━━━━━━━━━━━━',
    cat_group:
        '┌『 *🔰 GROUP* 』\n' +
        '│ .tagall / .mention\n' +
        '│ .promote .demote .remove\n' +
        '│ .setdesc <text>\n' +
        '┕━━━━━━━━━━━━━━',
    cat_games:
        '┌『 *💰 GAMES* 』\n' +
        '│ .daily .balance .work\n' +
        '│ .gamble <amount>\n' +
        '┕━━━━━━━━━━━━━━',
    cat_photo:
        '┌『 *🖼️ PHOTOS* 』\n' +
        '│ .wallpaper\n' +
        '│ .unsplash <query>\n' +
        '│ .pinterest <query>\n' +
        '┕━━━━━━━━━━━━━━'
};

module.exports = {
    name: 'menu',

    aliases: [
        'start',
        'hi',
        'hello',
        'හෙලෝ',
        'ආයුබෝවන්',
        'help',
        'list',
        'command',
        'commands',
        'home'
    ],

    buttonIds: [
        'main_home',
        'main_back',
        'menu_page_2',
        'menu_page_3',
        'cat_download',
        'cat_search',
        'cat_emotions',
        'cat_convert',
        'cat_group',
        'cat_games',
        'cat_photo'
    ],

    async execute(ctx) {
        await sendMainMenu(ctx);
    },

    async onButton(ctx) {
        const id = ctx.buttonId;

        if (id === 'main_home' || id === 'main_back') {
            return sendMainMenu(ctx);
        }

        if (id === 'menu_page_2') {
            return sendPage(
                ctx,
                '🏠 SEW QUEEN MENU 2',
                'තවත් categories:',
                [
                    btn('🐉 Emotions', 'cat_emotions'),
                    btn('📼 Conversion', 'cat_convert'),
                    btn('➡️ More', 'menu_page_3')
                ]
            );
        }

        if (id === 'menu_page_3') {
            return sendPage(
                ctx,
                '🏠 SEW QUEEN MENU 3',
                'තවත් categories:',
                [
                    btn('🔰 Group', 'cat_group'),
                    btn('💰 Games', 'cat_games'),
                    btn('🖼️ Photos', 'cat_photo')
                ]
            );
        }

        if (LISTS[id]) {
            await ctx.sendText(`✨ *SEW QUEEN*\n\n${LISTS[id]}\n\nPrefix: *.*`);
            return sendPage(
                ctx,
                '🏠 SEW QUEEN',
                'මෙනුවට ආපසු යන්නද?',
                [
                    btn('🏠 Main Menu', 'main_home'),
                    btn('📋 Page 2', 'menu_page_2'),
                    btn('📋 Page 3', 'menu_page_3')
                ]
            );
        }
    }
};
