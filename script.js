// Saloum Sen Boutique — logique du site (panier + commande WhatsApp + stock)

const WA_NUMBER = "221783873491"; // +221 78 387 34 91
const CART_KEY = "ssb_cart_v1";

/* ---------- Panier (persistant via localStorage) ---------- */
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    /* stockage indisponible, le panier reste en mémoire pour la session */
  }
}

let cart = loadCart(); // { productId: quantite }

function cartItems() {
  return Object.entries(cart)
    .map(([id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return null;
      return { product, qty, lineTotal: product.price * qty };
    })
    .filter(Boolean);
}
function cartCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}
function cartTotal() {
  return cartItems().reduce((sum, i) => sum + i.lineTotal, 0);
}

function addToCart(id, qty = 1) {
  const stock = getStock(id);
  const already = cart[id] || 0;
  if (stock <= 0) {
    showToast("Ce produit est en rupture de stock");
    return;
  }
  const wanted = already + qty;
  const finalQty = Math.min(wanted, stock);
  cart[id] = finalQty;
  saveCart();
  renderCart();
  const product = PRODUCTS.find((p) => p.id === id);
  if (finalQty < wanted) {
    showToast(`Stock limité : ${stock} disponible(s) pour ${product ? product.name : "ce produit"}`);
  } else if (product) {
    showToast(`${product.name} ajouté au panier`);
  }
}
function changeQty(id, delta) {
  if (!cart[id]) return;
  const stock = getStock(id);
  cart[id] = Math.min(cart[id] + delta, stock);
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}
function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

/* ---------- Toast ---------- */
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------- Icônes / badges ---------- */
function energyChip(level) {
  if (!level || level === "—") return "";
  return `<div class="energy-badge" data-level="${level}"><span class="chip">${level}</span>Classe énergie</div>`;
}
function stockBadgeHTML(stock) {
  if (stock <= 0) return `<span class="stock-badge stock-out">Rupture de stock</span>`;
  if (stock <= 3) return `<span class="stock-badge stock-low">Plus que ${stock} en stock</span>`;
  return "";
}

/* ---------- Carte produit (grille) ---------- */
function productCard(p) {
  const stock = getStock(p.id);
  const outOfStock = stock <= 0;
  return `
    <div class="card${outOfStock ? " card-disabled" : ""}" data-id="${p.id}">
      <div class="card-media">
        ${energyChip(p.energy)}
        ${ICONS[p.icon]}
      </div>
      <div class="card-body">
        <span class="cat">${p.category}</span>
        <h3>${p.name}</h3>
        <p class="tagline">${p.tagline}</p>
        ${stockBadgeHTML(stock)}
        <div class="card-foot">
          <span class="price">${formatFCFA(p.price)}</span>
          <a class="card-link" href="product.html?id=${p.id}">Voir le produit →</a>
        </div>
        <button class="btn btn-gold card-add" data-action="quick-add" data-id="${p.id}" ${outOfStock ? "disabled" : ""}>
          ${outOfStock ? "Indisponible" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  `;
}

function renderFeaturedGrid() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map(productCard).join("");
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="quick-add"]');
    if (!btn || btn.disabled) return;
    addToCart(btn.dataset.id, 1);
  });
}

/* ---------- Page produit ---------- */
let currentQty = 1;

function renderProductPage() {
  const mount = document.getElementById("product-mount");
  if (!mount) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
  const stock = getStock(product.id);
  const outOfStock = stock <= 0;
  currentQty = outOfStock ? 0 : 1;

  document.title = `${product.name} — Saloum Sen Boutique`;

  const specsHTML = Object.entries(product.specs)
    .map(([k, v]) => `<div class="row"><span>${k}</span><span>${v}</span></div>`)
    .join("");

  mount.innerHTML = `
    <div class="product-media">
      ${energyChip(product.energy)}
      ${ICONS[product.icon]}
    </div>
    <div class="product-info">
      <span class="cat">${product.category}</span>
      <h1>${product.name}</h1>
      <p class="tagline">${product.tagline}</p>
      <div class="price-row">
        <span class="price-big">${formatFCFA(product.price)}</span>
      </div>
      ${
        outOfStock
          ? `<span class="stock-badge stock-out">Rupture de stock</span>`
          : stock <= 3
          ? `<span class="stock-badge stock-low">Plus que ${stock} en stock</span>`
          : `<span class="stock-badge stock-ok">En stock</span>`
      }
      <p class="desc">${product.desc}</p>
      <div class="specs">${specsHTML}</div>
      <div class="qty-stepper" id="pdp-qty" ${outOfStock ? "style='opacity:.4;pointer-events:none;'" : ""}>
        <button class="qty-btn" data-action="dec" aria-label="Diminuer">−</button>
        <span id="pdp-qty-val">${currentQty}</span>
        <button class="qty-btn" data-action="inc" aria-label="Augmenter">+</button>
      </div>
      <div class="product-actions">
        <button class="btn btn-gold" id="add-cart-btn" ${outOfStock ? "disabled" : ""}>
          ${outOfStock ? "Indisponible" : "Ajouter au panier"}
        </button>
        <a class="btn btn-teal" target="_blank" rel="noopener" id="pdp-whatsapp" href="#">Commander sur WhatsApp</a>
      </div>
    </div>
  `;

  const qtyVal = document.getElementById("pdp-qty-val");
  document.getElementById("pdp-qty").addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-btn");
    if (!btn) return;
    if (btn.dataset.action === "inc") currentQty = Math.min(currentQty + 1, stock);
    if (btn.dataset.action === "dec") currentQty = Math.max(1, currentQty - 1);
    qtyVal.textContent = currentQty;
  });

  const addBtn = document.getElementById("add-cart-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => addToCart(product.id, currentQty));
  }

  const waLink = document.getElementById("pdp-whatsapp");
  waLink.addEventListener("click", (e) => {
    e.preventDefault();
    const qtyForMsg = Math.max(1, currentQty);
    const text = encodeURIComponent(
      `Bonjour, je suis intéressé(e) par : ${qtyForMsg}x ${product.name} (${formatFCFA(product.price)} l'unité). Est-il disponible ?`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank", "noopener");
  });

  const relatedMount = document.getElementById("related-grid");
  if (relatedMount) {
    const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
    relatedMount.innerHTML = related.map(productCard).join("");
    relatedMount.addEventListener("click", (e) => {
      const btn = e.target.closest('[data-action="quick-add"]');
      if (!btn || btn.disabled) return;
      addToCart(btn.dataset.id, 1);
    });
  }
}

/* ---------- Tiroir panier ---------- */
function renderCart() {
  document.querySelectorAll("#cart-count").forEach((el) => (el.textContent = cartCount()));

  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!list || !totalEl) return;

  const items = cartItems();
  if (!items.length) {
    list.innerHTML = `<p class="cart-empty">Votre panier est vide pour l'instant.</p>`;
  } else {
    list.innerHTML = items
      .map(
        ({ product, qty, lineTotal }) => `
      <div class="cart-item" data-id="${product.id}">
        <div class="cart-item-icon">${ICONS[product.icon]}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">${formatFCFA(lineTotal)}</div>
          <div class="qty-stepper qty-stepper-sm">
            <button class="qty-btn" data-action="dec">−</button>
            <span>${qty}</span>
            <button class="qty-btn" data-action="inc">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-action="remove" aria-label="Retirer">×</button>
      </div>
    `
      )
      .join("");
  }
  totalEl.textContent = formatFCFA(cartTotal());
}

function buildCartWhatsAppLink() {
  const items = cartItems();
  if (!items.length) return `https://wa.me/${WA_NUMBER}`;
  const lines = items.map(({ product, qty, lineTotal }) => `- ${qty}x ${product.name} — ${formatFCFA(lineTotal)}`);
  const text = encodeURIComponent(
    `Bonjour, je souhaite commander :\n${lines.join("\n")}\n\nTotal : ${formatFCFA(cartTotal())}`
  );
  return `https://wa.me/${WA_NUMBER}?text=${text}`;
}

function setupCartDrawer() {
  const toggle = document.getElementById("cart-toggle");
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  const closeBtn = document.getElementById("cart-close");
  const list = document.getElementById("cart-items");
  const checkoutBtn = document.getElementById("cart-checkout");

  if (!toggle || !drawer) return;

  const open = () => {
    drawer.classList.add("open");
    overlay.classList.add("open");
  };
  const close = () => {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
  };

  toggle.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);

  list.addEventListener("click", (e) => {
    const item = e.target.closest(".cart-item");
    if (!item) return;
    const id = item.dataset.id;
    if (e.target.closest('[data-action="inc"]')) changeQty(id, 1);
    if (e.target.closest('[data-action="dec"]')) changeQty(id, -1);
    if (e.target.closest('[data-action="remove"]')) removeFromCart(id);
  });

  checkoutBtn.addEventListener("click", () => {
    if (!cartItems().length) {
      showToast("Ajoutez au moins un article avant de commander");
      return;
    }
    window.open(buildCartWhatsAppLink(), "_blank", "noopener");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupCartDrawer();
  renderCart();
  renderFeaturedGrid();
  renderProductPage();
  onStockChange(() => {
    renderFeaturedGrid();
    renderProductPage();
  });
});
