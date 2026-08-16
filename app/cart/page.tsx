"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../lib/auth-context";
import api from "../../lib/api";

interface CartItem {
	id: string;
	skuId: string;
	quantity: number;
	sku: {
		id: string;
		size: string;
		price: number;
		stock: number;
		product: {
			id: string;
			name: string;
			images: string[];
			itemNumber: string;
		};
	};
}

const DELIVERY_TIME_SLOTS = [
	"9:00 - 12:00",
	"12:00 - 15:00",
	"15:00 - 18:00",
	"18:00 - 21:00",
];

export default function CartPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [cart, setCart] = useState<CartItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [form, setForm] = useState({
		name: "",
		phone: "",
		email: "",
		messenger: "telegram",
		telegramNick: "",
		deliveryMethod: "pickup",
		city: "",
		address: "",
		deliveryDate: "",
		deliveryTime: "",
		comment: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [toastVisible, setToastVisible] = useState(false);
	const [toast, setToast] = useState<{ message: string } | null>(null);
	const [removedItems, setRemovedItems] = useState<
		Record<string, { item: CartItem; timeout: NodeJS.Timeout }>
	>({});
	const [successModal, setSuccessModal] = useState(false);

	// Кастомные селекты
	const [deliveryOpen, setDeliveryOpen] = useState(false);
	const [timeOpen, setTimeOpen] = useState(false);

	// Поиск города
	const [citySearch, setCitySearch] = useState("");
	const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
	const [cityOpen, setCityOpen] = useState(false);

	// Поиск адреса
	const [addressSearch, setAddressSearch] = useState("");
	const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
	const [addressOpen, setAddressOpen] = useState(false);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login?redirect=/cart");
			return;
		}
		if (user) {
			setForm((prev) => ({
				...prev,
				name: user.name || "",
				phone: user.phone || "",
				email: user.email || "",
			}));
			fetchCart();
		}
	}, [user, authLoading]);

	const showToast = (message: string) => {
		setToast({ message });
		setToastVisible(true);
		setTimeout(() => setToastVisible(false), 2500);
		setTimeout(() => setToast(null), 3000);
	};
	const fetchCart = async () => {
		try {
			const { data } = await api.get("/cart");
			setCart(data.data?.items || []);
		} catch {
			setCart([]);
		} finally {
			setLoading(false);
		}
	};
	const updateQuantity = async (
		itemId: string,
		quantity: number,
		stock: number,
	) => {
		if (quantity < 1) return;
		if (quantity > stock) {
			showToast("Недостаточно товара. Доступно: " + stock);
			return;
		}
		try {
			await api.put(`/cart/${itemId}`, { quantity });
			fetchCart();
			window.dispatchEvent(new Event("cartUpdated"));
		} catch (err: any) {
			showToast(err.response?.data?.error || "Ошибка");
		}
	};
	const removeItem = async (itemId: string, index: number) => {
		const removed = cart[index];
		try {
			await api.delete(`/cart/${itemId}`);
		} catch {}
		setRemovedItems((prev) => ({
			...prev,
			[itemId]: { item: removed, timeout: setTimeout(() => {}, 0) },
		}));
		setCart((prev) => prev.filter((_, i) => i !== index));
		window.dispatchEvent(new Event("cartUpdated"));
	};
	const restoreItem = async (itemId: string) => {
		const entry = removedItems[itemId];
		if (!entry) return;
		try {
			await api.post("/cart", {
				skuId: entry.item.skuId,
				quantity: entry.item.quantity,
			});
		} catch {}
		setRemovedItems((prev) => {
			const next = { ...prev };
			delete next[itemId];
			return next;
		});
		fetchCart();
		window.dispatchEvent(new Event("cartUpdated"));
	};

	const deliveryCost = form.deliveryMethod === "courier" ? 1000 : 0;
	const total = cart.reduce(
		(sum, item) => sum + item.sku.price * item.quantity,
		0,
	);
	const totalWithDelivery = total + deliveryCost;

	const deliveryLabels: Record<string, string> = {
		pickup: "Самовывоз — 0 RUB",
		courier: "Курьерская доставка по Москве — 1000 RUB",
		pickup_point: "Пункт выдачи — уточняется",
	};

	// Поиск города (только РФ)
	const searchCity = async (query: string) => {
		setCitySearch(query);
		if (query.length < 2) {
			setCitySuggestions([]);
			setCityOpen(false);
			return;
		}
		try {
			const { data } = await api.get(
				`/geo/search?q=${encodeURIComponent(query)}&type=city`,
			);
			setCitySuggestions(data.data || []);
			setCityOpen(true);
		} catch {
			setCitySuggestions([]);
		}
	};

	const selectCity = (cityName: string) => {
		setForm({ ...form, city: cityName });
		setCitySearch(cityName);
		setCityOpen(false);
	};

	// Поиск адреса
	const searchAddress = async (query: string) => {
		setAddressSearch(query);
		if (query.length < 3) {
			setAddressSuggestions([]);
			setAddressOpen(false);
			return;
		}
		try {
			const q = form.city ? `${form.city}, ${query}` : query;
			const { data } = await api.get(
				`/geo/search?q=${encodeURIComponent(q)}&type=address`,
			);
			setAddressSuggestions(data.data || []);
			setAddressOpen(true);
		} catch {
			setAddressSuggestions([]);
		}
	};

	const selectAddress = (addr: string) => {
		setForm({ ...form, address: addr });
		setAddressSearch(addr);
		setAddressOpen(false);
	};

	// Валидация
	const validate = (): string => {
		if (!form.name.trim()) return "Введите имя";
		if (!form.phone.trim()) return "Введите телефон";
		if (!form.email.trim()) return "Введите email";
		if (form.deliveryMethod === "courier") {
			if (!form.city.trim()) return "Введите город";
			if (!form.address.trim()) return "Введите адрес";
			if (!form.deliveryDate) return "Выберите дату доставки";
			if (!form.deliveryTime) return "Выберите время доставки";
		}
		if (form.deliveryMethod === "pickup_point") {
			if (!form.city.trim()) return "Введите город";
			if (!form.address.trim()) return "Введите адрес";
		}
		return "";
	};

	const handleSubmit = async () => {
		const validationError = validate();
		if (validationError) {
			setError(validationError);
			return;
		}
		setSubmitting(true);
		setError("");
		try {
			await api.post("/orders", { ...form, deliveryCost });
			setCart([]);
			window.dispatchEvent(new Event("cartUpdated"));
			setSuccessModal(true);
		} catch (err: any) {
			setError(err.response?.data?.error || "Ошибка оформления заказа");
		} finally {
			setSubmitting(false);
		}
	};

	useEffect(() => {
		return () => {
			Object.values(removedItems).forEach((entry) =>
				clearTimeout(entry.timeout),
			);
		};
	}, [removedItems]);

	if (authLoading || loading) {
		return (
			<main className="pt-16 min-h-screen flex flex-col">
				<Header />
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
				</div>
				<Footer />
			</main>
		);
	}

	if (!user) return null;

	return (
		<main className="pt-16 min-h-screen flex flex-col">
			<Header />
			<div className="flex-1">
				{toast && (
					<div
						className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-full shadow-lg text-sm font-bold transition-all duration-300 ${toastVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
						{toast.message}
					</div>
				)}

				<div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
					<header className="mb-8 md:mb-12">
						<h1
							className="text-2xl md:text-4xl font-extrabold uppercase mb-2"
							style={{ fontFamily: "Montserrat, sans-serif" }}>
							Оформление
						</h1>
						<div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
							<span>Корзина</span>
							<span>›</span>
							<span className="text-primary">Подтверждение</span>
						</div>
					</header>

					{cart.length === 0 && Object.keys(removedItems).length === 0 ? (
						<div className="text-center py-20 text-gray-400">
							<p className="text-lg font-bold uppercase mb-2">Корзина пуста</p>
							<Link
								href="/catalog"
								className="text-primary font-bold text-sm hover:underline">
								Перейти в каталог
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							<section className="lg:col-span-7 space-y-6">
								<div className="border-b border-gray-100 pb-3">
									<span className="text-xs font-bold text-gray-400 uppercase">
										Товары ({cart.length})
									</span>
								</div>
								{cart.map((item, i) => (
									<div key={item.id} className="flex gap-4 md:gap-6">
										<Link
											href={`/product/${item.sku.product.id}`}
											className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center cursor-pointer">
											{item.sku.product.images?.[0] ? (
												<img
													src={item.sku.product.images[0]}
													alt=""
													className="w-full h-full object-contain"
												/>
											) : (
												<div className="text-gray-400 text-xs">
													{item.sku.product.name}
												</div>
											)}
										</Link>
										<div className="flex-grow flex flex-col justify-between py-1">
											<div>
												<div className="flex justify-between items-start">
													<Link
														href={`/product/${item.sku.product.id}`}
														className="text-sm md:text-lg font-bold uppercase tracking-tight hover:text-primary transition"
														style={{ fontFamily: "Montserrat, sans-serif" }}>
														{item.sku.product.name}
													</Link>
													<button
														onClick={() => removeItem(item.id, i)}
														className="text-gray-400 hover:text-red-500 transition cursor-pointer text-lg">
														&times;
													</button>
												</div>
												<p className="text-[10px] font-bold text-gray-400 mt-1">
													РАЗМЕР: {item.sku.size} US
												</p>
											</div>
											<div className="flex justify-between items-end">
												<div className="flex items-center border border-gray-200 rounded-lg">
													<button
														onClick={() =>
															updateQuantity(
																item.id,
																item.quantity - 1,
																item.sku.stock,
															)
														}
														className="px-3 py-1 text-gray-500 hover:text-black transition cursor-pointer">
														−
													</button>
													<span className="px-3 py-1 text-xs font-bold">
														{item.quantity}
													</span>
													<button
														onClick={() =>
															updateQuantity(
																item.id,
																item.quantity + 1,
																item.sku.stock,
															)
														}
														className="px-3 py-1 text-gray-500 hover:text-black transition cursor-pointer">
														+
													</button>
												</div>
												<span className="text-sm font-bold">
													{(item.sku.price * item.quantity).toLocaleString()}{" "}
													RUB
												</span>
											</div>
										</div>
									</div>
								))}
								{Object.entries(removedItems).map(([itemId, entry]) => (
									<div
										key={itemId}
										className="flex gap-4 md:gap-6 items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
										<div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
											{entry.item.sku.product.images?.[0] ? (
												<img
													src={entry.item.sku.product.images[0]}
													alt=""
													className="w-full h-full object-contain opacity-50"
												/>
											) : (
												<div className="text-gray-400 text-xs opacity-50">
													{entry.item.sku.product.name}
												</div>
											)}
										</div>
										<div className="flex-grow">
											<p className="text-sm font-bold text-gray-500">
												Вы удалили &quot;{entry.item.sku.product.name}&quot;
											</p>
											<p className="text-[10px] text-gray-400">
												РАЗМЕР: {entry.item.sku.size} US
											</p>
										</div>
										<button
											onClick={() => restoreItem(itemId)}
											className="text-primary font-bold text-xs uppercase hover:underline cursor-pointer shrink-0">
											Вернуть
										</button>
									</div>
								))}
								<div className="mt-8 bg-gray-50 p-5 rounded-xl flex gap-3 items-start border-l-4 border-primary">
									<span className="text-primary text-lg">!</span>
									<div>
										<p className="text-xs font-bold uppercase mb-1">
											Оплата на сайте временно недоступна
										</p>
										<p className="text-[12px] text-gray-500 leading-relaxed">
											Оплата производится при получении или прямым переводом
											после подтверждения заказа менеджером.
										</p>
									</div>
								</div>
							</section>

							<aside className="lg:col-span-5">
								<div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm sticky top-24">
									<h2
										className="text-lg font-extrabold uppercase mb-6"
										style={{ fontFamily: "Montserrat, sans-serif" }}>
										Оформление заказа
									</h2>
									<div className="space-y-4 mb-6">
										{/* Имя */}
										<div>
											<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
												Имя *
											</label>
											<input
												className="w-full border-b border-gray-200 px-0 py-2 text-sm focus:border-primary transition bg-transparent focus:ring-0"
												value={form.name}
												onChange={(e) =>
													setForm({ ...form, name: e.target.value })
												}
											/>
										</div>
										{/* Телефон */}
										<div>
											<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
												Номер телефона *
											</label>
											<input
												className="w-full border-b border-gray-200 px-0 py-2 text-sm focus:border-primary transition bg-transparent focus:ring-0"
												type="tel"
												value={form.phone}
												onChange={(e) =>
													setForm({ ...form, phone: e.target.value })
												}
											/>
										</div>
										{/* Email */}
										<div>
											<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
												Email *
											</label>
											<input
												className="w-full border-b border-gray-200 px-0 py-2 text-sm focus:border-primary transition bg-transparent focus:ring-0"
												type="email"
												value={form.email}
												onChange={(e) =>
													setForm({ ...form, email: e.target.value })
												}
											/>
										</div>
										{/* Связь */}
										<div>
											<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
												Способ связи
											</label>
											<div className="grid grid-cols-2 gap-3 mt-2">
												{["telegram", "whatsapp"].map((m) => (
													<label
														key={m}
														className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${form.messenger === m ? "border-primary bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
														<input
															type="radio"
															name="messenger"
															value={m}
															checked={form.messenger === m}
															onChange={(e) =>
																setForm({ ...form, messenger: e.target.value })
															}
															className="text-primary focus:ring-0"
														/>
														<span className="text-[11px] font-bold uppercase">
															{m === "telegram" ? "Telegram" : "WhatsApp"}
														</span>
													</label>
												))}
											</div>
										</div>
										{form.messenger === "telegram" && (
											<div>
												<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
													Никнейм в Telegram
												</label>
												<div className="relative">
													<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
														@
													</span>
													<input
														className="w-full border-b border-gray-200 pl-8 pr-0 py-2 text-sm focus:border-primary transition bg-transparent focus:ring-0"
														placeholder="username"
														value={form.telegramNick}
														onChange={(e) =>
															setForm({ ...form, telegramNick: e.target.value })
														}
													/>
												</div>
											</div>
										)}

										{/* Доставка */}
										<div className="relative">
											<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
												Способ получения
											</label>
											<button
												type="button"
												onClick={() => setDeliveryOpen(!deliveryOpen)}
												className="w-full flex items-center justify-between border-b border-gray-200 py-2 text-sm focus:border-primary transition cursor-pointer">
												<span
													className={
														form.deliveryMethod ? "text-black" : "text-gray-400"
													}>
													{deliveryLabels[form.deliveryMethod] ||
														"Выбрать способ"}
												</span>
												<svg
													className={`w-4 h-4 text-gray-400 transition-transform ${deliveryOpen ? "rotate-180" : ""}`}
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2">
													<polyline points="6 9 12 15 18 9" />
												</svg>
											</button>
											{deliveryOpen && (
												<>
													<div
														className="fixed inset-0 z-10"
														onClick={() => setDeliveryOpen(false)}
													/>
													<div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
														{Object.entries(deliveryLabels).map(
															([key, label]) => (
																<button
																	key={key}
																	type="button"
																	onClick={() => {
																		setForm({ ...form, deliveryMethod: key });
																		setDeliveryOpen(false);
																	}}
																	className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-gray-50 ${form.deliveryMethod === key ? "text-primary bg-blue-50 font-bold" : "text-gray-500"}`}>
																	{label}
																</button>
															),
														)}
													</div>
												</>
											)}
										</div>

										{/* Город (для курьера и пункта выдачи) */}
										{(form.deliveryMethod === "courier" ||
											form.deliveryMethod === "pickup_point") && (
											<div className="relative">
												<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
													Город *
												</label>
												<input
													className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition bg-transparent focus:ring-0"
													placeholder="Введите город..."
													value={citySearch}
													onChange={(e) => searchCity(e.target.value)}
													onFocus={() => {
														if (citySuggestions.length > 0) setCityOpen(true);
													}}
												/>
												{cityOpen && citySuggestions.length > 0 && (
													<>
														<div
															className="fixed inset-0 z-10"
															onClick={() => setCityOpen(false)}
														/>
														<div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
															{citySuggestions.map((s, i) => (
																<button
																	key={i}
																	type="button"
																	onClick={() => selectCity(s)}
																	className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition">
																	{s}
																</button>
															))}
														</div>
													</>
												)}
											</div>
										)}

										{/* Адрес (для курьера и пункта выдачи) */}
										{(form.deliveryMethod === "courier" ||
											form.deliveryMethod === "pickup_point") && (
											<div className="relative">
												<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
													{form.deliveryMethod === "courier"
														? "Адрес доставки *"
														: "Адрес пункта выдачи *"}
												</label>
												<input
													className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition bg-transparent focus:ring-0"
													placeholder="Начните вводить адрес..."
													value={addressSearch}
													onChange={(e) => searchAddress(e.target.value)}
													onFocus={() => {
														if (addressSuggestions.length > 0)
															setAddressOpen(true);
													}}
												/>
												{addressOpen && addressSuggestions.length > 0 && (
													<>
														<div
															className="fixed inset-0 z-10"
															onClick={() => setAddressOpen(false)}
														/>
														<div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
															{addressSuggestions.map((s, i) => (
																<button
																	key={i}
																	type="button"
																	onClick={() => selectAddress(s)}
																	className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition">
																	{s}
																</button>
															))}
														</div>
													</>
												)}
											</div>
										)}

										{/* Дата и время для курьера */}
										{form.deliveryMethod === "courier" && (
											<>
												<div className="relative">
													<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
														Дата доставки *
													</label>
													<div className="relative">
														<input
															type="date"
															className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary transition bg-transparent focus:ring-0 cursor-pointer pr-8"
															value={form.deliveryDate}
															onChange={(e) =>
																setForm({
																	...form,
																	deliveryDate: e.target.value,
																})
															}
														/>
														<svg
															className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2">
															<rect
																x="3"
																y="4"
																width="18"
																height="18"
																rx="2"
																ry="2"
															/>
															<line x1="16" y1="2" x2="16" y2="6" />
															<line x1="8" y1="2" x2="8" y2="6" />
															<line x1="3" y1="10" x2="21" y2="10" />
														</svg>
													</div>
												</div>
												<div className="relative">
													<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
														Время доставки
													</label>
													<button
														type="button"
														onClick={() => setTimeOpen(!timeOpen)}
														className="w-full flex items-center justify-between border-b border-gray-200 py-2 text-sm focus:border-primary transition cursor-pointer">
														<span
															className={
																form.deliveryTime
																	? "text-black"
																	: "text-gray-400"
															}>
															{form.deliveryTime || "Выбрать время"}
														</span>
														<svg
															className={`w-4 h-4 text-gray-400 transition-transform ${timeOpen ? "rotate-180" : ""}`}
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2">
															<polyline points="6 9 12 15 18 9" />
														</svg>
													</button>
													{timeOpen && (
														<>
															<div
																className="fixed inset-0 z-10"
																onClick={() => setTimeOpen(false)}
															/>
															<div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
																{DELIVERY_TIME_SLOTS.map((slot) => (
																	<button
																		key={slot}
																		type="button"
																		onClick={() => {
																			setForm({ ...form, deliveryTime: slot });
																			setTimeOpen(false);
																		}}
																		className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-gray-50 ${form.deliveryTime === slot ? "text-primary bg-blue-50 font-bold" : "text-gray-500"}`}>
																		{slot}
																	</button>
																))}
															</div>
														</>
													)}
												</div>
											</>
										)}

										{/* Комментарий */}
										<div>
											<label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">
												Комментарий к заказу
											</label>
											<textarea
												className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-primary transition bg-transparent focus:ring-0 resize-none"
												rows={2}
												value={form.comment}
												onChange={(e) =>
													setForm({ ...form, comment: e.target.value })
												}
											/>
										</div>
									</div>

									<div className="border-t border-gray-100 pt-6 space-y-3">
										<div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
											<span>Сумма</span>
											<span>{total.toLocaleString()} RUB</span>
										</div>
										<div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
											<span>Доставка</span>
											<span>
												{deliveryCost === 0
													? "Бесплатно"
													: `${deliveryCost} RUB`}
											</span>
										</div>
										<div
											className="flex justify-between text-lg font-extrabold pt-4"
											style={{ fontFamily: "Montserrat, sans-serif" }}>
											<span>Итого</span>
											<span>{totalWithDelivery.toLocaleString()} RUB</span>
										</div>
									</div>

									{error && (
										<div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs text-center mt-4">
											{error}
										</div>
									)}

									<button
										onClick={handleSubmit}
										disabled={submitting}
										className="w-full bg-primary text-white py-4 mt-6 text-sm font-bold uppercase tracking-wider rounded-xl hover:opacity-90 disabled:opacity-50 transition cursor-pointer">
										{submitting ? "Оформление..." : "Оформить заказ"}
									</button>
									<p className="text-center mt-4 text-[10px] text-gray-400 uppercase">
										Нажимая на кнопку, вы соглашаетесь с{" "}
										<a href="#" className="underline">
											Условиями обслуживания
										</a>
									</p>
								</div>
							</aside>
						</div>
					)}
				</div>
			</div>

			{/* Модалка успеха */}
			<div
				className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${successModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
				onClick={() => {
					setSuccessModal(false);
					router.push("/profile?tab=orders");
				}}>
				<div className="absolute inset-0 bg-black/40" />
				<div
					className={`relative bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl text-center transition-all duration-300 ${successModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
					onClick={(e) => e.stopPropagation()}>
					<div className="text-5xl mb-4">&#10003;</div>
					<h3
						className="text-xl font-extrabold uppercase mb-2"
						style={{ fontFamily: "Montserrat, sans-serif" }}>
						Спасибо за заказ!
					</h3>
					<p className="text-gray-500 text-sm mb-6">
						С вами свяжется наш сотрудник по указанному виду связи.
					</p>
					<button
						onClick={() => {
							setSuccessModal(false);
							router.push("/profile?tab=orders");
						}}
						className="w-full py-3 bg-primary text-white text-sm font-bold uppercase rounded-xl hover:opacity-90 transition cursor-pointer">
						Перейти к заказам
					</button>
				</div>
			</div>

			<Footer />
		</main>
	);
}
