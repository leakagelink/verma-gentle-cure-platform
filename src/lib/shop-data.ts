export type MedicineCategory = {
  slug: string;
  name: string;
  description: string;
};

export const MEDICINE_CATEGORIES: MedicineCategory[] = [
  {
    slug: "homeopathic-kits",
    name: "Homeopathic Kits",
    description: "Curated homeopathic remedy kits assembled under the clinic's guidance.",
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

export const KIT_PRICE = 1500;
export const KIT_SHIPPING = 125;

const KIT_NOTE =
  "Each kit is prepared and checked at the Verma Gentle Cure clinic. Contents are selected for everyday family use and must be taken only under the guidance of our physician.";

function kit(
  slug: string,
  name: string,
  focus: string,
  contents: string,
): Medicine {
  return {
    slug,
    name,
    brand: "Verma Gentle Cure",
    category: "homeopathic-kits",
    price: KIT_PRICE,
    mrp: KIT_PRICE,
    rating: 4.8,
    reviews: 0,
    stock: 20,
    pack: "Complete homeopathic kit",
    description: `Curated homeopathic kit focused on ${focus}. ${KIT_NOTE}`,
    ingredients: contents,
    usage: "Use only as directed by the physician during consultation. Dosage and duration are advised individually.",
  };
}

export const MEDICINES: Medicine[] = [
  kit(
    "homeopathy-basic-kit",
    "Homeopathy Basic Kit",
    "everyday family care",
    "A starter set of commonly used homeopathic dilutions and biochemic tablets for common, minor complaints.",
  ),
  kit(
    "fever-cold-care-kit",
    "Fever & Cold Care Kit",
    "fever, cold and seasonal complaints",
    "Dilutions and tablets traditionally kept at home for fever, cough, cold and seasonal discomfort.",
  ),
  kit(
    "digestive-care-kit",
    "Digestive Care Kit",
    "digestion-related complaints",
    "Remedies commonly advised for indigestion, acidity, gas and stomach discomfort.",
  ),
  kit(
    "womens-health-kit",
    "Women's Health Kit",
    "women's day-to-day health needs",
    "Remedies commonly advised for menstrual and general women's-health support.",
  ),
  kit(
    "child-care-kit",
    "Child Care Kit",
    "children's everyday health needs",
    "Gentle dilutions commonly advised for teething, minor upsets and routine child-care support.",
  ),
  kit(
    "skin-hair-care-kit",
    "Skin & Hair Care Kit",
    "skin and hair care",
    "Remedies and locally applied preparations commonly advised for minor skin and hair concerns.",
  ),
  kit(
    "joint-muscle-care-kit",
    "Joint & Muscle Care Kit",
    "joint and muscle discomfort",
    "Dilutions and oils commonly advised for joint stiffness and everyday muscle discomfort.",
  ),
  kit(
    "immunity-wellness-kit",
    "Immunity & Wellness Kit",
    "general wellness routines",
    "Tonics and dilutions commonly included in day-to-day wellness routines for the whole family.",
  ),
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
