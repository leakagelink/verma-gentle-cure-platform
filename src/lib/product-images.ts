import homeopathic from "@/assets/products/homeopathic-medicines.jpg.asset.json";
import kits from "@/assets/products/homeopathic-kit.jpg.asset.json";

const BY_CATEGORY: Record<string, string> = {
  "homeopathic-kits": kits.url,
  "homeopathic-medicines": homeopathic.url,
};

export function productImage(category?: string | null): string {
  return (category && BY_CATEGORY[category]) || kits.url;
}
