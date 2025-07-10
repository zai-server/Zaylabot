const fs = require("fs");
const path = "./data/pengawas.json";

let pengawasData = {};
if (fs.existsSync(path)) {
  pengawasData = JSON.parse(fs.readFileSync(path));
}

function savePengawas() {
  fs.writeFileSync(path, JSON.stringify(pengawasData, null, 2));
}

function addPengawas(id, nama) {
  if (pengawasData[id]) return false; // sudah terdaftar
  pengawasData[id] = {
    nama,
    role: "Pengawas",
    addedAt: Date.now(),
  };
  savePengawas();
  return pengawasData[id];
}

function removePengawas(id) {
  if (!pengawasData[id]) return false; // tidak ditemukan
  delete pengawasData[id];
  savePengawas();
  return true;
}

function getPengawasInfo(id) {
  return pengawasData[id] || null;
}

module.exports = {
  addPengawas,
  removePengawas,
  getPengawasInfo,
};
