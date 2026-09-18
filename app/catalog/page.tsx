import type { Metadata } from "next";
import CatalogClient from "./CatalogClient";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const TYPE_LABELS: Record<string, string> = {
  Sneakers: "Кроссовки",
  Clothing: "Одежда",
  Accessories: "Аксессуары",
  Bags: "Сумки",
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;

  const get = (key: string) => {
    const val = params[key];
    return Array.isArray(val) ? val[0] : val || "";
  };

  const parts: string[] = [];

  const subtype = get("subtype");
  const clothingType = get("clothingType");
  const brand = get("brand");
  const series = get("series");
  const type = get("type");
  const gender = get("gender");
  const search = get("search");

  if (subtype) parts.push(subtype);
  else if (clothingType) parts.push(clothingType);

  if (brand) parts.push(brand);

  if (series) parts.push(series);

  if (parts.length === 0 && type) parts.push(TYPE_LABELS[type] || type);
  if (parts.length === 0 && gender) {
    parts.push(
      gender === "Men" ? "Мужское" : gender === "Women" ? "Женское" : "Унисекс",
    );
  }
  if (parts.length === 0 && search) parts.push(`Поиск: ${search}`);

  if (parts.length === 0) {
    return { title: "Каталог" };
  }

  return { title: parts.join(" ") };
}

export default function Page() {
  return <CatalogClient />;
}
