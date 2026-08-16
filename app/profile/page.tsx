"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import ProtectedRoute from "../../components/ProtectedRoute";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import api from "../../lib/api";

interface Order {
	id: string;
	total: number;
	status: string;
	createdAt: string;
	contactType?: string;
	items: {
		sku: {
			id: string;
			size: string;
			price: number;
			product: {
				name: string;
				images: string[];
				itemNumber: string;
			};
		};
		quantity: number;
		price: number;
	}[];
}

export default function ProfilePage() {
	return (
		<ProtectedRoute>
			<ProfileContent />
		</ProtectedRoute>
	);
}

function ProfileContent() {
	const { user, setUser } = useAuth();
	const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
	const [orders, setOrders] = useState<Order[]>([]);
	const [loadingOrders, setLoadingOrders] = useState(false);

	// Отзыв
	const [reviewModal, setReviewModal] = useState<string | null>(null);
	const [reviewRating, setReviewRating] = useState(5);
	const [reviewText, setReviewText] = useState("");
	const [reviewSubmitting, setReviewSubmitting] = useState(false);
	const [reviewedOrderIds, setReviewedOrderIds] = useState<string[]>([]);

	useEffect(() => {
		fetchOrders();
		fetchReviewedOrderIds();
	}, []);

	const fetchReviewedOrderIds = async () => {
		try {
			const { data } = await api.get("/reviews");
			setReviewedOrderIds(
				data.data?.map((r: any) => r.orderId).filter(Boolean) || [],
			);
		} catch {}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	const fetchOrders = async () => {
		setLoadingOrders(true);
		try {
			const { data } = await api.get("/orders");
			setOrders(data.data || []);
		} catch {
			setOrders([]);
		} finally {
			setLoadingOrders(false);
		}
	};

	const submitReview = async () => {
		if (!reviewText || !reviewModal) return;
		setReviewSubmitting(true);
		try {
			await api.post("/reviews", {
				rating: reviewRating,
				text: reviewText,
				orderId: reviewModal,
			});
			setReviewModal(null);
			setReviewText("");
			setReviewRating(5);
			fetchOrders();
		} catch (err: any) {
			alert(err.response?.data?.error || "Ошибка");
		} finally {
			setReviewSubmitting(false);
		}
	};

	const handleLogout = async () => {
		try {
			await api.post("/auth/logout");
			setUser(null);
			window.location.href = "/";
		} catch {
			window.location.href = "/";
		}
	};

	const lastOrders = orders.slice(0, 3);

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	const statusLabels: Record<string, string> = {
		pending: "В обработке",
		paid: "Оплачен",
		delivered: "Доставлен",
		cancelled: "Отменён",
	};

	return (
		<main className="pt-16 min-h-screen flex flex-col">
			<Header />
			<div className="flex-1">
				<div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
					<div className="flex flex-col lg:flex-row gap-8">
						<aside className="w-full lg:w-1/4">
							<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
										{user?.name?.charAt(0) || "U"}
									</div>
									<div>
										<p className="text-xs text-gray-500">Личный кабинет</p>
										<h2 className="text-lg font-bold truncate">
											{user?.name || "Пользователь"}
										</h2>
									</div>
								</div>
								<nav className="flex flex-col gap-1">
									<button
										onClick={() => setActiveTab("profile")}
										className={`flex items-center gap-3 p-3 rounded-lg text-left text-sm font-bold transition ${activeTab === "profile" ? "bg-blue-50 text-primary" : "text-gray-500 hover:bg-gray-50"}`}>
										Профиль
									</button>
									<button
										onClick={() => setActiveTab("orders")}
										className={`flex items-center gap-3 p-3 rounded-lg text-left text-sm font-bold transition ${activeTab === "orders" ? "bg-blue-50 text-primary" : "text-gray-500 hover:bg-gray-50"}`}>
										Мои заказы
									</button>
									<button
										onClick={handleLogout}
										className="flex items-center gap-3 p-3 rounded-lg text-left text-sm font-bold text-red-500 hover:bg-red-50 transition mt-4">
										Выйти
									</button>
								</nav>
							</div>
						</aside>

						<div className="flex-1">
							{activeTab === "profile" ? (
								<section>
									<div className="flex items-center justify-between mb-6">
										<h1
											className="text-2xl md:text-3xl font-extrabold"
											style={{ fontFamily: "Montserrat, sans-serif" }}>
											Профиль
										</h1>
										<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
											Подтвержден
										</span>
									</div>

									<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
													Имя
												</label>
												<div className="bg-gray-50 rounded-lg p-3 text-sm font-medium">
													{user?.name || "—"}
												</div>
											</div>
											<div>
												<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
													Email
												</label>
												<div className="bg-gray-50 rounded-lg p-3 text-sm font-medium">
													{user?.email || "—"}
												</div>
											</div>
										</div>
										<div className="mt-6">
											<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
												Телефон
											</label>
											<div className="bg-gray-50 rounded-lg p-3 text-sm font-medium">
												{user?.phone || "—"}
											</div>
										</div>
									</div>

									<div className="mt-8">
										<h3
											className="text-xl font-bold mb-4"
											style={{ fontFamily: "Montserrat, sans-serif" }}>
											Последние заказы
										</h3>
										{loadingOrders ? (
											<div className="text-center py-8 text-gray-400">
												Загрузка...
											</div>
										) : lastOrders.length === 0 ? (
											<div className="text-center py-12 bg-white rounded-xl border border-gray-100">
												<p className="text-gray-500 font-medium">
													Закажите, чтобы тут что-то появилось!
												</p>
												<a
													href="/catalog"
													className="inline-block mt-4 text-primary font-bold text-sm hover:underline">
													Перейти в каталог
												</a>
											</div>
										) : (
											<div className="space-y-3">
												{lastOrders.map((order) => (
													<div
														key={order.id}
														className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
														<div className="flex justify-between items-center">
															<p className="text-xs text-gray-400">
																{formatDate(order.createdAt)}
															</p>
															<span
																className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
																	order.status === "delivered"
																		? "bg-green-50 text-green-600"
																		: order.status === "paid"
																			? "bg-blue-50 text-primary"
																			: order.status === "cancelled"
																				? "bg-red-50 text-red-500"
																				: "bg-yellow-50 text-yellow-600"
																}`}>
																{statusLabels[order.status] || order.status}
															</span>
														</div>
														{order.items?.map((item, i) => (
															<div key={i} className="flex items-center gap-3">
																<div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
																	{item.sku?.product?.images?.[0] ? (
																		<img
																			src={item.sku.product.images[0]}
																			alt=""
																			className="w-full h-full object-cover rounded-lg"
																		/>
																	) : (
																		<div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
																			—
																		</div>
																	)}
																</div>
																<div className="flex-1">
																	<p className="font-bold text-sm">
																		{item.sku?.product?.name || "Товар"}
																	</p>
																	<p className="text-xs text-gray-400">
																		Размер: {item.sku?.size || "—"} US · Кол-во:{" "}
																		{item.quantity}
																	</p>
																</div>
																<p className="font-bold text-sm">
																	{(
																		item.price * item.quantity
																	).toLocaleString()}{" "}
																	RUB
																</p>
															</div>
														))}
														<div className="flex justify-between items-center">
															<span className="text-xs font-bold text-primary">
																Итого: {order.total.toLocaleString()} RUB
															</span>
															{order.status === "delivered" &&
																!reviewedOrderIds.includes(order.id) && (
																	<button
																		onClick={() => setReviewModal(order.id)}
																		className="text-primary font-bold text-xs hover:underline cursor-pointer">
																		Оставить отзыв
																	</button>
																)}
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</section>
							) : (
								<section>
									<h1
										className="text-2xl md:text-3xl font-extrabold mb-8"
										style={{ fontFamily: "Montserrat, sans-serif" }}>
										Мои заказы
									</h1>
									{loadingOrders ? (
										<div className="text-center py-12 text-gray-400">
											Загрузка...
										</div>
									) : orders.length === 0 ? (
										<div className="text-center py-16 bg-white rounded-xl border border-gray-100">
											<p className="text-gray-500 font-medium text-lg">
												У вас пока нет заказов
											</p>
											<p className="text-gray-400 text-sm mt-1">
												Закажите, чтобы тут что-то появилось!
											</p>
											<a
												href="/catalog"
												className="inline-block mt-6 bg-primary text-white px-6 py-3 rounded-full text-sm font-bold uppercase hover:opacity-90 transition">
												Перейти в каталог
											</a>
										</div>
									) : (
										<div className="space-y-4">
											{orders.map((order) => (
												<div
													key={order.id}
													className="bg-white border border-gray-100 rounded-xl overflow-hidden">
													<div className="p-4 md:p-6">
														<div className="flex justify-between items-start mb-4">
															<div>
																<h3 className="text-lg font-bold">
																	Заказ №{order.id.slice(0, 8)}
																</h3>
																<p className="text-sm text-gray-400">
																	Оформлен {formatDate(order.createdAt)}
																</p>
															</div>
															<span
																className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
																	order.status === "delivered"
																		? "bg-green-50 text-green-600"
																		: order.status === "paid"
																			? "bg-blue-50 text-primary"
																			: order.status === "cancelled"
																				? "bg-red-50 text-red-500"
																				: "bg-yellow-50 text-yellow-600"
																}`}>
																{statusLabels[order.status] || order.status}
															</span>
														</div>
														<div className="space-y-3">
															{order.items?.map((item, i) => (
																<div key={i} className="flex gap-4">
																	<div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
																		{item.sku?.product?.images?.[0] ? (
																			<img
																				src={item.sku.product.images[0]}
																				alt=""
																				className="w-full h-full object-cover rounded-lg"
																			/>
																		) : (
																			<div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
																				—
																			</div>
																		)}
																	</div>
																	<div className="flex-1">
																		<p className="font-bold text-sm">
																			{item.sku?.product?.name || "Товар"}
																		</p>
																		<p className="text-xs text-gray-400">
																			Размер: {item.sku?.size || "—"} US ·
																			Кол-во: {item.quantity}
																		</p>
																		<p className="font-bold text-sm mt-0.5">
																			{(
																				item.price * item.quantity
																			).toLocaleString()}{" "}
																			RUB
																		</p>
																	</div>
																</div>
															))}
														</div>
													</div>
													<div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
														<span className="text-sm font-bold">
															Итого: {order.total.toLocaleString()} RUB
														</span>
														{order.status === "delivered" &&
															!reviewedOrderIds.includes(order.id) && (
																<button
																	onClick={() => setReviewModal(order.id)}
																	className="text-primary font-bold text-xs hover:underline cursor-pointer">
																	Оставить отзыв
																</button>
															)}
													</div>
												</div>
											))}
										</div>
									)}
								</section>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Модалка отзыва */}
			{reviewModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center"
					onClick={() => setReviewModal(null)}>
					<div className="absolute inset-0 bg-black/40" />
					<div
						className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4"
						onClick={(e) => e.stopPropagation()}>
						<h3
							className="text-lg font-extrabold uppercase mb-4"
							style={{ fontFamily: "Montserrat, sans-serif" }}>
							Оставить отзыв
						</h3>
						<div className="flex gap-1 mb-4">
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									onClick={() => setReviewRating(star)}
									className={`text-2xl transition cursor-pointer ${star <= reviewRating ? "text-primary" : "text-gray-300"}`}>
									&#9733;
								</button>
							))}
						</div>
						<textarea
							className="w-full border border-gray-200 rounded-lg p-2.5 text-sm mb-4"
							rows={4}
							placeholder="Ваш отзыв..."
							value={reviewText}
							onChange={(e) => setReviewText(e.target.value)}
						/>
						<button
							onClick={submitReview}
							disabled={reviewSubmitting || !reviewText}
							className="w-full py-2.5 bg-primary text-white text-sm font-bold uppercase rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer">
							{reviewSubmitting ? "Отправка..." : "Отправить"}
						</button>
					</div>
				</div>
			)}

			<Footer />
		</main>
	);
}
