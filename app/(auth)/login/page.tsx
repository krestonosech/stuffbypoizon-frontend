import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Вход",
};

export default function Page() {
  return <LoginForm />;
}
