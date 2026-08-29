// Saloum Sen Boutique — données produits
// Aucune vraie photo au départ : chaque catégorie a une icône ligne dessinée à la main,
// dans l'esprit d'un schéma technique de notice d'électroménager.

const ICONS = {
  fridge: `<svg viewBox="0 0 100 140" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="18" y="6" width="64" height="128" rx="6"/>
    <line x1="18" y1="46" x2="82" y2="46"/>
    <line x1="30" y1="16" x2="30" y2="36"/>
    <line x1="30" y1="56" x2="30" y2="120"/>
  </svg>`,
  washer: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="10" y="8" width="80" height="84" rx="6"/>
    <circle cx="50" cy="54" r="26"/>
    <circle cx="50" cy="54" r="17"/>
    <line x1="24" y1="20" x2="32" y2="20"/>
    <line x1="40" y1="20" x2="48" y2="20"/>
  </svg>`,
  stove: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="10" y="14" width="80" height="72" rx="5"/>
    <circle cx="32" cy="36" r="10"/>
    <circle cx="68" cy="36" r="10"/>
    <line x1="20" y1="64" x2="80" y2="64"/>
    <line x1="20" y1="74" x2="80" y2="74"/>
  </svg>`,
  ac: `<svg viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="10" width="88" height="34" rx="6"/>
    <line x1="16" y1="24" x2="84" y2="24"/>
    <line x1="20" y1="50" x2="30" y2="44"/>
    <line x1="45" y1="50" x2="55" y2="44"/>
    <line x1="70" y1="50" x2="80" y2="44"/>
  </svg>`,
  blender: `<svg viewBox="0 0 100 130" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 10 H68 L60 76 H40 Z"/>
    <rect x="24" y="76" width="52" height="34" rx="4"/>
    <path d="M20 110 H80 L74 122 H26 Z"/>
    <line x1="40" y1="28" x2="60" y2="28"/>
    <line x1="42" y1="46" x2="58" y2="46"/>
  </svg>`,
  tv: `<svg viewBox="0 0 100 80" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="6" width="88" height="54" rx="4"/>
    <line x1="50" y1="60" x2="50" y2="72"/>
    <line x1="30" y1="72" x2="70" y2="72"/>
  </svg>`,
  fan: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="40" r="28"/>
    <path d="M50 40 C50 22 62 16 68 22 C74 30 62 40 50 40"/>
    <path d="M50 40 C68 40 74 52 68 58 C60 66 50 54 50 40"/>
    <path d="M50 40 C50 58 38 64 32 58 C26 50 38 40 50 40"/>
    <circle cx="50" cy="40" r="4"/>
    <line x1="50" y1="68" x2="50" y2="92"/>
    <line x1="34" y1="92" x2="66" y2="92"/>
  </svg>`,
  microwave: `<svg viewBox="0 0 100 70" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="8" width="88" height="54" rx="5"/>
    <rect x="14" y="16" width="54" height="38" rx="3"/>
    <line x1="80" y1="20" x2="86" y2="20"/>
    <circle cx="83" cy="40" r="6"/>
  </svg>`
};

const PRODUCTS = [
  {
    id: "frigo-190l",
    name: "Réfrigérateur 190L",
    category: "Réfrigération",
    icon: "fridge",
    price: 165000,
    stock: 8,
    energy: "A+",
    tagline: "Le compagnon fidèle d'une cuisine familiale à Ziguinchor.",
    desc: "Un réfrigérateur simple porte, pensé pour tenir la chaleur casamançaise à distance sans faire exploser la facture d'électricité. Compartiment congélateur intégré, clayettes réglables.",
    specs: { "Capacité": "190 litres", "Puissance": "90 W", "Dimensions": "55 × 57 × 128 cm", "Garantie": "12 mois pièces et main d'œuvre" }
  },
  {
    id: "frigo-350l",
    name: "Réfrigérateur combiné 350L",
    category: "Réfrigération",
    icon: "fridge",
    price: 285000,
    stock: 4,
    energy: "A++",
    tagline: "Pour les familles nombreuses ou les petits commerces.",
    desc: "Grand volume, congélateur séparé en bas, éclairage LED intérieur. Idéal pour stocker boissons et produits frais en quantité.",
    specs: { "Capacité": "350 litres", "Puissance": "130 W", "Dimensions": "60 × 65 × 175 cm", "Garantie": "18 mois pièces et main d'œuvre" }
  },
  {
    id: "machine-laver-7kg",
    name: "Machine à laver 7kg",
    category: "Lavage",
    icon: "washer",
    price: 195000,
    stock: 6,
    energy: "A+",
    tagline: "Dites au revoir aux heures de lessive à la main.",
    desc: "Chargement par le haut, 7 kg de linge par cycle, plusieurs programmes adaptés au tissu. Robuste et simple à réparer.",
    specs: { "Capacité": "7 kg", "Programmes": "8", "Dimensions": "52 × 55 × 90 cm", "Garantie": "12 mois" }
  },
  {
    id: "cuisiniere-4feux",
    name: "Cuisinière à gaz 4 feux",
    category: "Cuisson",
    icon: "stove",
    price: 145000,
    stock: 10,
    energy: "—",
    tagline: "Quatre feux, un four, aucun compromis sur le service.",
    desc: "Cuisinière mixte gaz avec four intégré et allumage électronique. Grille en fonte robuste, plateau émaillé facile à nettoyer.",
    specs: { "Feux": "4", "Four": "Intégré 45L", "Dimensions": "50 × 55 × 85 cm", "Garantie": "12 mois" }
  },
  {
    id: "clim-1cv",
    name: "Climatiseur split 1CV",
    category: "Climatisation",
    icon: "ac",
    price: 225000,
    stock: 5,
    energy: "A",
    tagline: "Une chambre fraîche même en pleine saison des pluies.",
    desc: "Split mural silencieux, mode économie d'énergie, télécommande incluse. Installation recommandée par un technicien agréé.",
    specs: { "Puissance": "1 CV / 9000 BTU", "Niveau sonore": "26 dB", "Surface conseillée": "≤ 18 m²", "Garantie": "24 mois compresseur" }
  },
  {
    id: "mixeur-pro",
    name: "Mixeur-blender robuste",
    category: "Petit électroménager",
    icon: "blender",
    price: 32000,
    stock: 15,
    energy: "—",
    tagline: "Pour les jus de bissap et les sauces bien pilées.",
    desc: "Bol en verre 1,5L, lames en inox renforcé, 3 vitesses plus fonction pulse. Conçu pour un usage quotidien intensif.",
    specs: { "Capacité": "1,5 litre", "Puissance": "600 W", "Vitesses": "3 + Pulse", "Garantie": "6 mois" }
  },
  {
    id: "tele-43",
    name: "Téléviseur LED 43\"",
    category: "Image & Son",
    icon: "tv",
    price: 175000,
    stock: 7,
    energy: "A+",
    tagline: "Les matchs et les séries en grand format.",
    desc: "Dalle LED Full HD 43 pouces, plusieurs ports HDMI et USB, réglages d'image optimisés pour l'éclairage tropical.",
    specs: { "Taille": "43 pouces", "Résolution": "Full HD 1920×1080", "Ports": "3× HDMI, 2× USB", "Garantie": "12 mois" }
  },
  {
    id: "ventilateur-sol",
    name: "Ventilateur sur pied",
    category: "Petit électroménager",
    icon: "fan",
    price: 22000,
    stock: 20,
    energy: "—",
    tagline: "L'allié simple des soirées chaudes.",
    desc: "Trois vitesses, tête oscillante à 90°, hauteur réglable. Base stable, moteur silencieux.",
    specs: { "Vitesses": "3", "Diamètre pales": "40 cm", "Hauteur": "Réglable 90–120 cm", "Garantie": "6 mois" }
  },
  {
    id: "micro-ondes-25l",
    name: "Four micro-ondes 25L",
    category: "Cuisson",
    icon: "microwave",
    price: 58000,
    stock: 12,
    energy: "—",
    tagline: "Réchauffer, décongeler, gratiner — sans y penser.",
    desc: "25 litres, grill intégré, panneau à molette simple. Intérieur facile à nettoyer, minuterie jusqu'à 60 minutes.",
    specs: { "Capacité": "25 litres", "Puissance": "900 W", "Fonction": "Micro-ondes + Grill", "Garantie": "6 mois" }
  }
];

function formatFCFA(n) {
  return n.toLocaleString("fr-FR").replace(/,/g, " ") + " FCFA";
}
