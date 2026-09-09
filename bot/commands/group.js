async function requireGroup(ctx) {
    if (!ctx.isGroup) {
        await ctx.sendText('❌ මේ command එක group එකකට විතරයි.');
        return false;
    }
    return true;
}

async function getMentioned(ctx) {
    const fromArgs = ctx.args
        .filter(item => item.startsWith('@'))
        .map(item => item.replace('@', '') + '@s.whatsapp.net');

    if (fromArgs.length) {
        return fromArgs;
    }

    const contextInfo =
        ctx.msg?.message?.extendedTextMessage?.contextInfo;

    if (contextInfo?.mentionedJid?.length) {
        return contextInfo.mentionedJid;
    }

    if (contextInfo?.participant) {
        return [contextInfo.participant];
    }

    return [];
}

module.exports = [
    {
        name: 'tagall',
        aliases: ['mention', 'hidetag'],
        async execute(ctx) {
            if (!(await requireGroup(ctx))) {
                return;
            }

            try {
                const meta = await ctx.sock.groupMetadata(ctx.jid);
                const mentions = meta.participants.map(item => item.id);
                const text =
                    ctx.args.join(' ') ||
                    `🔰 *SEW QUEEN Tagall*\n\n${mentions
                        .map(id => '@' + id.split('@')[0])
                        .join(' ')}`;

                await ctx.sendMessage({
                    text,
                    mentions
                });
            } catch (error) {
                await ctx.sendText('❌ Tagall fail වුණා.');
            }
        }
    },
    {
        name: 'promote',
        aliases: [],
        async execute(ctx) {
            if (!(await requireGroup(ctx))) {
                return;
            }

            const users = await getMentioned(ctx);
            if (!users.length) {
                return ctx.sendText('👑 Usage: `.promote @user`');
            }

            try {
                await ctx.sock.groupParticipantsUpdate(ctx.jid, users, 'promote');
                await ctx.sendText('✅ User promote කළා.\n\n✨ *SEW QUEEN*');
            } catch (error) {
                await ctx.sendText('❌ Promote කරන්න බැරි වුණා. Bot එක adminද බලන්න.');
            }
        }
    },
    {
        name: 'demote',
        aliases: [],
        async execute(ctx) {
            if (!(await requireGroup(ctx))) {
                return;
            }

            const users = await getMentioned(ctx);
            if (!users.length) {
                return ctx.sendText('⬇️ Usage: `.demote @user`');
            }

            try {
                await ctx.sock.groupParticipantsUpdate(ctx.jid, users, 'demote');
                await ctx.sendText('✅ User demote කළා.\n\n✨ *SEW QUEEN*');
            } catch (error) {
                await ctx.sendText('❌ Demote කරන්න බැරි වුණා.');
            }
        }
    },
    {
        name: 'remove',
        aliases: ['kick'],
        async execute(ctx) {
            if (!(await requireGroup(ctx))) {
                return;
            }

            const users = await getMentioned(ctx);
            if (!users.length) {
                return ctx.sendText('🚫 Usage: `.remove @user`');
            }

            try {
                await ctx.sock.groupParticipantsUpdate(ctx.jid, users, 'remove');
                await ctx.sendText('✅ User remove කළා.\n\n✨ *SEW QUEEN*');
            } catch (error) {
                await ctx.sendText('❌ Remove කරන්න බැරි වුණා.');
            }
        }
    },
    {
        name: 'setdesc',
        aliases: ['gdesc'],
        async execute(ctx) {
            if (!(await requireGroup(ctx))) {
                return;
            }

            const desc = ctx.args.join(' ');
            if (!desc) {
                return ctx.sendText('📝 Usage: `.setdesc New group description`');
            }

            try {
                await ctx.sock.groupUpdateDescription(ctx.jid, desc);
                await ctx.sendText('✅ Group description update වුණා.\n\n✨ *SEW QUEEN*');
            } catch (error) {
                await ctx.sendText('❌ Description update කරන්න බැරි වුණා.');
            }
        }
    }
];
