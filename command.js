const fs = require('fs');
const path = require('path');

module.exports = {
  handleCommand: async (sock, msg, from, sender, isGroup) => {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const command = text.trim().split(/\s+/)[0].toLowerCase();
    const args = text.trim().split(/\s+/).slice(1);

    const premiumUsers = JSON.parse(fs.readFileSync('./database/premium.json'));
    const pengawas = ["083131871328@s.whatsapp.net"];
    const isOwner = pengawas.includes(sender);

    // Contoh perintah
    switch (command) {
      case "!ping":
        await sock.sendMessage(from, { text: "🏓 Pong! Bot aktif." }, { quoted: msg });
        break;

      case "!idku":
        await sock.sendMessage(from, { text: `🆔 ID kamu: ${sender}` }, { quoted: msg });
        break;

      case "!zriumku":
        const zriumData = JSON.parse(fs.readFileSync('./database/zrium.json'));
        const userZrium = zriumData[sender] || { type: "gratisan", zc: 0 };
        await sock.sendMessage(from, { text: `💠 Zrium: ${userZrium.type}\n💰 ZC: ${userZrium.zc}` }, { quoted: msg });
        break;

      case "!tambahzc":
        if (!isOwner) return;
        const amount = parseInt(args[1]) || 0;
        const target = args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
        if (!target || isNaN(amount)) return sock.sendMessage(from, { text: "❗ Format salah. !tambahzc 628xxxx 10" });
        const db = JSON.parse(fs.readFileSync('./database/zrium.json'));
        if (!db[target]) db[target] = { type: "gratisan", zc: 0 };
        db[target].zc += amount;
        fs.writeFileSync('./database/zrium.json', JSON.stringify(db, null, 2));
        await sock.sendMessage(from, { text: `✅ Berhasil menambahkan ${amount} ZC ke ${target}` });
        break;

      default:
        if (command.startsWith("!z")) {
          await sock.sendMessage(from, { text: `❓ Perintah ${command} belum tersedia.` }, { quoted: msg });
        }
    }
  }
};
