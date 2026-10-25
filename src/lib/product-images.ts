import migraineCare from "@/assets/products/migraine-care-kit.jpg.asset.json";
import skinRelief from "@/assets/products/skin-disease-relief-kit.jpg.asset.json";
import jointPain from "@/assets/products/joint-pain-relief-kit.jpg.asset.json";
import hairCare from "@/assets/products/hair-care-kit.jpg.asset.json";
import pcosSupport from "@/assets/products/pcos-support-kit.jpg.asset.json";
import winterSeason from "@/assets/products/winter-season-kit.jpg.asset.json";
import summerSeason from "@/assets/products/summer-season-kit.jpg.asset.json";
import rainySeason from "@/assets/products/rainy-season-kit.jpg.asset.json";

// One official kit photo per product, supplied by the clinic.
const BY_SLUG: Record<string, string> = {
  "migraine-care-kit": migraineCare.url,
  "skin-disease-relief-kit": skinRelief.url,
  "joint-pain-relief-kit": jointPain.url,
  "hair-care-kit": hairCare.url,
  "pcos-support-kit": pcosSupport.url,
  "winter-season-kit": winterSeason.url,
  "summer-season-kit": summerSeason.url,
  "rainy-season-kit": rainySeason.url,
};

const BY_CATEGORY: Record<string, string> = {
  "homeopathic-kits": migraineCare.url,
};

export function productImage(key?: string | null): string {
  return (key && (BY_SLUG[key] || BY_CATEGORY[key])) || migraineCare.url;
}
