const fs = require("fs");
const path = "./data/userid.json";

let userData = {};
if (fs.existsSync(path)) {
  userData = JSON.parse(fs.readFileSync(path));
}

function save() {
  fs.writeFileSync(path, JSON.stringify(userData, null, 2));
}

function generateID() {
  return "ZID-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function verifyUser(id, nama, umur, asal) {
  if (userData[id]) return false; // sudah terdaftar
  userData[id] = {
    nama,
    umur,
    asal,
    idPelanggan: generateID(),
    verifiedAt: Date.now(),
  };
  save();
  return userData[id];
}

function getUserInfo(id) {
  return userData[id] || null;
}

module.exports = {
  verifyUser,
  getUserInfo,
};
