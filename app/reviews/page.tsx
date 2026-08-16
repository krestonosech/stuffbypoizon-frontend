"use client";

import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../lib/auth-context";
import api from "../../lib/api";

export default function ReviewsPage() {
	const { user } = useAuth();
	const [reviews, setReviews] = useState<any[]>([]);
	const [canReview, setCanReview] = useState(false);
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [text, setText] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchReviews();
		if (user) checkCanReview();
	}, [user]);

	const fetchReviews = async () => {
		try {
			const { data } = await api.get("/reviews");
			setReviews(data.data || []);
		} catch {}
	};

	const checkCanReview = async () => {
		try {
			const { data } = await api.get("/orders");
			const hasDelivered = data.data?.some(
				(o: any) => o.status === "delivered",
			);
			setCanReview(hasDelivered);
		} catch {}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!text || rating === 0) return;
		setError("");
		setLoading(true);
		try {
			await api.post("/reviews", { rating, text });
			setSubmitted(true);
			setText("");
			setRating(0);
			fetchReviews();
			setTimeout(() => setSubmitted(false), 3000);
		} catch (err: any) {
			setError(err.response?.data?.error || "Ошибка");
		} finally {
			setLoading(false);
		}
	};

	const avgRating =
		reviews.length > 0
			? (
					reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
				).toFixed(1)
			: "0.0";

	return (
		<main className="pt-16 min-h-screen flex flex-col">
			<Header />
			<div className="flex-1">
				<div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
					<section className="mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
						<div className="lg:col-span-7">
							<h1
								className="text-3xl md:text-5xl font-extrabold uppercase mb-4"
								style={{ fontFamily: "Montserrat, sans-serif" }}>
								Отзывы наших клиентов
							</h1>
							<p className="text-gray-500 max-w-2xl">
								Мы гордимся тем, что доставляем только оригинальную продукцию.
							</p>
						</div>
						<div className="lg:col-span-5 bg-gray-50 p-8 border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center">
							<div
								className="text-5xl font-extrabold text-primary mb-2"
								style={{ fontFamily: "Montserrat, sans-serif" }}>
								{avgRating}
							</div>
							<div className="flex gap-1 mb-3">
								{[1, 2, 3, 4, 5].map((i) => (
									<span key={i} className="text-primary text-xl">
										&#9733;
									</span>
								))}
							</div>
							<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
								на основе {reviews.length} отзывов
							</p>
						</div>
					</section>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						<div className="lg:col-span-8 space-y-6">
							{reviews.length === 0 ? (
								<div className="text-center py-16 text-gray-400">
									<p className="text-lg font-bold uppercase">
										Пока нет отзывов
									</p>
									<p className="text-sm mt-1">
										Будьте первым, кто оставит отзыв!
									</p>
								</div>
							) : (
								reviews.map((review: any) => (
									<article
										key={review.id}
										className="bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-300 transition">
										<div className="flex justify-between items-start mb-4">
											<div>
												<h3
													className="text-lg font-bold mb-1"
													style={{ fontFamily: "Montserrat, sans-serif" }}>
													{review.userName}
												</h3>
												<div className="flex gap-0.5">
													{[1, 2, 3, 4, 5].map((star) => (
														<span
															key={star}
															className={
																star <= review.rating
																	? "text-primary"
																	: "text-gray-300"
															}>
															&#9733;
														</span>
													))}
												</div>
											</div>
											<time className="text-xs text-gray-400 font-bold">
												{new Date(review.createdAt).toLocaleDateString(
													"ru-RU",
													{ day: "numeric", month: "long", year: "numeric" },
												)}
											</time>
										</div>
										<p className="text-sm text-gray-500 leading-relaxed">
											{review.text}
										</p>
									</article>
								))
							)}
						</div>

						<aside className="lg:col-span-4">
							<div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
								<h2
									className="text-xl font-extrabold uppercase mb-6"
									style={{ fontFamily: "Montserrat, sans-serif" }}>
									Информация
								</h2>
								<p className="text-sm text-gray-400">
									Отзывы могут оставлять только покупатели с доставленным
									заказом. Перейдите в профиль, чтобы оставить отзыв о вашей
									покупке.
								</p>
							</div>
						</aside>
					</div>
				</div>
			</div>
			<Footer />
		</main>
	);
}
