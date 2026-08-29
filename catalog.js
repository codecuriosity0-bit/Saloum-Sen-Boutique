// Saloum Sen Boutique — catalogue produits (de base + modifications + ajouts depuis l'admin)
// PRODUCTS (products.js) reste le socle fixe.
// - Les produits créés depuis admin.html sont stockés dans Firebase sous "products/<id>".
// - Les modifications faites depuis admin.html sur un produit DE BASE sont stockées à part,
//   sous "productOverrides/<id>", et viennent recouvrir les champs d'origine sans les effacer
//   du code — un bouton "Restaurer l'original" peut annuler ça à tout moment.

let extraProducts = {};
let productOverrides = {};
let extraProductsLoaded = false;
let overridesLoaded = false;
let catalogReady = false;
const catalogListeners = [];

function onCatalogChange(fn) {
  catalogListeners.push(fn);
  if (catalogReady) fn();
}
function notifyCatalogListeners() {
  catalogListeners.forEach((fn) => fn());
}
function checkCatalogReady() {
  if (extraProductsLoaded && overridesLoaded) catalogReady = true;
  notifyCatalogListeners();
}

db.ref("products").on("value", (snapshot) => {
  extraProducts = snapshot.val() || {};
  extraProductsLoaded = true;
  checkCatalogReady();
});
db.ref("productOverrides").on("value", (snapshot) => {
  productOverrides = snapshot.val() || {};
  overridesLoaded = true;
  checkCatalogReady();
});

function isBaseProduct(id) {
  return PRODUCTS.some((p) => p.id === id);
}
function isCustomProduct(id) {
  return Object.prototype.hasOwnProperty.call(extraProducts, id);
}
function isOverridden(id) {
  return Object.prototype.hasOwnProperty.call(productOverrides, id);
}

function allProducts() {
  const base = PRODUCTS.map((p) => {
    const override = productOverrides[p.id];
    return override ? { ...p, ...override, id: p.id } : p;
  });
  return base.concat(Object.values(extraProducts));
}
function findProduct(id) {
  return allProducts().find((p) => p.id === id);
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function specsFromText(specsText) {
  const specs = {};
  (specsText || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > -1) {
        const k = line.slice(0, idx).trim();
        const v = line.slice(idx + 1).trim();
        if (k && v) specs[k] = v;
      }
    });
  return specs;
}

function buildProductFields(data) {
  return {
    name: data.name,
    category: data.category,
    icon: data.icon,
    price: Math.max(0, Math.round(data.price) || 0),
    energy: data.energy || "—",
    tagline: data.tagline || "",
    desc: data.desc || "",
    image: data.image || "",
    specs: specsFromText(data.specsText)
  };
}

// data: { name, category, icon, price, energy, tagline, desc, stock, image, specsText }
function addProduct(data) {
  let id = slugify(data.name) || "produit";
  if (findProduct(id)) id = id + "-" + Date.now().toString().slice(-4);

  const product = { id, ...buildProductFields(data) };

  return db
    .ref("products/" + id)
    .set(product)
    .then(() => setStock(id, data.stock || 0));
}

// Modifie un produit existant : écrase le produit "products/<id>" s'il a été ajouté
// depuis l'admin, ou enregistre une surcouche "productOverrides/<id>" si c'est un
// des 9 produits de base (le fichier products.js n'est jamais modifié).
function editProduct(id, data) {
  const fields = buildProductFields(data);
  if (isCustomProduct(id)) {
    return db.ref("products/" + id).set({ id, ...fields });
  }
  return db.ref("productOverrides/" + id).set(fields);
}

function removeProduct(id) {
  return db
    .ref("products/" + id)
    .remove()
    .then(() => resetStock(id));
}

function restoreProduct(id) {
  return db.ref("productOverrides/" + id).remove();
}
