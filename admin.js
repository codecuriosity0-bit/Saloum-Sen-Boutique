// Saloum Sen Boutique — administration du stock et du catalogue (connectée à Firebase)
const ADMIN_PIN = "2609"; // change ce code directement ici si tu veux un autre code
const ADMIN_AUTH_KEY = "ssb_admin_unlocked";

const ICON_LABELS = {
  fridge: "Réfrigérateur",
  washer: "Machine à laver",
  stove: "Cuisinière",
  ac: "Climatiseur",
  blender: "Mixeur / blender",
  tv: "Téléviseur",
  fan: "Ventilateur",
  microwave: "Micro-ondes"
};

let editingId = null; // null = mode "ajouter", sinon id du produit en cours de modification

function isUnlocked() {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === "yes";
  } catch (e) {
    return false;
  }
}
function setUnlocked() {
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, "yes");
  } catch (e) {}
}
function lockAdmin() {
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  } catch (e) {}
  // On recharge tout de suite : on ne bloque plus l'interface en attendant
  // que signOut() se termine (ça pouvait rester "pendu" en cas de réseau lent).
  // La déconnexion Firebase se fait en arrière-plan, sans attendre sa réponse.
  try {
    firebase.auth().signOut();
  } catch (e) {}
  location.reload();
}

function openPanel() {
  document.getElementById("admin-gate").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";
  populateIconSelect();
  onStockChange(renderTable);
  onCatalogChange(renderTable);
}

function setupGate() {
  const gate = document.getElementById("admin-gate");
  const form = document.getElementById("gate-form");
  const input = document.getElementById("gate-pin");
  const error = document.getElementById("gate-error");

  if (isUnlocked()) {
    firebase.auth().signInAnonymously().then(openPanel).catch(() => {
      error.textContent = "Connexion impossible, vérifie ta connexion internet.";
      gate.style.display = "flex";
    });
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim() !== ADMIN_PIN) {
      error.textContent = "Code incorrect, réessaie.";
      input.value = "";
      input.focus();
      return;
    }
    error.textContent = "Connexion…";
    firebase
      .auth()
      .signInAnonymously()
      .then(() => {
        setUnlocked();
        openPanel();
      })
      .catch(() => {
        error.textContent = "Connexion impossible, vérifie ta connexion internet.";
      });
  });
}

function populateIconSelect() {
  const select = document.getElementById("new-icon");
  if (!select || select.options.length) return;
  Object.entries(ICON_LABELS).forEach(([key, label]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = label;
    select.appendChild(opt);
  });
}

function specsToText(specs) {
  return Object.entries(specs || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function openFormFor(product) {
  const panel = document.getElementById("add-product-panel");
  const toggle = document.getElementById("add-product-toggle");
  const submitBtn = document.getElementById("add-product-submit");
  const cancelBtn = document.getElementById("cancel-edit-btn");
  const title = document.getElementById("add-product-title");

  editingId = product ? product.id : null;
  panel.style.display = "block";
  toggle.textContent = "− Fermer le formulaire";

  if (product) {
    title.textContent = `Modifier « ${product.name} »`;
    submitBtn.textContent = "Enregistrer les modifications";
    cancelBtn.style.display = "inline-flex";
    document.getElementById("new-name").value = product.name;
    document.getElementById("new-category").value = product.category;
    document.getElementById("new-icon").value = product.icon;
    document.getElementById("new-price").value = product.price;
    document.getElementById("new-stock").value = getStock(product.id);
    document.getElementById("new-stock").disabled = true;
    document.getElementById("new-energy").value = product.energy || "—";
    document.getElementById("new-tagline").value = product.tagline || "";
    document.getElementById("new-image").value = product.image || "";
    document.getElementById("new-desc").value = product.desc || "";
    document.getElementById("new-specs").value = specsToText(product.specs);
  } else {
    title.textContent = "Ajouter un produit";
    submitBtn.textContent = "Ajouter au catalogue";
    cancelBtn.style.display = "none";
    document.getElementById("new-stock").disabled = false;
    document.getElementById("add-product-form").reset();
  }
  document.getElementById("add-product-feedback").textContent = "";
  panel.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setupAddForm() {
  const toggle = document.getElementById("add-product-toggle");
  const panel = document.getElementById("add-product-panel");
  const form = document.getElementById("add-product-form");
  const feedback = document.getElementById("add-product-feedback");
  const cancelBtn = document.getElementById("cancel-edit-btn");

  toggle.addEventListener("click", () => {
    const open = panel.style.display !== "none";
    if (open) {
      panel.style.display = "none";
      toggle.textContent = "+ Ajouter un produit";
      editingId = null;
    } else {
      openFormFor(null);
    }
  });

  cancelBtn.addEventListener("click", () => openFormFor(null));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById("new-name").value.trim(),
      category: document.getElementById("new-category").value.trim(),
      icon: document.getElementById("new-icon").value,
      price: parseInt(document.getElementById("new-price").value, 10),
      stock: parseInt(document.getElementById("new-stock").value, 10) || 0,
      energy: document.getElementById("new-energy").value,
      tagline: document.getElementById("new-tagline").value.trim(),
      desc: document.getElementById("new-desc").value.trim(),
      image: document.getElementById("new-image").value.trim(),
      specsText: document.getElementById("new-specs").value
    };

    if (!data.name || !data.category || !data.price) {
      feedback.textContent = "Nom, catégorie et prix sont obligatoires.";
      return;
    }

    if (editingId) {
      feedback.textContent = "Enregistrement…";
      editProduct(editingId, data)
        .then(() => {
          feedback.textContent = `« ${data.name} » a été mis à jour.`;
          openFormFor(null);
          panel.style.display = "none";
          toggle.textContent = "+ Ajouter un produit";
        })
        .catch(() => {
          feedback.textContent = "Erreur : la modification n'a pas pu être enregistrée.";
        });
    } else {
      feedback.textContent = "Ajout en cours…";
      addProduct(data)
        .then(() => {
          feedback.textContent = `« ${data.name} » a été ajouté au catalogue.`;
          form.reset();
        })
        .catch(() => {
          feedback.textContent = "Erreur : le produit n'a pas pu être ajouté, vérifie ta connexion.";
        });
    }
  });
}

function stockRow(p) {
  const stock = getStock(p.id);
  const value = p.price * stock;
  const custom = isCustomProduct(p.id);
  const overridden = isOverridden(p.id);
  return `
    <div class="admin-row" data-id="${p.id}">
      <div class="admin-row-icon">${ICONS[p.icon]}</div>
      <div class="admin-row-info">
        <div class="admin-row-name">${p.name} ${custom ? '<span class="custom-tag">ajouté</span>' : ""} ${overridden ? '<span class="custom-tag">modifié</span>' : ""}</div>
        <div class="admin-row-meta">${p.category} · ${formatFCFA(p.price)} / unité</div>
      </div>
      <div class="admin-row-value">${formatFCFA(value)}<span>valeur stock</span></div>
      <div class="qty-stepper admin-stepper">
        <button class="qty-btn" data-action="dec" aria-label="Diminuer">−</button>
        <input class="admin-stock-input" type="number" min="0" value="${stock}" data-id="${p.id}">
        <button class="qty-btn" data-action="inc" aria-label="Augmenter">+</button>
      </div>
      ${stock <= 0 ? `<span class="stock-badge stock-out">Rupture</span>` : stock <= 3 ? `<span class="stock-badge stock-low">Stock bas</span>` : `<span class="stock-badge stock-ok">OK</span>`}
      <div class="admin-row-actions">
        <button class="admin-edit" data-action="edit" aria-label="Modifier ce produit">Modifier</button>
        ${overridden ? `<button class="admin-restore" data-action="restore" aria-label="Restaurer l'original">Restaurer</button>` : ""}
        ${custom ? `<button class="admin-delete" data-action="delete" aria-label="Supprimer ce produit">Supprimer</button>` : ""}
      </div>
    </div>
  `;
}

function renderTable() {
  const mount = document.getElementById("admin-table");
  const search = document.getElementById("admin-search").value.trim().toLowerCase();
  const products = allProducts();

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search));
  mount.innerHTML = filtered.map(stockRow).join("");

  const totalUnits = products.reduce((sum, p) => sum + getStock(p.id), 0);
  const totalValue = products.reduce((sum, p) => sum + getStock(p.id) * p.price, 0);
  const outCount = products.filter((p) => getStock(p.id) <= 0).length;
  document.getElementById("stat-units").textContent = totalUnits;
  document.getElementById("stat-value").textContent = formatFCFA(totalValue);
  document.getElementById("stat-out").textContent = outCount;

  mount.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".admin-row").dataset.id;
      adjustStock(id, btn.dataset.action === "inc" ? 1 : -1);
    });
  });
  mount.querySelectorAll(".admin-stock-input").forEach((input) => {
    input.addEventListener("change", () => {
      setStock(input.dataset.id, parseInt(input.value, 10) || 0);
    });
  });
  mount.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".admin-row").dataset.id;
      const p = findProduct(id);
      if (p) openFormFor(p);
    });
  });
  mount.querySelectorAll('[data-action="restore"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".admin-row").dataset.id;
      const p = findProduct(id);
      if (confirm(`Restaurer « ${p ? p.name : id} » à sa version d'origine ?`)) {
        restoreProduct(id);
      }
    });
  });
  mount.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".admin-row").dataset.id;
      const p = findProduct(id);
      if (confirm(`Supprimer « ${p ? p.name : id} » du catalogue ?`)) {
        removeProduct(id);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupGate();
  setupAddForm();
  document.getElementById("admin-search").addEventListener("input", () => {
    if (isUnlocked()) renderTable();
  });
  document.getElementById("reset-all").addEventListener("click", () => {
    if (confirm("Réinitialiser tout le stock aux valeurs de départ du catalogue ?")) {
      resetAllStock();
    }
  });
  document.getElementById("lock-btn").addEventListener("click", lockAdmin);
});
