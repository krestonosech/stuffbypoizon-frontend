"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import api from "../../lib/api";

const BRANDS = [
	"Nike",
	"Jordan",
	"Adidas",
	"Yeezy",
	"New Balance",
	"On Running",
	"Balenciaga",
	"Puma",
	"Travis Scott",
	"Essentials",
];

const SERIES_BY_BRAND: Record<string, string[]> = {
	Nike: [
		"Air Max",
		"Air Force 1",
		"Dunk Low",
		"Dunk High",
		"Air Jordan 1",
		"Air Jordan 3",
		"Air Jordan 4",
		"Air Jordan 11",
		"Blazer",
		"VaporMax",
		"React",
		"Pegasus",
		"ZoomX",
	],
	Jordan: [
		"Air Jordan 1",
		"Air Jordan 3",
		"Air Jordan 4",
		"Air Jordan 5",
		"Air Jordan 6",
		"Air Jordan 11",
		"Air Jordan 12",
	],
	Adidas: [
		"Samba",
		"Gazelle",
		"Campus",
		"Ultraboost",
		"NMD",
		"Forum",
		"Superstar",
		"Stan Smith",
	],
	Yeezy: [
		"Boost 350",
		"Boost 350 V2",
		"Boost 380",
		"Boost 700",
		"Foam Runner",
		"Slide",
		"500",
	],
	"New Balance": [
		"550",
		"574",
		"990",
		"991",
		"992",
		"993",
		"2002R",
		"1906R",
		"9060",
		"327",
	],
	"On Running": [
		"Cloud 5",
		"Cloudmonster",
		"Cloudnova",
		"Cloudswift",
		"Cloudrunner",
		"Cloudtilt",
		"Roger Advantage",
	],
	Balenciaga: ["Triple S", "Track", "Runner", "Speed", "3XL"],
	Puma: ["RS-X", "Suede", "Cali", "Mirage", "Slipstream"],
	"Travis Scott": [
		"Air Jordan 1",
		"Air Jordan 4",
		"Air Jordan 6",
		"Air Force 1",
		"Dunk Low",
		"Air Max 1",
	],
	Essentials: ["Hoodie", "Sweatshirt", "T-Shirt", "Shorts", "Sweatpants"],
};

const CLOTHING_CATEGORIES = [
	{ name: "Футболки", type: "Clothing", subtype: "Футболки" },
	{ name: "Кофты", type: "Clothing", subtype: "Кофты" },
	{ name: "Куртки", type: "Clothing", subtype: "Куртки" },
	{ name: "Шорты", type: "Clothing", subtype: "Шорты" },
	{ name: "Штаны", type: "Clothing", subtype: "Штаны" },
	{ name: "Платья", type: "Clothing", subtype: "Платья" },
	{ name: "Верхняя одежда", type: "Clothing", subtype: "Верхняя одежда" },
	{ name: "Носки", type: "Clothing", subtype: "Носки" },
];

const ACCESSORY_CATEGORIES = [
	{ name: "Очки", type: "Accessories", subtype: "Очки" },
	{ name: "Часы", type: "Accessories", subtype: "Часы" },
];

export default function Header() {
	const { user } = useAuth();
	const [menuOpen, setMenuOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [cartCount, setCartCount] = useState(0);
	const [favCount, setFavCount] = useState(0);
	const router = useRouter();
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

	const [expandedSneakers, setExpandedSneakers] = useState(false);
	const [expandedClothing, setExpandedClothing] = useState(false);
	const [expandedAccessories, setExpandedAccessories] = useState(false);
	const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [searchOpen, setSearchOpen] = useState(false);
	const searchTimeout = useRef<NodeJS.Timeout | null>(null);

	const handleSearchInput = (value: string) => {
		setSearchValue(value);
		if (searchTimeout.current) clearTimeout(searchTimeout.current);
		if (value.trim().length === 0) {
			setSearchResults([]);
			setSearchOpen(false);
			return;
		}
		searchTimeout.current = setTimeout(async () => {
			try {
				const { data } = await api.get(
					`/products?search=${encodeURIComponent(value)}&pageSize=10`,
				);
				setSearchResults(data.data || []);
				setSearchOpen(true);
			} catch {
				setSearchResults([]);
			}
		}, 300);
	};

	useEffect(() => {
		if (user) fetchCartCount();
		else setCartCount(0);
	}, [user]);
	useEffect(() => {
		updateFavCount();
		window.addEventListener("favoritesUpdated", updateFavCount);
		return () => window.removeEventListener("favoritesUpdated", updateFavCount);
	}, []);
	useEffect(() => {
		const onCartUpdate = () => fetchCartCount();
		window.addEventListener("cartUpdated", onCartUpdate);
		return () => window.removeEventListener("cartUpdated", onCartUpdate);
	}, []);

	const fetchCartCount = async () => {
		try {
			const { data } = await api.get("/cart");
			setCartCount(data.data?.itemsCount || 0);
		} catch {
			setCartCount(0);
		}
	};
	const updateFavCount = () => {
		const saved = localStorage.getItem("favorites");
		if (saved) {
			try {
				setFavCount(JSON.parse(saved).length);
			} catch {
				setFavCount(0);
			}
		} else setFavCount(0);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const t = searchValue.trim();
		router.push(t ? `/catalog?search=${encodeURIComponent(t)}` : "/catalog");
		setMobileSearchOpen(false);
	};

	const openMobileSearch = () => {
		setMobileSearchOpen(true);
		setTimeout(() => searchInputRef.current?.focus(), 100);
	};
	const closeMobileSearch = () => {
		setMobileSearchOpen(false);
		setSearchValue("");
	};

	const closeAll = () => {
		setMenuOpen(false);
		setExpandedSneakers(false);
		setExpandedClothing(false);
		setExpandedAccessories(false);
		setExpandedBrand(null);
	};

	return (
		<>
			<header className="fixed top-0 w-full z-50 bg-white border-b border-gray-100">
				{/* Десктоп */}
				<div className="hidden md:flex items-center justify-between h-14 md:h-16 px-3 md:px-16 max-w-[1440px] mx-auto gap-2 md:gap-4">
					<Link href="/" className="flex items-center shrink-0">
						<img
							src="/main-icon.jpg"
							alt="STUFFBYPOIZON"
							className="h-12 w-auto"
						/>
					</Link>
					<nav className="flex items-center gap-6 ml-6">
						<Link
							href="/catalog?type=Sneakers"
							className="text-xs font-bold uppercase text-gray-500 hover:text-black transition tracking-wider">
							Кроссовки
						</Link>
						<Link
							href="/catalog?type=Clothing"
							className="text-xs font-bold uppercase text-gray-500 hover:text-black transition tracking-wider">
							Одежда
						</Link>
						<Link
							href="/catalog?type=Accessories"
							className="text-xs font-bold uppercase text-gray-500 hover:text-black transition tracking-wider">
							Аксессуары
						</Link>
						{user?.role === "admin" && (
							<Link
								href="/admin"
								className="text-xs font-bold uppercase text-primary hover:text-black transition tracking-wider">
								Админ-панель
							</Link>
						)}
					</nav>
					<form
						onSubmit={handleSearch}
						className="flex-1 max-w-md mx-4 hidden md:block">
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
								&#8981;
							</span>
							<input
								className="w-full h-10 pl-10 pr-4 bg-white border-2 border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary transition placeholder:text-gray-400"
								placeholder="Поиск товаров..."
								type="text"
								value={searchValue}
								onChange={(e) => handleSearchInput(e.target.value)}
								onFocus={() => {
									if (searchResults.length > 0) setSearchOpen(true);
								}}
								onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
							/>
							{searchOpen && searchResults.length > 0 && (
								<div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-30 overflow-hidden max-h-[400px] overflow-y-auto">
									{searchResults.map((product: any) => (
										<Link
											key={product.id}
											href={`/product/${product.id}`}
											onClick={() => {
												setSearchOpen(false);
												setSearchValue("");
											}}
											className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer">
											<div className="w-10 h-10 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
												{product.images?.[0] ? (
													<img
														src={product.images[0]}
														alt=""
														className="w-full h-full object-contain"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
														—
													</div>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-xs font-bold truncate">
													{product.name}
												</p>
												<p className="text-[10px] text-gray-400">
													{product.price?.toLocaleString()} RUB
												</p>
											</div>
										</Link>
									))}
								</div>
							)}
						</div>
					</form>
					<div className="flex items-center gap-3 md:gap-5 shrink-0">
						<Link
							href="/favorites"
							className="text-gray-400 hover:text-black transition relative">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							{favCount > 0 && (
								<span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold">
									{favCount}
								</span>
							)}
						</Link>
						<Link
							href="/cart"
							className="text-gray-400 hover:text-black transition relative">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5">
								<circle cx="9" cy="21" r="1" />
								<circle cx="20" cy="21" r="1" />
								<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
							</svg>
							{cartCount > 0 && (
								<span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold">
									{cartCount}
								</span>
							)}
						</Link>
						<Link
							href={user ? "/profile" : "/login"}
							className="text-gray-400 hover:text-black transition">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
						</Link>
					</div>
				</div>

				{/* Мобилка */}
				<div className="flex md:hidden items-center h-14 px-3 gap-2 overflow-hidden">
					{/* Обычный хедер */}
					<div
						className={`flex items-center gap-2 transition-all duration-300 ${mobileSearchOpen ? "-translate-x-full opacity-0 absolute" : "translate-x-0 opacity-100"} w-full`}>
						<button
							onClick={() => setMenuOpen(!menuOpen)}
							className="text-gray-600 hover:text-black shrink-0">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round">
								<line x1="3" y1="6" x2="21" y2="6" />
								<line x1="3" y1="12" x2="21" y2="12" />
								<line x1="3" y1="18" x2="21" y2="18" />
							</svg>
						</button>
						<Link href="/" className="flex-1 flex justify-center">
							<img
								src="/main-icon.jpg"
								alt="STUFFBYPOIZON"
								className="h-8 w-auto"
							/>
						</Link>
						<button
							onClick={openMobileSearch}
							className="text-gray-600 hover:text-black shrink-0">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round">
								<circle cx="11" cy="11" r="8" />
								<line x1="21" y1="21" x2="16.65" y2="16.65" />
							</svg>
						</button>
					</div>

					{/* Поиск */}
					<form
						onSubmit={handleSearch}
						className={`flex items-center gap-2 transition-all duration-300 ${mobileSearchOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute"} w-full`}>
						<button
							type="button"
							onClick={closeMobileSearch}
							className="text-gray-600 hover:text-black shrink-0">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round">
								<polyline points="15 18 9 12 15 6" />
							</svg>
						</button>
						<div className="flex-1 relative">
							<input
								ref={searchInputRef}
								className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary"
								placeholder="Поиск..."
								type="text"
								value={searchValue}
								onChange={(e) => handleSearchInput(e.target.value)}
								autoFocus
								onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
							/>
							{searchOpen && searchResults.length > 0 && (
								<div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-30 overflow-hidden max-h-[300px] overflow-y-auto">
									{searchResults.map((product: any) => (
										<Link
											key={product.id}
											href={`/product/${product.id}`}
											onClick={() => {
												setSearchOpen(false);
												setSearchValue("");
												setMobileSearchOpen(false);
											}}
											className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer">
											<div className="w-10 h-10 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
												{product.images?.[0] ? (
													<img
														src={product.images[0]}
														alt=""
														className="w-full h-full object-contain"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
														—
													</div>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-xs font-bold truncate">
													{product.name}
												</p>
												<p className="text-[10px] text-gray-400">
													{product.price?.toLocaleString()} RUB
												</p>
											</div>
										</Link>
									))}
								</div>
							)}
						</div>
					</form>
				</div>
			</header>

			{/* Мобильное меню */}
			<div
				className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
				onClick={closeAll}>
				<div className="absolute inset-0 bg-black/40" />
				<aside
					className={`absolute top-0 left-0 w-72 h-full bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
					onClick={(e) => e.stopPropagation()}>
					<div className="p-6 flex justify-between items-center border-b border-gray-100">
						<span
							className="text-lg font-extrabold uppercase"
							style={{ fontFamily: "Montserrat, sans-serif" }}>
							МЕНЮ
						</span>
						<button
							onClick={closeAll}
							className="text-2xl hover:text-primary transition">
							&#10005;
						</button>
					</div>
					<div className="flex-1 overflow-y-auto p-6 space-y-1">
						<Link
							href="/"
							onClick={closeAll}
							className="block text-sm font-bold uppercase text-gray-600 hover:text-black py-2 border-b border-gray-100 transition">
							Главное меню
						</Link>

						<div>
							<button
								onClick={() => setExpandedSneakers(!expandedSneakers)}
								className="w-full flex items-center justify-between text-sm font-bold uppercase text-gray-600 hover:text-black py-2 border-b border-gray-100 transition">
								Кроссовки
								<svg
									className={`w-4 h-4 transition-transform duration-300 ${expandedSneakers ? "rotate-90" : ""}`}
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2">
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</button>
							<div
								className={`grid transition-all duration-300 ${expandedSneakers ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
								<div className="overflow-hidden">
									<div className="pl-4 space-y-1 pt-1">
										{BRANDS.map((brand) => (
											<div key={brand}>
												<button
													onClick={() =>
														setExpandedBrand(
															expandedBrand === brand ? null : brand,
														)
													}
													className="w-full flex items-center justify-between text-sm font-bold uppercase text-gray-500 hover:text-black py-2 transition">
													{brand}
													{SERIES_BY_BRAND[brand] && (
														<svg
															className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedBrand === brand ? "rotate-90" : ""}`}
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2">
															<polyline points="9 18 15 12 9 6" />
														</svg>
													)}
												</button>
												<div
													className={`grid transition-all duration-300 ${expandedBrand === brand ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
													<div className="overflow-hidden">
														<div className="pl-4 space-y-1">
															{SERIES_BY_BRAND[brand]?.map((series) => (
																<Link
																	key={series}
																	href={`/catalog?type=Sneakers&brand=${encodeURIComponent(brand)}&series=${encodeURIComponent(series)}`}
																	onClick={closeAll}
																	className="block text-xs font-bold uppercase text-gray-400 hover:text-primary py-1.5 transition">
																	{series}
																</Link>
															))}
															<Link
																href={`/catalog?type=Sneakers&brand=${encodeURIComponent(brand)}`}
																onClick={closeAll}
																className="block text-xs font-bold uppercase text-gray-300 hover:text-primary py-1.5 transition">
																Все {brand}
															</Link>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						<div>
							<button
								onClick={() => setExpandedClothing(!expandedClothing)}
								className="w-full flex items-center justify-between text-sm font-bold uppercase text-gray-600 hover:text-black py-2 border-b border-gray-100 transition">
								Одежда
								<svg
									className={`w-4 h-4 transition-transform duration-300 ${expandedClothing ? "rotate-90" : ""}`}
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2">
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</button>
							<div
								className={`grid transition-all duration-300 ${expandedClothing ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
								<div className="overflow-hidden">
									<div className="pl-4 space-y-1 pt-1">
										{CLOTHING_CATEGORIES.map((cat) => (
											<Link
												key={cat.name}
												href={`/catalog?type=${cat.type}&clothingType=${encodeURIComponent(cat.subtype)}`}
												onClick={closeAll}
												className="block text-sm font-bold uppercase text-gray-500 hover:text-black py-2 transition">
												{cat.name}
											</Link>
										))}
									</div>
								</div>
							</div>
						</div>

						<div>
							<button
								onClick={() => setExpandedAccessories(!expandedAccessories)}
								className="w-full flex items-center justify-between text-sm font-bold uppercase text-gray-600 hover:text-black py-2 border-b border-gray-100 transition">
								Аксессуары
								<svg
									className={`w-4 h-4 transition-transform duration-300 ${expandedAccessories ? "rotate-90" : ""}`}
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2">
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</button>
							<div
								className={`grid transition-all duration-300 ${expandedAccessories ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
								<div className="overflow-hidden">
									<div className="pl-4 space-y-1 pt-1">
										{ACCESSORY_CATEGORIES.map((cat) => (
											<Link
												key={cat.name}
												href={`/catalog?type=${cat.type}&subtype=${encodeURIComponent(cat.subtype)}`}
												onClick={closeAll}
												className="block text-sm font-bold uppercase text-gray-500 hover:text-black py-2 transition">
												{cat.name}
											</Link>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</aside>
			</div>

			{/* Мобильная нижняя панель */}
			<nav className="md:hidden fixed bottom-0 w-full z-50 bg-cream/95 backdrop-blur-sm border-t border-sand/50 flex justify-around items-center py-2">
				<Link
					href="/"
					className="flex flex-col items-center text-gray-400 text-[10px] font-bold">
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
						<polyline points="9 22 9 12 15 12 15 22" />
					</svg>
					Главная
				</Link>
				<Link
					href="/catalog"
					className="flex flex-col items-center text-gray-400 text-[10px] font-bold">
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round">
						<rect x="3" y="3" width="7" height="7" />
						<rect x="14" y="3" width="7" height="7" />
						<rect x="14" y="14" width="7" height="7" />
						<rect x="3" y="14" width="7" height="7" />
					</svg>
					Каталог
				</Link>
				<Link
					href="/cart"
					className="flex flex-col items-center text-gray-400 text-[10px] font-bold relative">
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5">
						<circle cx="9" cy="21" r="1" />
						<circle cx="20" cy="21" r="1" />
						<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
					</svg>
					{cartCount > 0 && (
						<span className="absolute -top-1 right-2 bg-primary text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold">
							{cartCount}
						</span>
					)}
					Корзина
				</Link>
				<Link
					href="/favorites"
					className="flex flex-col items-center text-gray-400 text-[10px] font-bold relative">
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5">
						<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
					</svg>
					{favCount > 0 && (
						<span className="absolute -top-1 right-2 bg-red-500 text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold">
							{favCount}
						</span>
					)}
					Избранное
				</Link>
				<Link
					href={user ? "/profile" : "/login"}
					className="flex flex-col items-center text-gray-400 text-[10px] font-bold">
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
					Профиль
				</Link>
			</nav>
		</>
	);
}
