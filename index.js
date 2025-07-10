const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

// Import fitur tambahan
const { handleCommand } = require('./command');
const { handleSewa, checkExpiredSewa, checkSpamCall } = require('./sewa');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./sessions');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ['ZaylaBot', 'Chrome', '1.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log('⚠️ Terputus, mencoba ulang...');
        startBot();
      } else {
        console.log('🔒 Logout, scan ulang dibutuhkan.');
      }
    }

    if (connection === 'open') {
      console.log('✅ ZaylaBot tersambung!');
      await checkExpiredSewa(sock);
    }

    if (update.qr) {
      console.log('📲 Scan QR melalui browser: https://zailab.zeabur.app');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const isGroup = from.endsWith('@g.us');

    await checkSpamCall(sock, msg);
    const isHandled = await handleSewa(sock, msg, from, sender, isGroup);
    if (!isHandled) {
      await handleCommand(sock, msg, from, sender, isGroup);
    }
  });

  sock.ev.on('call', async (call) => {
    const from = call[0].from;
    console.log(`📞 Panggilan dari: ${from} - Diblokir`);
    await sock.updateBlockStatus(from, 'block');

    let blocked = [];
    if (fs.existsSync('./database/blocked.json')) {
      blocked = JSON.parse(fs.readFileSync('./database/blocked.json'));
    }

    if (!blocked.includes(from)) {
      blocked.push(from);
      fs.writeFileSync('./database/blocked.json', JSON.stringify(blocked));
    }
  });
}

startBot();
