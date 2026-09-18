import type { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Главная",
};

export default function Home() {
  return <HomeClient />;
}
