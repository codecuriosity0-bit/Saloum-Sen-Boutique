// Saloum Sen Boutique — gestion du stock (synchronisé en temps réel via Firebase)
// Le stock "de base" vient de products.js (chaque produit a un champ stock).
// Les valeurs enregistrées dans Firebase (chemin "stock/<id>") prennent le dessus
// dès qu'elles existent, et se mettent à jour en direct sur tous les appareils
// ouverts sur le site — public comme admin.

let stockOverrides = {};
let stockReady = false;
const stockListeners = [];

function onStockChange(fn) {
  stockListeners.push(fn);
  if (stockReady) fn();
}
function notifyStockListeners() {
  stockListeners.forEach((fn) => fn());
}

// Écoute en direct : dès qu'un changement est écrit (depuis admin.html, n'importe
// où), ce callback se redéclenche automatiquement sur toutes les pages ouvertes.
db.ref("stock").on("value", (snapshot) => {
  stockOverrides = snapshot.val() || {};
  stockReady = true;
  notifyStockListeners();
});

function getStock(id) {
  if (Object.prototype.hasOwnProperty.call(stockOverrides, id)) return stockOverrides[id];
  const p = PRODUCTS.find((p) => p.id === id);
  return p ? p.stock : 0;
}
function setStock(id, qty) {
  const value = Math.max(0, Math.floor(qty) || 0);
  db.ref("stock/" + id).set(value);
}
function adjustStock(id, delta) {
  setStock(id, getStock(id) + delta);
}
function resetStock(id) {
  db.ref("stock/" + id).remove();
}
function resetAllStock() {
  db.ref("stock").remove();
}
