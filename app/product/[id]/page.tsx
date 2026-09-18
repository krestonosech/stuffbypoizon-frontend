import type { Metadata } from "next";
import ProductClient from "./ProductClient";

type Props = {
  params: Promise<{ id: string }>;
};

async function getProduct(id: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const res = await fetch(`${baseUrl}/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Товар не найден" };
  return {
    title: product.name,
    description: product.description?.slice(0, 160) || undefined,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ProductClient id={id} />;
}
