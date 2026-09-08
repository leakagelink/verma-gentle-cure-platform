import biochemic from "@/assets/products/biochemic-medicines.jpg.asset.json";
import supplements from "@/assets/products/health-supplements.jpg.asset.json";
import homeopathic from "@/assets/products/homeopathic-medicines.jpg.asset.json";
import tinctures from "@/assets/products/mother-tinctures.jpg.asset.json";
import personalCare from "@/assets/products/personal-care.jpg.asset.json";

const BY_CATEGORY: Record<string, string> = {
  "homeopathic-medicines": homeopathic.url,
  "mother-tinctures": tinctures.url,
  "biochemic-medicines": biochemic.url,
  "personal-care": personalCare.url,
  "health-supplements": supplements.url,
};

export function productImage(category?: string | null): string {
  return (category && BY_CATEGORY[category]) || homeopathic.url;
}
