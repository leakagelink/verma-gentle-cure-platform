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

function kit(slug: string, name: string, description: string, contents: string): Medicine {
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
    description: `${description} ${KIT_NOTE}`,
    ingredients: contents,
    usage:
      "Use only as directed by the physician during consultation. Dosage and duration are advised individually.",
  };
}

export const MEDICINES: Medicine[] = [
  kit(
    "migraine-care-kit",
    "Migraine Care Kit",
    "Homeopathic dilutions commonly advised to help manage migraine episodes and support relaxation.",
    "Four physician-selected homeopathic dilutions for migraine support, as advised during consultation.",
  ),
  kit(
    "skin-disease-relief-kit",
    "Skin Disease Relief Kit",
    "Remedies commonly advised to support skin health, help soothe skin irritation and support clearer-looking skin.",
    "Four physician-selected homeopathic dilutions and preparations for skin support.",
  ),
  kit(
    "joint-pain-relief-kit",
    "Joint Pain Relief Kit",
    "Dilutions and oils commonly advised to support joint comfort, mobility and flexibility.",
    "Four physician-selected homeopathic dilutions and oils for joint and muscle support.",
  ),
  kit(
    "hair-care-kit",
    "Hair Care Kit",
    "Remedies commonly advised to support hair strength, scalp care and healthy-looking hair growth.",
    "Four physician-selected homeopathic dilutions for hair and scalp support.",
  ),
  kit(
    "pcos-support-kit",
    "PCOS Support Kit",
    "Remedies commonly advised to support hormonal balance, regular cycles and overall wellness in women.",
    "Four physician-selected homeopathic dilutions for women's hormonal support.",
  ),
  kit(
    "winter-season-kit",
    "Winter Season Kit",
    "Dilutions and tablets commonly kept at home for winter complaints such as cough, cold and congestion.",
    "Four physician-selected homeopathic dilutions and tablets for the winter season.",
  ),
  kit(
    "summer-season-kit",
    "Summer Season Kit",
    "Remedies commonly advised for heat-related discomfort and everyday summer-season complaints.",
    "Four physician-selected homeopathic dilutions for the summer season.",
  ),
  kit(
    "rainy-season-kit",
    "Rainy Season Kit",
    "Remedies commonly advised for monsoon-season complaints such as fever, cold and seasonal upsets.",
    "Four physician-selected homeopathic dilutions for the rainy season.",
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
