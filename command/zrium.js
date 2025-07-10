const fs = require("fs");
const path = "./data/zrium.json";

let zrium = {};

if (fs.existsSync(path)) {
  zrium = JSON.parse(fs.readFileSync(path));
}

function save() {
  fs.writeFileSync(path, JSON.stringify(zrium, null, 2));
}

function isPremium(id) {
  return zrium[id]?.premium === true;
}

function addPremium(id, durasi) {
  if (!zrium[id]) zrium[id] = { zc: 0 };
  zrium[id].premium = true;
  zrium[id].expired = Date.now() + durasi * 86400000; // hari
  save();
}

function checkPremiumExpired(id) {
  if (zrium[id]?.premium && Date.now() > zrium[id].expired) {
    zrium[id].premium = false;
    zrium[id].expired = 0;
    save();
  }
}

function getZC(id) {
  return zrium[id]?.zc || 0;
}

function addZC(id, amount) {
  if (!zrium[id]) zrium[id] = { premium: false, expired: 0, zc: 0 };
  zrium[id].zc += amount;
  save();
}

function subZC(id, amount) {
  if (getZC(id) >= amount) {
    zrium[id].zc -= amount;
    save();
    return true;
  } else {
    return false;
  }
}

module.exports = {
  isPremium,
  addPremium,
  checkPremiumExpired,
  getZC,
  addZC,
  subZC,
};
