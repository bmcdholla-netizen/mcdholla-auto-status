const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['MCDHOLLA AUTO STATUS', 'Chrome', '1.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('QR code generated. Open WhatsApp > Linked Devices and scan it.');
        }

        if (connection === 'open') {
            console.log('MCDHOLLA BOT CONNECTED 🔥');
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;

            if (code !== DisconnectReason.loggedOut) {
                startBot();
            } else {
                console.log('Logged out. Please reconnect.');
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation ||
            msg.message.extendedTextMessage?.text || '';

        if (text.toLowerCase() === '.ping') {
            await sock.sendMessage(msg.key.remoteJid, {
                text: 'MCDHOLLA BOT IS ONLINE ⚡'
            });
        }
    });
}

startBot();
