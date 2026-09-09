// ============================================================
// SEW QUEEN WHATSAPP BOT
// Modular command system + Website QR/Pairing support
// Baileys: @whiskeysockets/baileys 7.x
// ============================================================

const fs = require('fs');
const path = require('path');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia
} = require('@whiskeysockets/baileys');

const QRCode = require('qrcode');
const mysql = require('mysql2/promise');

require('dotenv').config();

// ============================================================
// CONFIG
// ============================================================

const ROOT_DIR = __dirname;

const AUTH_DIR = path.join(
    ROOT_DIR,
    'auth_info'
);

const COMMANDS_DIR = path.join(
    ROOT_DIR,
    'commands'
);

const dbConfig = {
    host:
        process.env.DB_HOST ||
        'localhost',

    user:
        process.env.DB_USER ||
        'root',

    password:
        process.env.DB_PASSWORD ||
        '',

    database:
        process.env.DB_NAME ||
        'sew_queen',

    waitForConnections:
        true,

    connectionLimit:
        Number(
            process.env.DB_POOL_SIZE ||
            5
        ),

    queueLimit:
        0
};

const RECONNECT_DELAY =
    Number(
        process.env.RECONNECT_DELAY ||
        5000
    );

const PAIR_POLL_INTERVAL =
    Number(
        process.env.PAIR_POLL_INTERVAL ||
        15000
    );

const MENU_COOLDOWN =
    Number(
        process.env.MENU_COOLDOWN ||
        30000
    );

// ============================================================
// GLOBAL STATE
// ============================================================

let pool = null;

let sock = null;

let authState = null;

let isReady = false;

let reconnectTimer = null;

let pairingTimer = null;

let pairingInProgress = false;

let stopping = false;

const userSessions =
    new Map();

const commandRegistry =
    new Map();

const buttonRegistry =
    new Map();

const buttonPrefixRegistry =
    [];

const buttonLabelMap =
    new Map();

// ============================================================
// DATABASE
// ============================================================

function getDbPool() {

    if (!pool) {

        pool =
            mysql.createPool(
                dbConfig
            );
    }

    return pool;
}

// ------------------------------------------------------------
// GET SETTING
// ------------------------------------------------------------

async function getSetting(
    settingName,
    defaultValue = null
) {

    try {

        const [rows] =
            await getDbPool().execute(

                'SELECT setting_value FROM settings WHERE setting_name = ? LIMIT 1',

                [settingName]
            );

        return rows.length
            ? rows[0].setting_value
            : defaultValue;

    } catch (error) {

        console.error(
            `⚠️ getSetting(${settingName}) failed:`,
            error.message
        );

        return defaultValue;
    }
}

// ------------------------------------------------------------
// UPDATE SETTING
// ------------------------------------------------------------

async function updateSetting(
    settingName,
    settingValue
) {

    try {

        await getDbPool().execute(

            'UPDATE settings SET setting_value = ? WHERE setting_name = ?',

            [
                settingValue,
                settingName
            ]
        );

    } catch (error) {

        console.error(
            `⚠️ updateSetting(${settingName}) failed:`,
            error.message
        );
    }
}

// ------------------------------------------------------------
// ENSURE BOT SESSION ROW
// ------------------------------------------------------------

async function ensureBotSessionRow() {

    const [rows] =
        await getDbPool().execute(

            'SELECT id FROM bot_sessions LIMIT 1'
        );

    if (!rows.length) {

        await getDbPool().execute(

            'INSERT INTO bot_sessions (qr_code, pairing_code, requested_phone) VALUES (NULL, NULL, NULL)'
        );
    }
}

// ------------------------------------------------------------
// SAVE QR
// ------------------------------------------------------------

async function saveQRCode(
    base64Data
) {

    try {

        await ensureBotSessionRow();

        await getDbPool().execute(

            'UPDATE bot_sessions SET qr_code = ?, pairing_code = NULL LIMIT 1',

            [base64Data]
        );

    } catch (error) {

        console.error(
            '❌ QR save error:',
            error.message
        );
    }
}

// ------------------------------------------------------------
// CLEAR QR
// ------------------------------------------------------------

async function clearQRCode() {

    try {

        await ensureBotSessionRow();

        await getDbPool().execute(

            'UPDATE bot_sessions SET qr_code = NULL LIMIT 1'
        );

    } catch (error) {

        console.error(
            '⚠️ QR clear error:',
            error.message
        );
    }
}

// ------------------------------------------------------------
// SAVE PAIRING CODE
// ------------------------------------------------------------

async function savePairingCode(
    code
) {

    try {

        await ensureBotSessionRow();

        await getDbPool().execute(

            'UPDATE bot_sessions SET pairing_code = ? LIMIT 1',

            [code]
        );

        console.log(
            `🔐 Pairing code saved: ${code}`
        );

    } catch (error) {

        console.error(
            '❌ Pairing code save error:',
            error.message
        );
    }
}

// ------------------------------------------------------------
// GET PENDING PHONE
// ------------------------------------------------------------

async function getPendingPhone() {

    try {

        const [rows] =
            await getDbPool().execute(

                'SELECT requested_phone FROM bot_sessions LIMIT 1'
            );

        return (
            rows.length &&
            rows[0].requested_phone
        )
            ? String(
                rows[0].requested_phone
            )
            : null;

    } catch (error) {

        console.error(
            '⚠️ Pending phone read error:',
            error.message
        );

        return null;
    }
}

// ------------------------------------------------------------
// CLEAR PENDING PHONE
// ------------------------------------------------------------

async function clearPendingPhone() {

    try {

        await getDbPool().execute(

            'UPDATE bot_sessions SET requested_phone = NULL LIMIT 1'
        );

    } catch (error) {

        console.error(
            '⚠️ Pending phone clear error:',
            error.message
        );
    }
}

// ------------------------------------------------------------
// CLEAR PAIRING CODE
// ------------------------------------------------------------

async function clearPairingCode() {

    try {

        await getDbPool().execute(

            'UPDATE bot_sessions SET pairing_code = NULL LIMIT 1'
        );

    } catch (error) {

        console.error(
            '⚠️ Pairing code clear error:',
            error.message
        );
    }
}

// ============================================================
// COMMAND LOADER
// ============================================================

function safeRequire(
    filePath
) {

    try {

        delete require.cache[
            require.resolve(filePath)
        ];

        return require(filePath);

    } catch (error) {

        console.error(
            `❌ Failed to load command: ${path.basename(filePath)}`
        );

        console.error(
            error.stack ||
            error.message
        );

        return null;
    }
}

// ------------------------------------------------------------
// REGISTER COMMAND
// ------------------------------------------------------------

function registerCommand(
    command
) {

    if (
        Array.isArray(command)
    ) {

        command.forEach(
            registerCommand
        );

        return;
    }

    if (
        !command ||
        typeof command !== 'object'
    ) {
        return;
    }

    const name =
        String(
            command.name ||
            ''
        )
            .trim()
            .toLowerCase();

    if (
        !name ||
        typeof command.execute !== 'function'
    ) {

        console.error(
            '⚠️ Skipping invalid command module. It needs name + execute().'
        );

        return;
    }

    const aliases =
        Array.isArray(
            command.aliases
        )
            ? command.aliases
            : [];

    const names = [
        name,
        ...aliases
    ]
        .map(
            value =>
                String(
                    value
                )
                    .trim()
                    .toLowerCase()
        )
        .filter(Boolean);

    for (
        const commandName
        of names
    ) {

        commandRegistry.set(
            commandName,
            command
        );
    }

    if (
        Array.isArray(
            command.buttonIds
        )
    ) {

        for (
            const buttonId
            of command.buttonIds
        ) {

            if (buttonId) {

                const id =
                    String(buttonId);

                if (
                    buttonRegistry.has(id)
                ) {

                    console.warn(
                        `⚠️ Button ID already used, skipping: ${id} (${name})`
                    );

                    continue;
                }

                buttonRegistry.set(
                    id,
                    command
                );
            }
        }
    }

    if (
        Array.isArray(
            command.buttonPrefixes
        )
    ) {

        for (
            const prefix
            of command.buttonPrefixes
        ) {

            if (prefix) {

                buttonPrefixRegistry.push({
                    prefix:
                        String(prefix),
                    command
                });
            }
        }
    }

    console.log(
        `✅ Command loaded: ${name}`
    );
}

// ------------------------------------------------------------
// LOAD COMMANDS
// ------------------------------------------------------------

function loadCommands() {

    commandRegistry.clear();

    buttonRegistry.clear();

    buttonPrefixRegistry.length = 0;

    buttonLabelMap.clear();

    if (
        !fs.existsSync(
            COMMANDS_DIR
        )
    ) {

        fs.mkdirSync(
            COMMANDS_DIR,
            {
                recursive: true
            }
        );

        console.log(
            '📁 Created commands folder. Add command files inside it.'
        );

        return;
    }

    const files =
        collectCommandFiles(
            COMMANDS_DIR
        );

    for (
        const file
        of files
    ) {

        const command =
            safeRequire(
                file
            );

        if (command) {

            registerCommand(
                command
            );
        }
    }

    console.log(
        `📦 Commands ready: ${commandRegistry.size}`
    );
}

function collectCommandFiles(
    dir
) {

    const files = [];

    if (
        !fs.existsSync(dir)
    ) {

        return files;
    }

    const entries =
        fs.readdirSync(
            dir,
            {
                withFileTypes: true
            }
        );

    for (
        const entry
        of entries
    ) {

        const fullPath =
            path.join(
                dir,
                entry.name
            );

        if (
            entry.isDirectory()
        ) {

            files.push(
                ...collectCommandFiles(
                    fullPath
                )
            );

        } else if (
            entry.name.endsWith('.js') &&
            entry.name !== 'index.js' &&
            !entry.name.startsWith('_')
        ) {

            files.push(fullPath);
        }
    }

    return files.sort();
}

function normalizeLabel(
    text
) {

    return String(text || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function rememberButtonLabel(
    displayText,
    id
) {

    if (
        !displayText ||
        !id
    ) {

        return;
    }

    buttonLabelMap.set(
        normalizeLabel(displayText),
        String(id)
    );
}

// ============================================================
// MESSAGE CONTEXT
// ============================================================

function createContext(
    message,
    selectedButtonId = null
) {

    const jid =
        message?.key?.remoteJid ||
        '';

    const sender =
        message?.key?.participant ||
        jid;

    const content =
        unwrapMessage(
            message?.message
        );

    const quoted =
        content
            ?.extendedTextMessage
            ?.contextInfo
            ?.quotedMessage ||
        content
            ?.imageMessage
            ?.contextInfo
            ?.quotedMessage ||
        null;

    return {

        sock,
        msg: message,
        jid,
        sender,
        text: extractText(message),
        buttonId: selectedButtonId,
        quoted,
        isGroup: String(jid).endsWith('@g.us'),
        userSessions,
        commandRegistry,
        buttonRegistry,

        // ----------------------------------------------------
        // SEND TEXT
        // ----------------------------------------------------

        async sendText(
            text,
            options = {}
        ) {

            return sock.sendMessage(

                jid,

                {
                    text,
                    ...options
                }
            );
        },

        // ----------------------------------------------------
        // SEND MESSAGE
        // ----------------------------------------------------

        async sendMessage(
            content
        ) {

            return sock.sendMessage(
                jid,
                content
            );
        },

        // ----------------------------------------------------
        // SEND MENU
        // ----------------------------------------------------

        async sendMenu() {

            const menuCommand =
                commandRegistry.get(
                    'menu'
                );

            if (
                menuCommand?.execute
            ) {

                return menuCommand.execute(
                    createContext(
                        message
                    )
                );
            }

            return sendDefaultMenu(
                jid
            );
        },

        // ----------------------------------------------------
        // SEND INTERACTIVE MENU
        // ----------------------------------------------------

        async sendInteractiveMenu(
            options
        ) {

            return sendInteractiveMenu(
                jid,
                options
            );
        },

        // ----------------------------------------------------
        // DATABASE
        // ----------------------------------------------------

        db: {

            getSetting,

            updateSetting
        },

        // ----------------------------------------------------
        // RUN COMMAND
        // ----------------------------------------------------

        async runCommand(
            name,
            args = []
        ) {

            const command =
                commandRegistry.get(
                    String(name)
                        .toLowerCase()
                );

            if (!command) {

                return false;
            }

            await command.execute(
                {
                    ...createContext(
                        message
                    ),

                    args
                }
            );

            return true;
        }
    };
}

// ============================================================
// EXTRACT TEXT
// ============================================================

function extractText(
    msg
) {

    if (!msg?.message) {

        return '';
    }

    const content =
        unwrapMessage(
            msg.message
        );

    return (

        content.conversation ||

        content
            .extendedTextMessage
            ?.text ||

        content
            .imageMessage
            ?.caption ||

        content
            .videoMessage
            ?.caption ||

        content
            .documentMessage
            ?.caption ||

        ''
    );
}

// ============================================================
// UNWRAP MESSAGE
// ============================================================

function unwrapMessage(
    message
) {

    let current =
        message || {};

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        if (
            current
                ?.ephemeralMessage
                ?.message
        ) {

            current =
                current
                    .ephemeralMessage
                    .message;

        } else if (
            current
                ?.viewOnceMessage
                ?.message
        ) {

            current =
                current
                    .viewOnceMessage
                    .message;

        } else if (
            current
                ?.viewOnceMessageV2
                ?.message
        ) {

            current =
                current
                    .viewOnceMessageV2
                    .message;

        } else if (
            current
                ?.documentWithCaptionMessage
                ?.message
        ) {

            current =
                current
                    .documentWithCaptionMessage
                    .message;

        } else {

            break;
        }
    }

    return current;
}

// ============================================================
// INTERACTIVE BUTTONS
// ============================================================

function quickReplyButton(
    displayText,
    id
) {

    return {

        name:
            'quick_reply',

        buttonParamsJson:
            JSON.stringify({

                display_text:
                    displayText,

                id
            })
    };
}

// ============================================================
// PRIVACY TIMESTAMP
// ============================================================

function getPrivacyModeTs() {

    const OFFSET =
        77980457;

    return (

        Math.floor(
            Date.now() / 1000
        ) -

        OFFSET

    ).toString();
}

// ============================================================
// BIZ NODE
// ============================================================

function buildNativeFlowBizNode() {

    return {

        tag:
            'biz',

        attrs: {

            actual_actors:
                '2',

            host_storage:
                '2',

            privacy_mode_ts:
                getPrivacyModeTs()
        },

        content: [

            {

                tag:
                    'interactive',

                attrs: {

                    type:
                        'native_flow',

                    v:
                        '1'
                },

                content: [

                    {

                        tag:
                            'native_flow',

                        attrs: {

                            v:
                                '9',

                            name:
                                'mixed'
                        }
                    }
                ]
            },

            {

                tag:
                    'quality_control',

                attrs: {

                    source_type:
                        'third_party'
                }
            }
        ]
    };
}

// ============================================================
// SEND INTERACTIVE MENU
// ============================================================

async function sendInteractiveMenu(
    jid,
    options
) {

    const {

        headerTitle = '',
        bodyText = '',
        footerText = '© SEW QUEEN',
        buttons = [],
        image = null

    } = options || {};

    const safeButtons =
        (buttons || []).slice(0, 3);

    for (const button of safeButtons) {

        try {

            const parsed =
                JSON.parse(
                    button.buttonParamsJson ||
                    '{}'
                );

            rememberButtonLabel(
                parsed.display_text,
                parsed.id
            );

        } catch {}
    }

    if (!safeButtons.length) {

        return sock.sendMessage(
            jid,
            {
                text: bodyText
            }
        );
    }

    const fallbackText = () => {

        const lines =
            safeButtons.map(
                (button, index) => {

                    try {

                        const parsed =
                            JSON.parse(
                                button.buttonParamsJson ||
                                '{}'
                            );

                        return `${index + 1}. ${parsed.display_text}`;

                    } catch {

                        return `${index + 1}. option`;
                    }
                }
            )
                .join('\n');

        return (
            (headerTitle ? `*${headerTitle}*\n\n` : '') +
            bodyText +
            '\n\n' +
            lines +
            '\n\n_බොත්තම් නොපෙනේ නම් ඉහත නම type කරන්න._'
        );
    };

    try {

        const nativeFlowButtons =
            safeButtons.map(
                button =>
                    proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
                        name: button.name || 'quick_reply',
                        buttonParamsJson: button.buttonParamsJson
                    })
            );

        let header =
            proto.Message.InteractiveMessage.Header.create({
                title: headerTitle,
                subtitle: '',
                hasMediaAttachment: false
            });

        const imageUrl =
            typeof image === 'string'
                ? image
                : image?.url;

        if (imageUrl && sock.waUploadToServer) {

            try {

                const media =
                    await prepareWAMessageMedia(
                        {
                            image: {
                                url: imageUrl
                            }
                        },
                        {
                            upload: sock.waUploadToServer
                        }
                    );

                if (media?.imageMessage) {

                    header =
                        proto.Message.InteractiveMessage.Header.create({
                            title: headerTitle,
                            subtitle: '',
                            hasMediaAttachment: true,
                            imageMessage: media.imageMessage
                        });
                }

            } catch (mediaError) {

                console.warn(
                    '⚠️ Menu image upload skipped:',
                    mediaError.message
                );
            }
        }

        const interactiveMessage =
            proto.Message.InteractiveMessage.create({
                header,
                body: proto.Message.InteractiveMessage.Body.create({
                    text: bodyText
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                    text: footerText
                }),
                nativeFlowMessage:
                    proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: nativeFlowButtons,
                        messageParamsJson: JSON.stringify({
                            from: 'sewqueen',
                            templateId: Date.now().toString()
                        }),
                        messageVersion: 1
                    }),
                contextInfo: {
                    mentionedJid: [],
                    forwardingScore: 0,
                    isForwarded: false
                }
            });

        const message =
            generateWAMessageFromContent(
                jid,
                {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage
                        }
                    }
                },
                {
                    userJid: sock.user?.id || ''
                }
            );

        const isGroup =
            String(jid).endsWith('@g.us');

        const additionalNodes =
            isGroup
                ? [buildNativeFlowBizNode()]
                : [
                    {
                        tag: 'bot',
                        attrs: {
                            biz_bot: '1'
                        }
                    },
                    buildNativeFlowBizNode()
                ];

        await sock.relayMessage(
            jid,
            message.message,
            {
                messageId: message.key.id,
                additionalNodes
            }
        );

        console.log(
            `✅ Interactive menu sent to ${jid}`
        );

        return message;

    } catch (error) {

        console.error(
            '❌ Interactive menu error:',
            error.stack ||
            error.message
        );

        return sock.sendMessage(
            jid,
            {
                text: fallbackText()
            }
        );
    }
}

// ============================================================
// DEFAULT MAIN MENU
// ============================================================

async function sendDefaultMenu(
    jid
) {

    return sendInteractiveMenu(

        jid,

        {

            headerTitle:
                '🏠 ප්‍රධාන මෙනුව',

            bodyText:

                '╔═══════════════════════════════╗\n' +

                '║       ✨ *SEW QUEEN BOT* ✨     ║\n' +

                '╠═══════════════════════════════╣\n' +

                '║ 👋 *ආයුබෝවන්!*                ║\n' +

                '║ ඔබට අවශ්‍ය කාර්යය තෝරන්න     ║\n' +

                '╚═══════════════════════════════╝',

            footerText:
                '© SEW QUEEN',

            buttons: [

                quickReplyButton(
                    '🛠️ සේවා',
                    'main_services'
                ),

                quickReplyButton(
                    '📞 සහය',
                    'main_support'
                ),

                quickReplyButton(
                    '👤 ගිණුම',
                    'main_account'
                ),

                quickReplyButton(
                    '📊 පැනලය',
                    'main_panel'
                ),

                quickReplyButton(
                    'ℹ️ තොරතුරු',
                    'main_about'
                )
            ]
        }
    );
}

// ============================================================
// BUTTON DISPATCH
// ============================================================

async function dispatchButton(
    message,
    buttonId
) {

    let command =
        buttonRegistry.get(
            buttonId
        );

    if (!command) {

        const prefixed =
            buttonPrefixRegistry.find(
                entry =>
                    buttonId.startsWith(
                        entry.prefix
                    )
            );

        if (prefixed) {

            command =
                prefixed.command;
        }
    }

    if (
        !command ||
        typeof command.onButton !== 'function'
    ) {

        console.log(
            `⚠️ No command registered for button: ${buttonId}`
        );

        return false;
    }

    await command.onButton({

        ...createContext(
            message,
            buttonId
        ),

        buttonId
    });

    return true;
}

// ============================================================
// EXTRACT BUTTON ID
// ============================================================

function extractButtonId(
    message
) {

    const content =
        unwrapMessage(
            message?.message
        );

    // --------------------------------------------------------
    // NEW INTERACTIVE RESPONSE
    // --------------------------------------------------------

    const interactive =
        content
            ?.interactiveResponseMessage;

    if (interactive) {

        const native =
            interactive
                .nativeFlowResponseMessage;

        const raw =
            native?.paramsJson ??
            native?.params ??
            '';

        if (
            typeof raw === 'string' &&
            raw.trim()
        ) {

            try {

                const parsed =
                    JSON.parse(
                        raw
                    );

                return (

                    parsed?.id ||

                    parsed
                        ?.selectedId ||

                    parsed
                        ?.selected_id ||

                    null
                );

            } catch {

                return null;
            }
        }

        if (
            raw &&
            typeof raw === 'object'
        ) {

            return (

                raw.id ||

                raw.selectedId ||

                raw.selected_id ||

                null
            );
        }
    }

    // --------------------------------------------------------
    // LEGACY BUTTON RESPONSE
    // --------------------------------------------------------

    const legacy =
        content
            ?.buttonsResponseMessage;

    if (
        legacy
            ?.selectedButtonId
    ) {

        return legacy
            .selectedButtonId;
    }

    const template =
        content
            ?.templateButtonReplyMessage;

    if (
        template
            ?.selectedId
    ) {

        return template.selectedId;
    }

    const list =
        content
            ?.listResponseMessage
            ?.singleSelectReply
            ?.selectedRowId;

    if (list) {

        return list;
    }

    return null;
}

// ============================================================
// TEXT COMMAND DISPATCH
// ============================================================

async function dispatchTextCommand(
    message
) {

    const text =
        extractText(
            message
        ).trim();

    if (!text) {

        return false;
    }

    const prefix =
        String(
            await getSetting(
                'prefix',
                '.'
            )
        ) || '.';

    const prefixLower =
        prefix.toLowerCase();

    let commandLine =
        text;

    if (
        text
            .toLowerCase()
            .startsWith(
                prefixLower
            )
    ) {

        commandLine =
            text
                .slice(
                    prefix.length
                )
                .trim();
    }

    const parts =
        commandLine
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {

        return false;
    }

    const commandName =
        parts[0]
            .toLowerCase();

    const args =
        parts.slice(1);

    const command =
        commandRegistry.get(
            commandName
        );

    if (!command) {

        return false;
    }

    const ctx =
        createContext(
            message
        );

    ctx.args =
        args;

    try {

        await command.execute(
            ctx
        );

        return true;

    } catch (error) {

        console.error(
            `❌ Command error [${commandName}]:`,
            error.stack ||
            error.message
        );

        try {

            await ctx.sendText(
                '⚠️ Command එකේ දෝෂයක් සිදු විය.'
            );

        } catch {}

        return true;
    }
}

// ============================================================
// INCOMING MESSAGE HANDLER
// ============================================================

async function handleIncomingMessage(
    message
) {

    if (
        !message?.message
    ) {

        return;
    }

    // Owner ට තමාගේ අංකයෙන්ම බොට් පාලනය කිරීමට හැකි වන පරිදි fromMe පරීක්ෂාව ඉවත් කර ඇත[cite: 1].

    const jid =
        message
            .key
            ?.remoteJid;

    if (!jid) {

        return;
    }

    if (
        jid === 'status@broadcast'
    ) {

        return;
    }

    // --------------------------------------------------------
    // BUTTON
    // --------------------------------------------------------

    const buttonId =
        extractButtonId(
            message
        );

    if (buttonId) {

        console.log(
            `🖱️ Button clicked: ${buttonId}`
        );

        userSessions.set(
            jid,
            'menu'
        );

        try {

            const handled =
                await dispatchButton(
                    message,
                    buttonId
                );

            if (!handled) {

                console.log(
                    `ℹ️ Ignoring unknown button: ${buttonId}`
                );
            }

        } catch (error) {

            console.error(
                '❌ Button handler error:',
                error.stack ||
                error.message
            );

            try {

                await sock.sendMessage(

                    jid,

                    {
                        text:
                            '⚠️ දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.'
                    }
                );

            } catch {}
        }

        return;
    }

    // --------------------------------------------------------
    // TEXT
    // --------------------------------------------------------

    const text =
        extractText(
            message
        );

    console.log(
        `📩 Message from ${jid}: "${text}"`
    );

    const labelButtonId =
        buttonLabelMap.get(
            normalizeLabel(text)
        );

    if (labelButtonId) {

        console.log(
            `🖱️ Button label matched: ${labelButtonId}`
        );

        try {

            const handled =
                await dispatchButton(
                    message,
                    labelButtonId
                );

            if (handled) {

                return;
            }

        } catch (error) {

            console.error(
                '❌ Label button error:',
                error.stack ||
                error.message
            );
        }
    }

    // --------------------------------------------------------
    // COMMAND
    // --------------------------------------------------------

    const handled =
        await dispatchTextCommand(
            message
        );

    if (handled) {

        return;
    }

    // --------------------------------------------------------
    // OLD MENU TRIGGERS
    // --------------------------------------------------------

    const triggers = [

        'menu',

        'start',

        'hi',

        'hello',

        'හෙලෝ',

        'ආයුබෝවන්',

        '.menu',

        '.start',

        'help',

        '.help'
    ];

    const normalized =
        text
            .toLowerCase()
            .trim();

    const isTrigger =
        triggers.some(
            word =>
                normalized.includes(
                    word
                )
        ) ||
        text.length < 3;

    if (!isTrigger) {

        return;
    }

    const key =
        `${jid}_menu_time`;

    const last =
        userSessions.get(
            key
        ) || 0;

    const now =
        Date.now();

    if (
        now -
        last >
        MENU_COOLDOWN
    ) {

        userSessions.set(
            key,
            now
        );

        try {

            const menuCommand =
                commandRegistry.get(
                    'menu'
                );

            if (
                menuCommand
                    ?.execute
            ) {

                await menuCommand.execute(

                    createContext(
                        message
                    )
                );

            } else {

                await sendDefaultMenu(
                    jid
                );
            }

        } catch (error) {

            console.error(
                '❌ Menu error:',
                error.stack ||
                error.message
            );
        }
    }
}

// ============================================================
// PAIRING CODE PROCESS
// ============================================================

async function processPairingRequest() {

    if (
        !sock ||
        isReady ||
        stopping ||
        pairingInProgress
    ) {
        return;
    }

    // Pairing code is only needed for an unregistered auth state.
    if (authState?.creds?.registered) {
        await clearPendingPhone();
        await clearPairingCode();
        return;
    }

    const phone =
        await getPendingPhone();

    if (!phone) {
        return;
    }

    let cleanNumber =
        String(phone).replace(/\D/g, '');

    // Convert local Sri Lankan style 0XXXXXXXXX to international digits.
    if (cleanNumber.startsWith('0')) {
        cleanNumber = cleanNumber.slice(1);
    }

    if (!/^\d{8,15}$/.test(cleanNumber)) {
        console.error(
            `❌ Invalid phone number for pairing: ${phone}`
        );

        await clearPendingPhone();
        return;
    }

    pairingInProgress = true;

    console.log(
        `📞 Requesting pairing code for: ${cleanNumber}`
    );

    try {

        await clearPairingCode();

        const code =
            await sock.requestPairingCode(
                cleanNumber
            );

        await savePairingCode(
            code
        );

        // The request has been fulfilled. Keep the displayed code in DB
        // until WhatsApp opens, so the website can show it to the user.
        await clearPendingPhone();

        console.log(
            `🔐 ✅ Pairing code: ${code}`
        );

    } catch (error) {

        console.error(
            '❌ Pairing error:',
            error.stack ||
            error.message
        );

        // The request may fail while the socket is still connecting.
        // Leave requested_phone intact so the next connection/update can retry.
    } finally {
        pairingInProgress = false;
    }
}

// ============================================================
// STOP TIMERS
// ============================================================

async function stopTimers() {

    if (
        pairingTimer
    ) {

        clearInterval(
            pairingTimer
        );

        pairingTimer =
            null;
    }

    if (
        reconnectTimer
    ) {

        clearTimeout(
            reconnectTimer
        );

        reconnectTimer =
            null;
    }
}

// ============================================================
// RECONNECT
// ============================================================

function scheduleReconnect() {

    if (
        stopping ||
        reconnectTimer
    ) {

        return;
    }

    reconnectTimer =
        setTimeout(

            () => {

                reconnectTimer =
                    null;

                startBot()
                    .catch(
                        error => {

                            console.error(
                                '❌ Reconnect start failed:',
                                error.stack ||
                                error.message
                            );

                            scheduleReconnect();
                        }
                    );
            },

            RECONNECT_DELAY
        );
}

// ============================================================
// START BOT
// ============================================================

async function startBot() {

    if (
        stopping
    ) {

        return;
    }

    await stopTimers();

    // --------------------------------------------------------
    // LOAD COMMANDS
    // --------------------------------------------------------

    loadCommands();

    // --------------------------------------------------------
    // AUTH
    // --------------------------------------------------------

    const {
        state,
        saveCreds
    } =
        await useMultiFileAuthState(
            AUTH_DIR
        );

    authState = state;

    // --------------------------------------------------------
    // SOCKET
    // --------------------------------------------------------

    sock =
        makeWASocket({

            auth:
                state,

            printQRInTerminal:
                false,

            browser: [

                'Windows',

                'Edge',

                '120.0.0.0'
            ],

            connectTimeoutMs:
                60000,

            keepAliveIntervalMs:
                10000,

            markOnlineOnConnect:
                false
        });

    // --------------------------------------------------------
    // COMMAND COMPATIBILITY
    // --------------------------------------------------------

    sock.__sqContext =
        jid => ({

            sendInteractiveMenu:
                options =>
                    sendInteractiveMenu(
                        jid,
                        options
                    )
        });

    // --------------------------------------------------------
    // SAVE CREDENTIALS
    // --------------------------------------------------------

    sock.ev.on(
        'creds.update',
        saveCreds
    );

    // ========================================================
    // CONNECTION UPDATE
    // ========================================================

    sock.ev.on(

        'connection.update',

        async update => {

            const {

                qr,

                connection,

                lastDisconnect

            } =
                update;

            // ------------------------------------------------
            // QR CODE
            // ------------------------------------------------

            if (qr) {

                try {

                    const qrImage =
                        await QRCode.toDataURL(

                            qr,

                            {

                                width:
                                    300,

                                margin:
                                    2
                            }
                        );

                    const base64 =
                        qrImage.replace(

                            /^data:image\/png;base64,/,

                            ''
                        );

                    await saveQRCode(
                        base64
                    );

                    console.log(
                        '📱 QR Code updated in database.'
                    );

                } catch (error) {

                    console.error(
                        '❌ QR processing error:',
                        error.message
                    );
                }
            }

            // ------------------------------------------------
            // PAIRING CODE
            // ------------------------------------------------

            // requestPairingCode() must be requested while the socket
            // is still connecting (or when a QR update is emitted),
            // not after the connection has already opened.
            if (
                !isReady &&
                (
                    connection === 'connecting' ||
                    !!qr
                ) &&
                !authState?.creds?.registered
            ) {

                if (!pairingTimer) {

                    pairingTimer =
                        setInterval(
                            processPairingRequest,
                            PAIR_POLL_INTERVAL
                        );
                }

                await processPairingRequest();
            }

            // ------------------------------------------------
            // OPEN
            // ------------------------------------------------

            if (
                connection === 'open'
            ) {

                isReady =
                    true;

                await updateSetting(
                    'bot_status',
                    'online'
                );

                // QR / pair code no longer needed
                await clearQRCode();

                await clearPairingCode();

                await clearPendingPhone();

                console.log(
                    '✅ Bot is ONLINE!'
                );

                // ------------------------------------------------
                // OWNER NOTIFY (UPDATED)
                // ------------------------------------------------

                const ownerNumber =
                    await getSetting(
                        'owner_number',
                        process.env.OWNER_NUMBER || null
                    );

                if (ownerNumber) {
                    try {
                        const cleanOwner =
                            ownerNumber.replace(/\D/g, '') +
                            '@s.whatsapp.net';

                        // 1. Send Image with Custom Message
                        await sock.sendMessage(
                            cleanOwner,
                            {
                                image: { url: 'https://i.ibb.co/vGN2vVz/IMG-20260908-232029.jpg' },
                                caption: '╔══════════════════════╗\n║  ✨ *SEW QUEEN BOT* ✨ ║\n╠══════════════════════╣\n║ ✅ *Bot is now ONLINE!* 🚀\n║ 👋 ඔබගේ බොට් සාර්ථකව \n║    සම්බන්ධ විය!\n╚══════════════════════╝'
                            }
                        );

                        // 2. Send Interactive Buttons
                        await sendInteractiveMenu(
                            cleanOwner,
                            {
                                headerTitle: '⚙️ පාලක මෙනුව',
                                bodyText: 'ඔබට අවශ්‍ය විධානය පහතින් තෝරන්න 👇',
                                footerText: '© SEW QUEEN',
                                buttons: [
                                    quickReplyButton('📊 Dashboard', 'main_panel'),
                                    quickReplyButton('🛠️ Menu', 'menu')
                                ]
                            }
                        );

                    } catch (error) {
                        console.error(
                            '⚠️ Owner notify error:',
                            error.message
                        );
                    }
                }

                // Pairing polling is started from the connecting/QR
                // phase above, before WhatsApp opens the connection.
            }

            // ------------------------------------------------
            // CLOSE
            // ------------------------------------------------

            if (
                connection === 'close'
            ) {

                isReady =
                    false;

                await updateSetting(
                    'bot_status',
                    'offline'
                );

                if (
                    pairingTimer
                ) {

                    clearInterval(
                        pairingTimer
                    );

                    pairingTimer =
                        null;
                }

                const statusCode =

                    lastDisconnect
                        ?.error
                        ?.output
                        ?.statusCode ??

                    lastDisconnect
                        ?.error
                        ?.statusCode;

                const loggedOut =

                    statusCode ===
                    DisconnectReason.loggedOut;

                console.log(
                    `🔌 Connection closed. Code: ${statusCode ?? 'unknown'}`
                );

                if (
                    !stopping &&
                    !loggedOut
                ) {

                    console.log(
                        `🔄 Reconnecting in ${RECONNECT_DELAY}ms...`
                    );

                    scheduleReconnect();

                } else if (
                    loggedOut
                ) {

                    console.log(
                        '❌ WhatsApp logged out. Delete auth_info only when you intentionally want a new login.'
                    );
                }
            }
        }
    );

    // ========================================================
    // INCOMING MESSAGES
    // ========================================================

    sock.ev.on(

        'messages.upsert',

        async ({
            messages,
            type
        }) => {

            if (
                type !== 'notify'
            ) {

                return;
            }

            for (
                const message
                of messages || []
            ) {

                try {

                    await handleIncomingMessage(
                        message
                    );

                } catch (error) {

                    console.error(
                        '❌ Message processing error:',
                        error.stack ||
                        error.message
                    );
                }
            }
        }
    );

    return sock;
}

// ============================================================
// MAIN
// ============================================================

async function main() {

    try {

        // ----------------------------------------------------
        // TEST DATABASE
        // ----------------------------------------------------

        await getDbPool()
            .query(
                'SELECT 1'
            );

        // ----------------------------------------------------
        // ENSURE SESSION
        // ----------------------------------------------------

        await ensureBotSessionRow();

        // ----------------------------------------------------
        // OFFLINE AT START
        // ----------------------------------------------------

        await updateSetting(
            'bot_status',
            'offline'
        );

        // ----------------------------------------------------
        // START
        // ----------------------------------------------------

        await startBot();

    } catch (error) {

        console.error(
            '❌ Bot startup error:',
            error.stack ||
            error.message
        );

        process.exitCode =
            1;
    }
}

// ============================================================
// SHUTDOWN
// ============================================================

async function shutdown(
    signal
) {

    if (
        stopping
    ) {

        return;
    }

    stopping =
        true;

    console.log(
        `\n🛑 ${signal} received. Shutting down...`
    );

    await stopTimers();

    try {

        await updateSetting(
            'bot_status',
            'offline'
        );

    } catch {}

    try {

        if (
            sock
                ?.ws
                ?.readyState !==
            undefined
        ) {

            sock.ws.close();
        }

    } catch {}

    try {

        if (pool) {

            await pool.end();
        }

    } catch {}

    process.exit(
        0
    );
}

// ============================================================
// PROCESS EVENTS
// ============================================================

process.on(
    'SIGINT',
    () =>
        shutdown(
            'SIGINT'
        )
);

process.on(
    'SIGTERM',
    () =>
        shutdown(
            'SIGTERM'
        )
);

process.on(
    'unhandledRejection',
    error => {

        console.error(
            '❌ Unhandled promise rejection:',
            error?.stack ||
            error
        );
    }
);

process.on(
    'uncaughtException',
    error => {

        console.error(
            '❌ Uncaught exception:',
            error?.stack ||
            error
        );
    }
);

// ============================================================
// START
// ============================================================

main();