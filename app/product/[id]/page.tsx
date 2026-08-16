"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";

interface SKU {
	id: string;
	size: string;
	price: number;
	stock: number;
}

interface Product {
	id: string;
	name: string;
	description: string;
	itemNumber: string;
	type: string;
	gender: string;
	color?: string;
	brand?: string;
	season?: string;
	series?: string;
	totalModels: number;
	dropDate?: string;
	images: string[];
	skus: SKU[];
	price: number;
}

const SIZE_CHARTS: Record<
	string,
	Record<string, { ru: string; us: string; cm: string }>
> = {
	nike: {
		"36": { ru: "36", us: "4", cm: "22.5" },
		"36.5": { ru: "36.5", us: "4.5", cm: "23.0" },
		"37.5": { ru: "37.5", us: "5", cm: "23.5" },
		"38": { ru: "38", us: "5.5", cm: "24.0" },
		"38.5": { ru: "38.5", us: "6", cm: "24.5" },
		"39": { ru: "39", us: "6.5", cm: "25.0" },
		"40": { ru: "40", us: "7", cm: "25.5" },
		"40.5": { ru: "40.5", us: "7.5", cm: "26.0" },
		"41": { ru: "41", us: "8", cm: "26.5" },
		"42": { ru: "42", us: "8.5", cm: "27.0" },
		"42.5": { ru: "42.5", us: "9", cm: "27.5" },
		"43": { ru: "43", us: "9.5", cm: "28.0" },
		"44": { ru: "44", us: "10", cm: "28.5" },
		"44.5": { ru: "44.5", us: "10.5", cm: "29.0" },
		"45": { ru: "45", us: "11", cm: "29.5" },
		"45.5": { ru: "45.5", us: "11.5", cm: "30.0" },
		"46": { ru: "46", us: "12", cm: "30.5" },
		"47": { ru: "47", us: "13", cm: "31.5" },
		"47.5": { ru: "47.5", us: "13.5", cm: "32.0" },
		"48": { ru: "48", us: "14", cm: "32.5" },
		"49": { ru: "49", us: "15", cm: "33.5" },
	},
	adidas: {
		"36": { ru: "36", us: "4", cm: "22.1" },
		"36 2/3": { ru: "36.5", us: "4.5", cm: "22.5" },
		"37 1/3": { ru: "37", us: "5", cm: "22.9" },
		"38": { ru: "38", us: "5.5", cm: "23.3" },
		"38 2/3": { ru: "38.5", us: "6", cm: "23.7" },
		"39 1/3": { ru: "39", us: "6.5", cm: "24.1" },
		"40": { ru: "40", us: "7", cm: "24.5" },
		"40 2/3": { ru: "40.5", us: "7.5", cm: "25.0" },
		"41 1/3": { ru: "41", us: "8", cm: "25.4" },
		"42": { ru: "42", us: "8.5", cm: "25.8" },
		"42 2/3": { ru: "42.5", us: "9", cm: "26.2" },
		"43 1/3": { ru: "43", us: "9.5", cm: "26.6" },
		"44": { ru: "44", us: "10", cm: "27.0" },
		"44 2/3": { ru: "44.5", us: "10.5", cm: "27.5" },
		"45 1/3": { ru: "45", us: "11", cm: "27.9" },
		"46": { ru: "46", us: "11.5", cm: "28.3" },
		"46 2/3": { ru: "46.5", us: "12", cm: "28.7" },
		"47 1/3": { ru: "47", us: "12.5", cm: "29.1" },
		"48": { ru: "48", us: "13", cm: "29.5" },
	},
	newbalance: {
		"36": { ru: "36", us: "4", cm: "22.0" },
		"37": { ru: "37", us: "4.5", cm: "22.5" },
		"37.5": { ru: "37.5", us: "5", cm: "23.0" },
		"38": { ru: "38", us: "5.5", cm: "23.5" },
		"39": { ru: "39", us: "6", cm: "24.0" },
		"40": { ru: "40", us: "6.5", cm: "24.5" },
		"40.5": { ru: "40.5", us: "7", cm: "25.0" },
		"41.5": { ru: "41.5", us: "7.5", cm: "25.5" },
		"42": { ru: "42", us: "8", cm: "26.0" },
		"42.5": { ru: "42.5", us: "8.5", cm: "26.5" },
		"43": { ru: "43", us: "9", cm: "27.0" },
		"44": { ru: "44", us: "9.5", cm: "27.5" },
		"44.5": { ru: "44.5", us: "10", cm: "28.0" },
		"45": { ru: "45", us: "10.5", cm: "28.5" },
		"45.5": { ru: "45.5", us: "11", cm: "29.0" },
		"46.5": { ru: "46.5", us: "11.5", cm: "29.5" },
		"47": { ru: "47", us: "12", cm: "30.0" },
		"47.5": { ru: "47.5", us: "12.5", cm: "30.5" },
		"49": { ru: "49", us: "13.5", cm: "31.5" },
	},
	onrunning: {
		"36": { ru: "36", us: "5", cm: "22.0" },
		"37": { ru: "37", us: "5.5", cm: "22.5" },
		"37.5": { ru: "37.5", us: "6", cm: "23.0" },
		"38": { ru: "38", us: "6.5", cm: "23.5" },
		"39": { ru: "39", us: "7", cm: "24.0" },
		"40": { ru: "40", us: "7.5", cm: "24.5" },
		"40.5": { ru: "40.5", us: "8", cm: "25.0" },
		"41": { ru: "41", us: "8.5", cm: "25.5" },
		"42": { ru: "42", us: "9", cm: "26.0" },
		"42.5": { ru: "42.5", us: "9.5", cm: "26.5" },
		"43": { ru: "43", us: "10", cm: "27.0" },
		"44": { ru: "44", us: "10.5", cm: "27.5" },
		"44.5": { ru: "44.5", us: "11", cm: "28.0" },
		"45": { ru: "45", us: "11.5", cm: "28.5" },
		"46": { ru: "46", us: "12", cm: "29.0" },
		"47": { ru: "47", us: "13", cm: "30.0" },
	},
};

export default function ProductPage() {
	const { user } = useAuth();
	const router = useRouter();
	const params = useParams();
	const id = params.id as string;

	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [recommended, setRecommended] = useState<Product[]>([]);
	const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
	const [selectedImage, setSelectedImage] = useState(0);
	const [sizeModal, setSizeModal] = useState(false);
	const [imageModal, setImageModal] = useState(false);
	const [addingToCart, setAddingToCart] = useState(false);
	const [cartMessage, setCartMessage] = useState("");
	const [cartQuantity, setCartQuantity] = useState(0);
	const [sizeTab, setSizeTab] = useState<"eu" | "ru" | "us" | "cm">("eu");
	const [isFavorited, setIsFavorited] = useState(false);
	const [quickOrderOpen, setQuickOrderOpen] = useState(false);
	const [quickForm, setQuickForm] = useState({
		name: "",
		email: "",
		phone: "",
		messenger: "telegram",
		telegramNick: "",
	});
	const [quickSubmitting, setQuickSubmitting] = useState(false);
	const [quickError, setQuickError] = useState("");
	const [quickSuccess, setQuickSuccess] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const [favSizeModal, setFavSizeModal] = useState(false);
	const [favSize, setFavSize] = useState<string>("");
	const [authModal, setAuthModal] = useState(false);

	const addToFavoritesWithSize = () => {
		if (!product || !favSize) return;
		const saved = localStorage.getItem("favorites");
		let favs: any[] = saved ? JSON.parse(saved) : [];
		const exists = favs.find(
			(f: any) => f.id === product.id && f.size === favSize,
		);
		if (!exists) {
			favs.push({
				id: product.id,
				name: product.name,
				price: product.price,
				images: product.images,
				image: product.images?.[0] || null,
				type: product.type,
				gender: product.gender,
				skus: product.skus,
				itemNumber: product.itemNumber,
				size: favSize,
			});
			localStorage.setItem("favorites", JSON.stringify(favs));
			window.dispatchEvent(new Event("favoritesUpdated"));
		}
		setFavSizeModal(false);
		setFavSize("");
		setIsFavorited(true);
	};

	useEffect(() => {
		if (user && quickOrderOpen) {
			setQuickForm({
				name: user.name || "",
				email: user.email || "",
				phone: user.phone || "",
				messenger: "telegram",
				telegramNick: quickForm.telegramNick
					? `@${quickForm.telegramNick}`
					: "",
			});
		}
	}, [user, quickOrderOpen]);

	const getBrandChart = (brand?: string) => {
		const b = (brand || "").toLowerCase();
		if (b.includes("nike") || b.includes("jordan")) return SIZE_CHARTS.nike;
		if (b.includes("yeezy") || b.includes("adidas")) return SIZE_CHARTS.adidas;
		if (b.includes("new balance") || b.includes("nb"))
			return SIZE_CHARTS.newbalance;
		if (b.includes("on") || b.includes("on running"))
			return SIZE_CHARTS.onrunning;
		return SIZE_CHARTS.nike;
	};

	const chart = getBrandChart(product?.brand);

	useEffect(() => {
		if (selectedSku) fetchCartQuantity();
	}, [selectedSku]);

	const fetchCartQuantity = async () => {
		try {
			const { data } = await api.get("/cart");
			const items = data.data?.items || [];
			const item = items.find((i: any) => i.skuId === selectedSku?.id);
			setCartQuantity(item?.quantity || 0);
		} catch {
			setCartQuantity(0);
		}
	};

	const updateCartQuantity = async (delta: number) => {
		const newQty = cartQuantity + delta;
		if (newQty < 0 || !selectedSku) return;
		if (newQty > selectedSku.stock) {
			setCartMessage("Недостаточно товара. Доступно: " + selectedSku.stock);
			setTimeout(() => setCartMessage(""), 2000);
			return;
		}
		setAddingToCart(true);
		setCartMessage("");
		try {
			if (newQty === 0) {
				const { data } = await api.get("/cart");
				const items = data.data?.items || [];
				const item = items.find((i: any) => i.skuId === selectedSku.id);
				if (item) await api.delete(`/cart/${item.id}`);
			} else if (cartQuantity === 0) {
				await api.post("/cart", { skuId: selectedSku.id, quantity: 1 });
			} else {
				const { data } = await api.get("/cart");
				const items = data.data?.items || [];
				const item = items.find((i: any) => i.skuId === selectedSku.id);
				if (item) await api.put(`/cart/${item.id}`, { quantity: newQty });
			}
			setCartQuantity(newQty);
			window.dispatchEvent(new Event("cartUpdated"));
		} catch (err: any) {
			setCartMessage(err.response?.data?.error || "Ошибка");
		} finally {
			setAddingToCart(false);
		}
	};

	useEffect(() => {
		fetchProduct();
		fetchRecommended();
	}, [id]);

	const fetchProduct = async () => {
		try {
			const { data } = await api.get(`/products/${id}`);
			const p = data.data;
			setProduct(p);
			if (p.skus?.length > 0) setSelectedSku(p.skus[0]);
		} catch {
			setProduct(null);
		} finally {
			setLoading(false);
		}
	};

	// 5. Рандомные рекомендации: 2 женские + 2 мужские
	const fetchRecommended = async () => {
		try {
			const { data: women } = await api.get(
				"/products?gender=Women&pageSize=2&sortBy=createdAt&order=desc",
			);
			const { data: men } = await api.get(
				"/products?gender=Men&pageSize=2&sortBy=createdAt&order=desc",
			);
			const all = [...(women.data || []), ...(men.data || [])].sort(
				() => Math.random() - 0.5,
			);
			setRecommended(all);
		} catch {}
	};

	const formatDate = (date?: string) => {
		if (!date) return "—";
		return new Date(date).toLocaleDateString("ru-RU", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const genderLabels: Record<string, string> = {
		Men: "Мужской",
		Women: "Женский",
		Unisex: "Унисекс",
	};
	const seasonLabels: Record<string, string> = {
		summer: "Лето",
		winter: "Зима",
		demi: "Межсезонье",
		all: "Круглый год",
	};

	const prevImage = () => {
		if (product?.images?.length)
			setSelectedImage(
				(prev) => (prev - 1 + product.images.length) % product.images.length,
			);
	};
	const nextImage = () => {
		if (product?.images?.length)
			setSelectedImage((prev) => (prev + 1) % product.images.length);
	};

	const toggleFavoriteProduct = () => {
		if (!product) return;
		const saved = localStorage.getItem("favorites");
		let favs: any[] = saved ? JSON.parse(saved) : [];
		const exists = favs.find((f: any) => f.id === product.id);
		if (exists) favs = favs.filter((f: any) => f.id !== product.id);
		else
			favs.push({
				id: product.id,
				name: product.name,
				price: product.price,
				images: product.images,
				image: product.images?.[0] || null,
				type: product.type,
				gender: product.gender,
				skus: product.skus,
				itemNumber: product.itemNumber,
			});
		localStorage.setItem("favorites", JSON.stringify(favs));
		window.dispatchEvent(new Event("favoritesUpdated"));
		setIsFavorited(!exists);
	};

	useEffect(() => {
		const saved = localStorage.getItem("favorites");
		if (saved) {
			try {
				setIsFavorited(JSON.parse(saved).some((f: any) => f.id === id));
			} catch {}
		}
	}, [id]);

	if (loading) {
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

	if (!product) {
		return (
			<main className="pt-16 min-h-screen flex flex-col">
				<Header />
				<div className="flex-1 flex flex-col items-center justify-center text-gray-400">
					<p className="text-lg font-bold uppercase">Товар не найден</p>
					<Link
						href="/catalog"
						className="mt-4 text-primary font-bold text-sm hover:underline">
						Вернуться в каталог
					</Link>
				</div>
				<Footer />
			</main>
		);
	}

	return (
		<main className="pt-16 min-h-screen flex flex-col">
			<Header />
			<div className="flex-1">
				<div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
					{/* 3. Кнопка назад для мобилки */}
					<button
						onClick={() => router.back()}
						className="md:hidden flex items-center gap-1 text-sm text-gray-400 mb-4 hover:text-black transition">
						<span className="text-lg">&#8249;</span> Назад
					</button>

					<div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
						<div className="md:col-span-7 space-y-4">
							<div
								className="relative aspect-[4/3] bg-gray-50 overflow-hidden rounded-2xl flex items-center justify-center cursor-pointer"
								onClick={() => setImageModal(true)}>
								{product.images?.length > 0 ? (
									<img
										src={product.images[selectedImage]}
										alt={product.name}
										className="w-full h-full object-contain rounded-2xl border border-gray-100"
									/>
								) : (
									<div className="text-gray-400 text-lg">{product.name}</div>
								)}
								{product.images?.length > 1 && (
									<>
										<button
											onClick={(e) => {
												e.stopPropagation();
												prevImage();
											}}
											className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition cursor-pointer">
											&#8249;
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												nextImage();
											}}
											className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition cursor-pointer">
											&#8250;
										</button>
									</>
								)}
							</div>
							{product.images?.length > 1 && (
								<div className="grid grid-cols-5 gap-3">
									{product.images.map((img, i) => (
										<button
											key={i}
											onClick={() => setSelectedImage(i)}
											className={`aspect-square bg-gray-50 rounded-xl overflow-hidden p-2 transition border-2 ${i === selectedImage ? "border-primary" : "border-gray-100 opacity-60 hover:opacity-100"}`}>
											<img
												src={img}
												alt=""
												className="w-full h-full object-contain rounded-lg"
											/>
										</button>
									))}
								</div>
							)}
						</div>

						<div className="md:col-span-5 space-y-6">
							<div className="flex flex-col items-end text-right">
								<div
									className="text-2xl font-extrabold"
									style={{ fontFamily: "Montserrat, sans-serif" }}>
									{selectedSku
										? selectedSku.price.toLocaleString()
										: product.skus?.[0]?.price?.toLocaleString()}{" "}
									RUB
								</div>
							</div>

							<div className="space-y-1">
								<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
									{product.type}
								</p>
								<h1
									className="text-2xl md:text-3xl font-extrabold uppercase"
									style={{ fontFamily: "Montserrat, sans-serif" }}>
									{product.name}
								</h1>
								<p className="text-[10px] text-gray-400 font-bold">
									АРТИКУЛ: {product.itemNumber}
								</p>
							</div>

							{product.skus?.length > 0 && (
								<div className="pt-4 max-w-md">
									{product.type !== "Clothing" ? (
										<>
											<div className="flex items-center mb-3">
												<button
													onClick={() => setSizeModal(true)}
													className="text-xs font-bold text-primary bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg uppercase transition cursor-pointer">
													Таблица размеров
												</button>
											</div>
											<div className="w-full grid grid-cols-2 md:flex md:justify-between mb-3">
												{(["eu", "ru", "us", "cm"] as const).map((tab) => (
													<button
														key={tab}
														onClick={() => setSizeTab(tab)}
														className={`text-xs font-bold uppercase py-2 transition cursor-pointer text-center whitespace-nowrap border-b-2 ${sizeTab === tab ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
														{tab === "eu"
															? "Размеры EU"
															: tab === "ru"
																? "Размеры RU"
																: tab === "us"
																	? "Размеры US"
																	: "Длина стопы, СМ"}
													</button>
												))}
											</div>
											<div className="grid grid-cols-4 gap-2">
												{product.skus.map((sku) => {
													const eu = sku.size;
													const ru = chart[eu]?.ru || eu;
													const us = chart[eu]?.us || eu;
													const cm = chart[eu]?.cm || eu;
													const displaySize =
														sizeTab === "eu"
															? eu
															: sizeTab === "ru"
																? ru
																: sizeTab === "us"
																	? us
																	: cm;
													const suffix =
														sizeTab === "eu"
															? "EU"
															: sizeTab === "ru"
																? "RU"
																: sizeTab === "us"
																	? "US"
																	: "СМ";
													return (
														<button
															key={sku.id}
															onClick={() => setSelectedSku(sku)}
															disabled={sku.stock === 0}
															className={`flex flex-col items-center justify-center py-3 transition cursor-pointer text-xs font-bold rounded-lg ${selectedSku?.id === sku.id ? "bg-black text-white" : sku.stock === 0 ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "border border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
															<span>
																{displaySize} {suffix}
															</span>
															<span className="text-[10px] opacity-70 mt-0.5">
																{sku.price.toLocaleString()} RUB
															</span>
															{sku.stock === 0 && (
																<span className="text-[8px] opacity-50">
																	Нет
																</span>
															)}
														</button>
													);
												})}
											</div>
										</>
									) : (
										/* Одежда — только размеры без вкладок */
										<>
											<h3 className="text-xs font-bold uppercase text-gray-500 mb-3">
												Размеры
											</h3>
											<div className="grid grid-cols-4 gap-2">
												{product.skus.map((sku) => (
													<button
														key={sku.id}
														onClick={() => setSelectedSku(sku)}
														disabled={sku.stock === 0}
														className={`flex flex-col items-center justify-center py-3 transition cursor-pointer text-xs font-bold rounded-lg ${selectedSku?.id === sku.id ? "bg-black text-white" : sku.stock === 0 ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "border border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
														<span>{sku.size}</span>
														<span className="text-[10px] opacity-70 mt-0.5">
															{sku.price.toLocaleString()} RUB
														</span>
														{sku.stock === 0 && (
															<span className="text-[8px] opacity-50">Нет</span>
														)}
													</button>
												))}
											</div>
										</>
									)}
								</div>
							)}

							<div className="space-y-3 pt-2">
								{cartQuantity > 0 ? (
									<div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-200">
										<button
											onClick={() => updateCartQuantity(-1)}
											disabled={addingToCart}
											className="w-12 h-10 flex items-center justify-center text-lg font-bold text-gray-500 hover:text-black transition cursor-pointer">
											−
										</button>
										<span className="text-sm font-bold">
											{cartQuantity} шт.
										</span>
										<button
											onClick={() => updateCartQuantity(1)}
											disabled={
												addingToCart ||
												(selectedSku
													? cartQuantity >= selectedSku.stock
													: false)
											}
											className="w-12 h-10 flex items-center justify-center text-lg font-bold text-gray-500 hover:text-black transition cursor-pointer disabled:opacity-30">
											+
										</button>
									</div>
								) : (
									<button
										onClick={() => {
											if (!user) {
												setAuthModal(true);
											} else {
												updateCartQuantity(1);
											}
										}}
										disabled={
											!selectedSku || selectedSku.stock === 0 || addingToCart
										}
										className="w-full bg-primary text-white py-4 text-sm font-bold uppercase tracking-wider rounded-xl hover:opacity-90 disabled:opacity-30 transition cursor-pointer">
										{addingToCart ? "Добавление..." : "ДОБАВИТЬ В КОРЗИНУ"}
									</button>
								)}
								{cartMessage && (
									<p
										className={`text-xs text-center font-bold ${cartMessage.includes("Ошибка") || cartMessage.includes("Недостаточно") ? "text-red-500" : "text-green-500"}`}>
										{cartMessage}
									</p>
								)}
								<button
									onClick={() => setFavSizeModal(true)}
									disabled={!selectedSku || selectedSku.stock === 0}
									className={`w-full border py-4 text-sm font-bold uppercase tracking-wider rounded-xl transition disabled:opacity-30 cursor-pointer ${isFavorited ? "border-red-200 text-red-500 bg-red-50 hover:bg-red-100" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
									{isFavorited ? "В ИЗБРАННОМ" : "В ИЗБРАННОЕ"}
								</button>

								<div
									className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${favSizeModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
									onClick={() => setFavSizeModal(false)}>
									<div className="absolute inset-0 bg-black/40" />
									<div
										className={`relative bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl transition-all duration-300 ${favSizeModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
										onClick={(e) => e.stopPropagation()}>
										<div className="flex justify-between items-center mb-4">
											<h3
												className="text-lg font-extrabold uppercase"
												style={{ fontFamily: "Montserrat, sans-serif" }}>
												Выберите размер
											</h3>
											<button
												onClick={() => setFavSizeModal(false)}
												className="text-2xl text-gray-400 hover:text-black transition">
												&#10005;
											</button>
										</div>
										<div className="grid grid-cols-4 gap-2 mb-4">
											{product?.skus?.map((sku) => (
												<button
													key={sku.id}
													onClick={() => setFavSize(sku.size)}
													className={`py-2 text-xs font-bold uppercase rounded-lg border transition cursor-pointer ${
														favSize === sku.size
															? "bg-black text-white border-black"
															: "border-gray-200 text-gray-500 hover:border-gray-400"
													}`}>
													{sku.size}
													{product.type !== "Clothing" ? " US" : ""}
												</button>
											))}
										</div>
										<button
											onClick={addToFavoritesWithSize}
											disabled={!favSize}
											className="w-full py-2.5 bg-primary text-white text-sm font-bold uppercase rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer">
											Добавить в избранное
										</button>
									</div>
								</div>

								<button
									onClick={() => setQuickOrderOpen(true)}
									disabled={!selectedSku || selectedSku.stock === 0}
									className="w-full border-2 border-[#007FFF] text-[#007FFF] py-4 text-sm font-bold disabled:opacity-30 uppercase tracking-wider rounded-xl hover:bg-[#007FFF] hover:text-white transition cursor-pointer">
									БЫСТРЫЙ ЗАКАЗ
								</button>
							</div>

							<p className="text-xs text-gray-400 text-center pt-2">
								Мы будем рады проконсультировать в мессенджерах:{" "}
								<a href="#" className="text-primary font-bold underline">
									WhatsApp
								</a>{" "}
								или{" "}
								<a href="#" className="text-primary font-bold underline">
									Telegram
								</a>
								.
							</p>

							{product.description && (
								<div className="border-t border-gray-100 pt-6">
									<p className="text-sm text-gray-500 leading-relaxed">
										{product.description}
									</p>
								</div>
							)}

							{/* 4. Параметры без ссылок */}
							<div className="border-t border-gray-100 pt-6 space-y-2">
								<h3 className="text-xs font-bold uppercase text-gray-500 mb-3">
									ХАРАКТЕРИСТИКИ
								</h3>
								<div className="text-sm space-y-1.5">
									<div className="flex justify-between">
										<span className="text-gray-400">Номер серии:</span>
										<span className="font-bold">{product.itemNumber}</span>
									</div>
									{product.dropDate && (
										<div className="flex justify-between">
											<span className="text-gray-400">Дата дропа:</span>
											<span className="font-bold">
												{formatDate(product.dropDate)}
											</span>
										</div>
									)}
									<div className="flex justify-between">
										<span className="text-gray-400">Выпущено моделей:</span>
										<span className="font-bold">
											{product.totalModels.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-400">Пол:</span>
										<span className="font-bold">
											{genderLabels[product.gender] || product.gender}
										</span>
									</div>
									{product.color && (
										<div className="flex justify-between">
											<span className="text-gray-400">Цвет:</span>
											<span className="font-bold">{product.color}</span>
										</div>
									)}
									{product.brand && (
										<div className="flex justify-between">
											<span className="text-gray-400">Бренд:</span>
											<span className="font-bold">{product.brand}</span>
										</div>
									)}
									{product.series && (
										<div className="flex justify-between">
											<span className="text-gray-400">Серия:</span>
											<span className="font-bold">{product.series}</span>
										</div>
									)}
									{product.season && (
										<div className="flex justify-between">
											<span className="text-gray-400">Сезон:</span>
											<span className="font-bold">
												{seasonLabels[product.season] || product.season}
											</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{recommended.length > 0 && (
						<section className="mt-16 border-t border-gray-100 pt-12">
							<h2
								className="text-2xl md:text-3xl font-extrabold uppercase mb-8"
								style={{ fontFamily: "Montserrat, sans-serif" }}>
								ДОПОЛНИТЕ ОБРАЗ
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
								{recommended.map((rec: any) => (
									<Link
										key={rec.id}
										href={`/product/${rec.id}`}
										className="group cursor-pointer block">
										<div className="aspect-square bg-gray-50 overflow-hidden border border-gray-100 rounded-xl flex items-center justify-center p-4 group-hover:border-gray-300 transition">
											{rec.images?.[0] ? (
												<img
													src={rec.images[0]}
													alt={rec.name}
													className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-500"
												/>
											) : (
												<div className="text-gray-400 text-xs text-center">
													{rec.name}
												</div>
											)}
										</div>
										<div className="mt-3">
											<p className="text-[11px] font-bold uppercase text-gray-800 group-hover:text-primary transition">
												{rec.name}
											</p>
											<p className="text-[11px] text-gray-400 font-bold">
												от {(rec.price || 0).toLocaleString()} RUB
											</p>
										</div>
									</Link>
								))}
							</div>
						</section>
					)}
				</div>
			</div>

			{/* Модалка таблицы размеров */}
			{sizeModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
					onClick={() => setSizeModal(false)}>
					<div className="absolute inset-0 bg-black/40" />
					<div
						className="relative bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full mx-4 shadow-xl"
						onClick={(e) => e.stopPropagation()}>
						<div className="flex justify-between items-center mb-6">
							<h3
								className="text-lg font-extrabold uppercase"
								style={{ fontFamily: "Montserrat, sans-serif" }}>
								Таблица размеров
							</h3>
							<button
								onClick={() => setSizeModal(false)}
								className="text-2xl text-gray-400 hover:text-primary transition cursor-pointer">
								&#10005;
							</button>
						</div>
						<div
							className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0"
							onClick={(e) => e.stopPropagation()}>
							<table className="w-full text-xs text-center min-w-[400px]">
								<thead>
									<tr className="border-b border-gray-100 text-gray-400 font-bold uppercase">
										<th className="py-2 px-3">EU</th>
										<th className="py-2 px-3">RU</th>
										<th className="py-2 px-3">US</th>
										<th className="py-2 px-3">UK</th>
										<th className="py-2 px-3">Длина стопы (см)</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50">
									{[
										["36", "36", "4", "3.5", "22.5"],
										["36.5", "36.5", "4.5", "4", "23.0"],
										["37.5", "37.5", "5", "4.5", "23.5"],
										["38", "38", "5.5", "5", "24.0"],
										["38.5", "38.5", "6", "5.5", "24.5"],
										["39", "39", "6.5", "6", "25.0"],
										["40", "40", "7", "6.5", "25.5"],
										["40.5", "40.5", "7.5", "7", "26.0"],
										["41", "41", "8", "7.5", "26.5"],
										["42", "42", "8.5", "8", "27.0"],
										["42.5", "42.5", "9", "8.5", "27.5"],
										["43", "43", "9.5", "9", "28.0"],
										["44", "44", "10", "9.5", "28.5"],
										["44.5", "44.5", "10.5", "10", "29.0"],
										["45", "45", "11", "10.5", "29.5"],
										["45.5", "45.5", "11.5", "11", "30.0"],
										["46", "46", "12", "11.5", "30.5"],
										["47", "47", "13", "12.5", "31.5"],
										["47.5", "47.5", "13.5", "13", "32.0"],
										["48", "48", "14", "13.5", "32.5"],
										["49", "49", "15", "14.5", "33.5"],
									].map((row, i) => (
										<tr key={i} className="hover:bg-gray-50">
											<td className="py-2 px-3 font-bold">{row[0]}</td>
											<td className="py-2 px-3">{row[1]}</td>
											<td className="py-2 px-3">{row[2]}</td>
											<td className="py-2 px-3">{row[3]}</td>
											<td className="py-2 px-3">{row[4]}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* Модалка фото */}
			{imageModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
					onClick={() => setImageModal(false)}>
					<div className="absolute inset-0 bg-black/80" />
					<div
						className="relative w-full max-w-4xl mx-4"
						onClick={(e) => e.stopPropagation()}>
						{product.images?.length > 0 && (
							<img
								src={product.images[selectedImage]}
								alt={product.name}
								className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
							/>
						)}
						{product.images?.length > 1 && (
							<>
								<button
									onClick={prevImage}
									className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition cursor-pointer text-xl">
									&#8249;
								</button>
								<button
									onClick={nextImage}
									className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition cursor-pointer text-xl">
									&#8250;
								</button>
							</>
						)}
						<button
							onClick={() => setImageModal(false)}
							className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 transition cursor-pointer">
							&#10005;
						</button>
					</div>
				</div>
			)}

			<Footer />
			{/* Быстрый заказ Aside */}
			<div
				className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${quickOrderOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
				onClick={() => setQuickOrderOpen(false)}>
				<div className="absolute inset-0 bg-black/60" />
				<div
					className={`relative w-full max-w-[300px] bg-white h-full overflow-y-auto shadow-xl p-6 transition-transform duration-300 ease-out ${quickOrderOpen ? "translate-x-0" : "translate-x-full"}`}
					onClick={(e) => e.stopPropagation()}>
					<div className="flex justify-between items-center mb-6">
						<h2
							className="text-lg font-extrabold uppercase"
							style={{ fontFamily: "Montserrat, sans-serif" }}>
							Быстрый заказ
						</h2>
						<button
							onClick={() => setQuickOrderOpen(false)}
							className="text-2xl text-gray-400 hover:text-black transition">
							&#10005;
						</button>
					</div>

					{quickSuccess ? (
						<div className="text-center py-8">
							<div className="text-4xl mb-4">&#10003;</div>
							<p className="text-lg font-bold mb-2">Заказ оформлен!</p>
							<p className="text-gray-500 text-sm">
								Мы свяжемся с вами в ближайшее время.
							</p>
							<button
								onClick={() => {
									setQuickOrderOpen(false);
									setQuickSuccess(false);
								}}
								className="mt-6 text-primary font-bold text-sm hover:underline">
								Закрыть
							</button>
						</div>
					) : (
						<>
							{/* Товар */}
							<div className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-6">
								<div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
									{product.images?.[0] && (
										<img
											src={product.images[0]}
											alt=""
											className="w-full h-full object-contain"
										/>
									)}
								</div>
								<div>
									<p className="font-bold text-sm">{product.name}</p>
									<p className="text-xs text-gray-400">
										Размер: {selectedSku?.size || "—"}{" "}
										{product.type !== "Clothing" ? "US" : ""}
									</p>
									<p className="font-bold text-primary mt-1">
										{selectedSku?.price?.toLocaleString() ||
											product.skus?.[0]?.price?.toLocaleString()}{" "}
										RUB
									</p>
								</div>
							</div>

							{quickError && (
								<div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs text-center mb-4">
									{quickError}
								</div>
							)}

							<form
								onSubmit={async (e) => {
									e.preventDefault();
									if (!quickForm.name || !quickForm.phone || !selectedSku) {
										setQuickError("Заполните имя и телефон");
										return;
									}
									setQuickSubmitting(true);
									setQuickError("");
									try {
										await api.post("/orders/quick", {
											skuId: selectedSku.id,
											quantity: 1,
											...quickForm,
										});
										setQuickSuccess(true);
										window.dispatchEvent(new Event("cartUpdated"));
									} catch (err: any) {
										setQuickError(err.response?.data?.error || "Ошибка");
									} finally {
										setQuickSubmitting(false);
									}
								}}
								className="space-y-4">
								<div>
									<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
										Имя *
									</label>
									<input
										className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
										value={quickForm.name}
										onChange={(e) =>
											setQuickForm({ ...quickForm, name: e.target.value })
										}
										required
									/>
								</div>
								<div>
									<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
										Телефон *
									</label>
									<input
										className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
										type="tel"
										value={quickForm.phone}
										onChange={(e) =>
											setQuickForm({ ...quickForm, phone: e.target.value })
										}
										required
									/>
								</div>
								{!user && (
									<div>
										<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
											Email
										</label>
										<input
											className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
											type="email"
											value={quickForm.email}
											onChange={(e) =>
												setQuickForm({ ...quickForm, email: e.target.value })
											}
										/>
									</div>
								)}
								<div>
									<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
										Способ связи
									</label>
									<div className="grid grid-cols-2 gap-2">
										{["telegram", "whatsapp"].map((m) => (
											<button
												key={m}
												type="button"
												onClick={() =>
													setQuickForm({ ...quickForm, messenger: m })
												}
												className={`py-2 text-xs font-bold uppercase rounded-lg border transition ${quickForm.messenger === m ? "border-primary bg-blue-50 text-primary" : "border-gray-200 text-gray-500"}`}>
												{m === "telegram" ? "Telegram" : "WhatsApp"}
											</button>
										))}
									</div>
								</div>
								{quickForm.messenger === "telegram" && (
									<div>
										<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
											Никнейм в Telegram
										</label>
										<div className="relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
												@
											</span>
											<input
												className="w-full border border-gray-200 rounded-lg p-2.5 pl-8 text-sm"
												placeholder="username"
												value={quickForm.telegramNick}
												onChange={(e) => {
													let val = e.target.value.replace(/^@/, "");
													setQuickForm({ ...quickForm, telegramNick: val });
												}}
											/>
										</div>
									</div>
								)}
								<label className="flex items-start gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={agreed}
										onChange={(e) => setAgreed(e.target.checked)}
										className="w-4 h-4 mt-0.5 text-primary focus:ring-primary border-gray-300 cursor-pointer"
									/>
									<span className="flex align-center text-xs text-gray-400">
										<p>Согласен с </p>
										<a
											href="#"
											target="_blank"
											className="text-primary hover:underline">
											персональными данными
										</a>
									</span>
								</label>
								<button
									type="submit"
									disabled={quickSubmitting || !selectedSku}
									className="w-full py-3 bg-primary text-white text-sm font-bold uppercase rounded-lg hover:opacity-90 disabled:opacity-50 transition">
									{quickSubmitting ? "Оформление..." : "Оформить заказ"}
								</button>
							</form>
						</>
					)}
				</div>
			</div>
			<div
				className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${authModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
				onClick={() => setAuthModal(false)}>
				<div className="absolute inset-0 bg-black/40" />
				<div
					className={`relative bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl transition-all duration-300 ${authModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
					onClick={(e) => e.stopPropagation()}>
					<h3
						className="text-lg font-extrabold uppercase mb-4"
						style={{ fontFamily: "Montserrat, sans-serif" }}>
						Добавление в корзину
					</h3>

					{/* Товар */}
					<div className="flex gap-3 p-3 bg-gray-50 rounded-xl mb-4">
						<div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
							{product?.images?.[0] && (
								<img
									src={product.images[0]}
									alt=""
									className="w-full h-full object-contain"
								/>
							)}
						</div>
						<div>
							<p className="font-bold text-sm">{product?.name}</p>
							<p className="text-xs text-gray-400">
								Размер: {selectedSku?.size || "—"}{" "}
								{product?.type !== "Clothing" ? "US" : ""}
							</p>
							<p className="font-bold text-primary text-sm mt-0.5">
								{selectedSku?.price?.toLocaleString()} RUB
							</p>
						</div>
					</div>

					<div className="flex gap-3">
						<button
							onClick={() => {
								setAuthModal(false);
								router.push(
									"/login?redirect=" +
										encodeURIComponent(window.location.pathname),
								);
							}}
							className="flex-1 py-3 bg-primary text-white text-sm font-bold uppercase rounded-xl hover:opacity-90 transition cursor-pointer">
							Авторизоваться
						</button>
						<button
							onClick={() => {
								setAuthModal(false);
								setQuickOrderOpen(true);
							}}
							className="flex-1 py-3 border-2 border-[#007FFF] text-[#007FFF] text-sm font-bold uppercase rounded-xl hover:bg-[#007FFF] hover:text-white transition cursor-pointer">
							Быстрый заказ
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
