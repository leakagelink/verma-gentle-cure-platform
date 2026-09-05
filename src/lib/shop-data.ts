export type MedicineCategory = {
  slug: string;
  name: string;
  description: string;
};

export const MEDICINE_CATEGORIES: MedicineCategory[] = [
  {
    slug: "homeopathic-medicines",
    name: "Homeopathic Medicines",
    description: "Classical dilutions and potencies from established homeopathic pharmacies.",
  },
  {
    slug: "mother-tinctures",
    name: "Mother Tinctures",
    description: "Concentrated plant-based preparations used as directed by a practitioner.",
  },
  {
    slug: "biochemic-medicines",
    name: "Biochemic Medicines",
    description: "Tissue salt preparations available in standard potencies.",
  },
  {
    slug: "personal-care",
    name: "Personal Care",
    description: "Everyday skin, hair and oral care formulated with homeopathic ingredients.",
  },
  {
    slug: "health-supplements",
    name: "Health Supplements",
    description: "General wellness tonics and supplements for daily routines.",
  },
];

export type Medicine = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  stock: number;
  pack: string;
  description: string;
  ingredients: string;
  usage: string;
};

export const MEDICINES: Medicine[] = [
  {
    slug: "arnica-montana-30c",
    name: "Arnica Montana 30C Dilution",
    brand: "Gentle Cure Pharma",
    category: "homeopathic-medicines",
    price: 135,
    mrp: 165,
    rating: 4.6,
    reviews: 214,
    stock: 42,
    pack: "30 ml dilution",
    description:
      "A classical homeopathic dilution prepared in an alcohol base, commonly kept in household kits.",
    ingredients: "Arnica Montana 30C in ethanol base.",
    usage: "Use only as directed by a qualified homeopathic practitioner.",
  },
  {
    slug: "nux-vomica-200c",
    name: "Nux Vomica 200C Dilution",
    brand: "Gentle Cure Pharma",
    category: "homeopathic-medicines",
    price: 145,
    mrp: 180,
    rating: 4.5,
    reviews: 176,
    stock: 28,
    pack: "30 ml dilution",
    description: "Higher potency classical dilution supplied in a sealed amber bottle.",
    ingredients: "Nux Vomica 200C in ethanol base.",
    usage: "Dosage should be decided during consultation.",
  },
  {
    slug: "belladonna-30c",
    name: "Belladonna 30C Dilution",
    brand: "Herbaline Homeo",
    category: "homeopathic-medicines",
    price: 130,
    mrp: 150,
    rating: 4.4,
    reviews: 98,
    stock: 6,
    pack: "30 ml dilution",
    description: "Standard potency dilution from a certified homeopathic manufacturing unit.",
    ingredients: "Belladonna 30C in ethanol base.",
    usage: "Use under practitioner guidance only.",
  },
  {
    slug: "calendula-mother-tincture",
    name: "Calendula Officinalis Q",
    brand: "Herbaline Homeo",
    category: "mother-tinctures",
    price: 210,
    mrp: 260,
    rating: 4.7,
    reviews: 312,
    stock: 55,
    pack: "30 ml mother tincture",
    description: "Mother tincture prepared from Calendula officinalis flowering tops.",
    ingredients: "Calendula Officinalis Q, ethanol.",
    usage: "External or internal use strictly as advised by a practitioner.",
  },
  {
    slug: "echinacea-mother-tincture",
    name: "Echinacea Angustifolia Q",
    brand: "Gentle Cure Pharma",
    category: "mother-tinctures",
    price: 235,
    mrp: 275,
    rating: 4.5,
    reviews: 141,
    stock: 19,
    pack: "30 ml mother tincture",
    description: "Concentrated mother tincture supplied in a dropper bottle.",
    ingredients: "Echinacea Angustifolia Q, ethanol.",
    usage: "Dilute and use as directed by your physician.",
  },
  {
    slug: "kali-phos-6x",
    name: "Kali Phosphoricum 6X Tablets",
    brand: "BioSalt Labs",
    category: "biochemic-medicines",
    price: 165,
    mrp: 195,
    rating: 4.6,
    reviews: 268,
    stock: 71,
    pack: "25 g tablets",
    description: "Biochemic tissue salt tablets in a standard 6X trituration.",
    ingredients: "Kali Phosphoricum 6X, lactose base.",
    usage: "Allow tablets to dissolve on the tongue as advised.",
  },
  {
    slug: "ferrum-phos-12x",
    name: "Ferrum Phosphoricum 12X Tablets",
    brand: "BioSalt Labs",
    category: "biochemic-medicines",
    price: 155,
    mrp: 175,
    rating: 4.3,
    reviews: 87,
    stock: 0,
    pack: "25 g tablets",
    description: "Tissue salt tablets manufactured under GMP conditions.",
    ingredients: "Ferrum Phosphoricum 12X, lactose base.",
    usage: "Use as directed by a qualified practitioner.",
  },
  {
    slug: "arnica-hair-oil",
    name: "Arnica Hair Care Oil",
    brand: "Gentle Cure Pharma",
    category: "personal-care",
    price: 285,
    mrp: 340,
    rating: 4.4,
    reviews: 402,
    stock: 33,
    pack: "100 ml oil",
    description: "A light, non-sticky hair oil formulated with homeopathic ingredients.",
    ingredients: "Arnica Montana Q, Jaborandi Q, coconut oil base.",
    usage: "Massage into the scalp and leave for 30 minutes before washing.",
  },
  {
    slug: "calendula-face-wash",
    name: "Calendula Gentle Face Wash",
    brand: "Herbaline Homeo",
    category: "personal-care",
    price: 245,
    mrp: 290,
    rating: 4.5,
    reviews: 189,
    stock: 8,
    pack: "100 ml wash",
    description: "A mild daily cleanser suitable for sensitive skin types.",
    ingredients: "Calendula Officinalis Q, mild surfactant base.",
    usage: "Use twice daily on damp skin and rinse thoroughly.",
  },
  {
    slug: "alfalfa-tonic",
    name: "Alfalfa General Wellness Tonic",
    brand: "Gentle Cure Pharma",
    category: "health-supplements",
    price: 295,
    mrp: 350,
    rating: 4.6,
    reviews: 523,
    stock: 64,
    pack: "500 ml tonic",
    description: "A general wellness tonic commonly used to support appetite and daily routine.",
    ingredients: "Alfalfa Q, Avena Sativa Q, Ginseng Q in a syrup base.",
    usage: "Take as advised by a qualified healthcare professional.",
  },
];

export const PRODUCT_DISCLAIMER =
  "Product information is provided for informational purposes and is not a substitute for professional medical advice. Please consult a qualified healthcare professional when appropriate.";

export function stockStatus(stock: number) {
  if (stock === 0) return { label: "Out of Stock", tone: "out" as const };
  if (stock <= 10) return { label: "Low Stock", tone: "low" as const };
  return { label: "In Stock", tone: "in" as const };
}

export function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}
