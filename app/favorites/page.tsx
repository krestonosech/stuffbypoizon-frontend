"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../lib/auth-context";
import api from "../../lib/api";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
	const { user } = useAuth();
	const [favorites, setFavorites] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [cartSkuIds, setCartSkuIds] = useState<string[]>([]);
	const [toast, setToast] = useState<string | null>(null);
	const [toastVisible, setToastVisible] = useState(false);
	const [selected, setSelected] = useState<string[]>([]);
	const router = useRouter();

	const toggleSelect = (id: string) => {
		setSelected((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
		);
	};

	const toggleAll = () => {
		if (selected.length === favorites.length) setSelected([]);
		else setSelected(favorites.map((f) => f.id));
	};

	const addSelectedToCart = async () => {
		if (!user) {
			router.push("/login?redirect=/favorites");
			return;
		}
		let count = 0;
		for (const item of favorites) {
			if (selected.includes(item.id) && item.skus?.[0]) {
				try {
					await api.post("/cart", { skuId: item.skus[0].id, quantity: 1 });
					count++;
				} catch {}
			}
		}
		window.dispatchEvent(new Event("cartUpdated"));
		showToast(`Добавлено: ${count} товаров`);
	};

	useEffect(() => {
		loadFavorites();
		if (user) fetchCartSkuIds();
	}, [user]);

	const loadFavorites = () => {
		const saved = localStorage.getItem("favorites");
		if (saved) {
			try {
				setFavorites(JSON.parse(saved));
			} catch {}
		}
		setLoading(false);
	};

	const saveFavorites = (items: any[]) => {
		setFavorites(items);
		localStorage.setItem("favorites", JSON.stringify(items));
		window.dispatchEvent(new Event("favoritesUpdated"));
	};

	const fetchCartSkuIds = async () => {
		try {
			const { data } = await api.get("/cart");
			setCartSkuIds(data.data?.items?.map((i: any) => i.skuId) || []);
		} catch {
			setCartSkuIds([]);
		}
	};

	const removeItem = (id: string) => {
		saveFavorites(favorites.filter((f) => f.id !== id));
		showToast("Удалено из избранного");
	};

	const addAllToCart = async () => {
		if (!user) {
			router.push("/login?redirect=/favorites");
			return;
		}
		let count = 0;
		for (const item of favorites) {
			try {
				if (item.skus?.[0]) {
					await api.post("/cart", { skuId: item.skus[0].id, quantity: 1 });
					count++;
				}
			} catch {}
		}
		window.dispatchEvent(new Event("cartUpdated"));
		fetchCartSkuIds();
		showToast(`Добавлено: ${count} товаров`);
	};

	const clearAll = () => {
		saveFavorites([]);
		showToast("Список избранного очищен");
	};

	const showToast = (message: string) => {
		setToast(message);
		setToastVisible(true);
		setTimeout(() => setToastVisible(false), 2500);
		setTimeout(() => setToast(null), 3000);
	};

	const allInCart =
		favorites.length > 0 &&
		favorites.every((fav) => {
			const skuId = fav.skus?.[0]?.id;
			return skuId && cartSkuIds.includes(skuId);
		});

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

	return (
		<main className="pt-16 min-h-screen flex flex-col">
			<Header />
			<div className="flex-1">
				{toast && (
					<div
						className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-full shadow-lg text-sm font-bold transition-all duration-300 ${toastVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
						{toast}
					</div>
				)}

				<div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
					<header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
						<div>
							<h1
								className="text-2xl md:text-4xl font-extrabold uppercase"
								style={{ fontFamily: "Montserrat, sans-serif" }}>
								Избранное
							</h1>
							<div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
								<Link href="/" className="hover:text-primary">
									Главная
								</Link>
								<span>›</span>
								<span className="text-primary">Избранное</span>
							</div>
						</div>
						{favorites.length !== 0 && (
							<div className="flex flex-col md:flex-row items-start md:items-center gap-3">
								<label className="flex items-center gap-2 text-xs font-bold text-gray-400 cursor-pointer">
									<input
										type="checkbox"
										checked={
											selected.length === favorites.length &&
											favorites.length > 0
										}
										onChange={toggleAll}
										className="w-4 h-4 text-primary focus:ring-primary border-gray-300 cursor-pointer"
									/>
									Выбрать всё
								</label>
								<div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
									<button
										onClick={addSelectedToCart}
										disabled={selected.length === 0}
										className={`text-xs font-bold uppercase px-4 py-2 rounded-full transition cursor-pointer w-full md:w-auto text-center ${
											selected.length === 0
												? "bg-gray-100 text-gray-400 cursor-not-allowed"
												: "bg-primary text-white hover:opacity-90"
										}`}>
										В корзину ({selected.length})
									</button>
									<button
										onClick={addAllToCart}
										disabled={allInCart}
										className={`text-xs font-bold uppercase px-4 py-2 rounded-full transition cursor-pointer w-full md:w-auto text-center ${allInCart ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-primary text-white hover:opacity-90"}`}>
										{allInCart ? "Всё в корзине" : "Всё в корзину"}
									</button>
									<button
										onClick={clearAll}
										className="text-xs font-bold uppercase border border-gray-200 text-gray-500 px-4 py-2 rounded-full hover:bg-gray-50 transition cursor-pointer w-full md:w-auto text-center">
										Удалить всё
									</button>
								</div>
							</div>
						)}
					</header>

					{favorites.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20 text-center">
							<span className="text-6xl text-gray-200 mb-6">♡</span>
							<h2
								className="text-xl font-extrabold uppercase mb-4"
								style={{ fontFamily: "Montserrat, sans-serif" }}>
								Ваш список пуст
							</h2>
							<p className="text-gray-400 max-w-md mb-8">
								Добавляйте товары в избранное, чтобы не потерять их и следить за
								изменением цены.
							</p>
							<Link
								href="/catalog"
								className="bg-primary text-white px-8 py-3 rounded-full text-sm font-bold uppercase hover:opacity-90 transition">
								Перейти в каталог
							</Link>
						</div>
					) : (
						<div className="space-y-4">
							{favorites.map((product: any) => (
								<div key={product.id} className="flex gap-4 md:gap-6">
									<Link
										href={`/product/${product.id}`}
										className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center cursor-pointer">
										{product.images?.[0] ? (
											<img
												src={product.images[0]}
												alt={product.name}
												className="w-full h-full object-contain"
											/>
										) : product.image ? (
											<img
												src={product.image}
												alt={product.name}
												className="w-full h-full object-contain"
											/>
										) : (
											<div className="text-gray-400 text-xs text-center">
												{product.name}
											</div>
										)}
									</Link>
									<div className="flex-grow flex flex-col justify-between py-1">
										<div>
											<div className="flex gap-4 md:gap-6">
												<input
													type="checkbox"
													checked={selected.includes(product.id)}
													onChange={() => toggleSelect(product.id)}
													className="w-4 h-4 text-primary focus:ring-primary border-gray-300 cursor-pointer mt-1"
												/>
												<Link
													href={`/product/${product.id}`}
													className="text-sm md:text-lg font-bold uppercase tracking-tight hover:text-primary transition"
													style={{ fontFamily: "Montserrat, sans-serif" }}>
													{product.name}
												</Link>
												<button
													onClick={() => removeItem(product.id)}
													className="text-gray-400 hover:text-red-500 transition cursor-pointer text-lg">
													&times;
												</button>
											</div>
											<p className="text-[10px] font-bold text-gray-400 mt-1">
												{product.type || product.gender || "UNISEX"}
											</p>
										</div>
										<div className="flex justify-between items-end">
											<span className="text-sm font-bold">
												от{" "}
												{product.price?.toLocaleString?.() ||
													(product.skus?.length > 0
														? Math.min(
																...product.skus.map((s: any) => s.price),
															).toLocaleString()
														: "—")}{" "}
												RUB
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
			<Footer />
		</main>
	);
}
