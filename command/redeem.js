const fs = require("fs");
const path = "./data/redeem.json";

let redeemData = [];
if (fs.existsSync(path)) {
  redeemData = JSON.parse(fs.readFileSync(path));
}

function saveRedeem() {
  fs.writeFileSync(path, JSON.stringify(redeemData, null, 2));
}

function addRedeem(code, hadiah, expireInMs) {
  const expiresAt = Date.now() + expireInMs;
  redeemData.push({ code, hadiah, expiresAt, usedBy: [] });
  saveRedeem();
}

function redeemCode(code, userID) {
  const data = redeemData.find(r => r.code === code);

  if (!data) return { status: false, message: "❌ Kode tidak ditemukan." };
  if (data.expiresAt < Date.now()) return { status: false, message: "⏰ Kode sudah kedaluwarsa." };
  if (data.usedBy.includes(userID)) return { status: false, message: "🚫 Kamu sudah pernah menggunakan kode ini." };

  data.usedBy.push(userID);
  saveRedeem();
  return { status: true, hadiah: data.hadiah };
}

module.exports = {
  addRedeem,
  redeemCode,
};
