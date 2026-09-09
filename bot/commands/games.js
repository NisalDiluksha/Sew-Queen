const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'economy.json');

function loadStore() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveStore(store) {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function userId(ctx) {
    return ctx.sender || ctx.jid;
}

function getUser(store, id) {
    if (!store[id]) {
        store[id] = {
            gold: 500,
            lastDaily: 0,
            lastWork: 0
        };
    }
    return store[id];
}

module.exports = [
    {
        name: 'balance',
        aliases: ['gold', 'wallet', 'inv'],
        async execute(ctx) {
            const store = loadStore();
            const user = getUser(store, userId(ctx));
            saveStore(store);
            await ctx.sendText(
                `💰 *SEW QUEEN Wallet*\n\nGold: *${user.gold}*\n\n.daily සහ .work වලින් gold ගන්න.`
            );
        }
    },
    {
        name: 'daily',
        aliases: [],
        async execute(ctx) {
            const store = loadStore();
            const user = getUser(store, userId(ctx));
            const now = Date.now();

            if (now - user.lastDaily < 20 * 60 * 60 * 1000) {
                return ctx.sendText('⏳ Daily reward එක දැනටමත් ගත්තා. හෙට ආයෙත් try කරන්න.');
            }

            user.gold += 1000;
            user.lastDaily = now;
            saveStore(store);
            await ctx.sendText('🎁 Daily reward: *+1000 gold*\n\n✨ *SEW QUEEN*');
        }
    },
    {
        name: 'work',
        aliases: [],
        async execute(ctx) {
            const store = loadStore();
            const user = getUser(store, userId(ctx));
            const now = Date.now();

            if (now - user.lastWork < 10 * 60 * 1000) {
                return ctx.sendText('⏳ වැඩකරන්න තව මිනිත්තු කිහිපයක් ඉන්න.');
            }

            const earned = 80 + Math.floor(Math.random() * 120);
            user.gold += earned;
            user.lastWork = now;
            saveStore(store);
            await ctx.sendText(`🛠️ Work complete: *+${earned} gold*\n\n✨ *SEW QUEEN*`);
        }
    },
    {
        name: 'gamble',
        aliases: ['bet'],
        async execute(ctx) {
            const amount = Number(ctx.args[0]);
            if (!amount || amount <= 0) {
                return ctx.sendText('🎲 Usage: `.gamble 100`');
            }

            const store = loadStore();
            const user = getUser(store, userId(ctx));

            if (user.gold < amount) {
                return ctx.sendText('❌ ඔයාට තියෙන gold එක මදි.');
            }

            const win = Math.random() > 0.5;
            user.gold += win ? amount : -amount;
            saveStore(store);

            await ctx.sendText(
                win
                    ? `🎉 You won *${amount} gold*!\nBalance: ${user.gold}`
                    : `💀 You lost *${amount} gold*.\nBalance: ${user.gold}`
            );
        }
    }
];
