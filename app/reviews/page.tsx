import type { Metadata } from "next";
import ReviewsClient from "./ReviewsClient";

export const metadata: Metadata = {
  title: "Отзывы",
};

export default function Page() {
  return <ReviewsClient />;
}
