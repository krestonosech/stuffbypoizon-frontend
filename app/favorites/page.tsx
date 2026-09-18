import type { Metadata } from "next";
import FavoritesClient from "./FavoritesClient";

export const metadata: Metadata = {
  title: "Избранное",
};

export default function Page() {
  return <FavoritesClient />;
}
