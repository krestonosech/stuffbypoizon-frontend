"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import api from "../../lib/api";
import FiltersContent from "./FiltersContent";

function CatalogContent() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [products, setProducts] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [sortBy, setSortBy] = useState("createdAt");
	const [order, setOrder] = useState("desc");
	const pageSize = 12;

	const [typeFilter, setTypeFilter] = useState<string[]>([]);
	const [genderFilter, setGenderFilter] = useState<string[]>([]);
	const [colorFilter, setColorFilter] = useState<string[]>([]);
	const [brandFilter, setBrandFilter] = useState("");
	const [seriesFilter, setSeriesFilter] = useState("");
	const [seasonFilter, setSeasonFilter] = useState<string[]>([]);
	const [sizeFrom, setSizeFrom] = useState("");
	const [sizeTo, setSizeTo] = useState("");
	const [search, setSearch] = useState("");
	const [minPrice, setMinPrice] = useState(0);
	const [maxPrice, setMaxPrice] = useState(200000);
	const [clothingTypeFilter, setClothingTypeFilter] = useState("");
	const [subtypeFilter, setSubtypeFilter] = useState("");
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [favorites, setFavorites] = useState<string[]>([]);
	const [sortOpen, setSortOpen] = useState(false);

	const [favModalProduct, setFavModalProduct] = useState<any>(null);
	const [favSize, setFavSize] = useState("");

	const [appliedFilters, setAppliedFilters] = useState({
		type: "",
		gender: "",
		search: "",
		minPrice: "",
		maxPrice: "",
		brand: "",
		season: "",
		sizeFrom: "",
		sizeTo: "",
		color: "",
		series: "",
		clothingType: "",
		subtype: "",
	});

	const fetchProductsWithFilters = async (filters = appliedFilters) => {
		try {
			const params = new URLSearchParams();
			params.set("page", page.toString());
			params.set("pageSize", pageSize.toString());
			params.set("sortBy", sortBy);
			params.set("order", order);
			if (filters.type) params.set("type", filters.type);
			if (filters.gender) params.set("gender", filters.gender);
			if (filters.search) params.set("search", filters.search);
			if (filters.minPrice && filters.minPrice !== "0")
				params.set("minPrice", filters.minPrice);
			if (filters.maxPrice && filters.maxPrice !== "200000")
				params.set("maxPrice", filters.maxPrice);
			if (filters.brand) params.set("brand", filters.brand);
			if (filters.series) params.set("series", filters.series);
			if (filters.season) params.set("season", filters.season);
			if (filters.sizeFrom) params.set("sizeFrom", filters.sizeFrom);
			if (filters.sizeTo) params.set("sizeTo", filters.sizeTo);
			if (filters.color) params.set("color", filters.color);
			if (filters.clothingType)
				params.set("clothingType", filters.clothingType);
			if (filters.subtype) params.set("subtype", filters.subtype);

			const { data } = await api.get(`/products?${params.toString()}`);
			setProducts(data.data || []);
			setTotal(data.pagination?.total || 0);
		} catch {
			setProducts([]);
		}
	};

	useEffect(() => {
		const type = searchParams.get("type") || "";
		const search = searchParams.get("search") || "";
		const gender = searchParams.get("gender") || "";
		const color = searchParams.get("color") || "";
		const season = searchParams.get("season") || "";
		const sizeFrom = searchParams.get("sizeFrom") || "";
		const sizeTo = searchParams.get("sizeTo") || "";
		const minPrice = searchParams.get("minPrice") || "";
		const maxPrice = searchParams.get("maxPrice") || "";
		const brand = searchParams.get("brand") || "";
		const series = searchParams.get("series") || "";
		const clothingType = searchParams.get("clothingType") || "";
		const subtype = searchParams.get("subtype") || "";
		const sortByParam = searchParams.get("sortBy") || "createdAt";
		const orderParam = searchParams.get("order") || "desc";
		const pageParam = searchParams.get("page") || "1";

		if (type) setTypeFilter([type]);
		else setTypeFilter([]);
		if (gender) setGenderFilter([gender]);
		else setGenderFilter([]);
		if (color) setColorFilter([color]);
		else setColorFilter([]);
		if (season) setSeasonFilter([season]);
		else setSeasonFilter([]);
		if (sizeFrom) setSizeFrom(sizeFrom);
		else setSizeFrom("");
		if (sizeTo) setSizeTo(sizeTo);
		else setSizeTo("");
		if (search) setSearch(search);
		else setSearch("");
		if (minPrice) setMinPrice(parseInt(minPrice));
		else setMinPrice(0);
		if (maxPrice) setMaxPrice(parseInt(maxPrice));
		else setMaxPrice(200000);
		if (brand) setBrandFilter(brand);
		else setBrandFilter("");
		if (series) setSeriesFilter(series);
		else setSeriesFilter("");
		if (clothingType) setClothingTypeFilter(clothingType);
		else setClothingTypeFilter("");
		if (subtype) setSubtypeFilter(subtype);
		else setSubtypeFilter("");
		if (sortByParam) setSortBy(sortByParam);
		if (orderParam) setOrder(orderParam as "asc" | "desc");
		if (pageParam) setPage(parseInt(pageParam));

		const newFilters = {
			type,
			gender,
			search,
			minPrice: minPrice && minPrice !== "0" ? minPrice : "",
			maxPrice: maxPrice && maxPrice !== "200000" ? maxPrice : "",
			brand,
			series,
			season,
			sizeFrom,
			sizeTo,
			color,
			clothingType,
			subtype,
		};
		setAppliedFilters(newFilters);
		fetchProductsWithFilters(newFilters);

		const savedFav = localStorage.getItem("favorites");
		if (savedFav) {
			try {
				setFavorites(JSON.parse(savedFav).map((f: any) => f.id));
			} catch {}
		}
	}, [searchParams, page, sortBy, order]);

	const applyFilters = (
		brand: string,
		min: string,
		max: string,
		series: string,
	) => {
		setMinPrice(parseInt(min));
		setMaxPrice(parseInt(max));
		setBrandFilter(brand);
		setSeriesFilter(series);
		setFiltersOpen(false);

		localStorage.setItem(
			"catalogFilters",
			JSON.stringify({
				typeFilter,
				genderFilter,
				colorFilter,
				seasonFilter,
				sizeFrom,
				sizeTo,
				search,
				minPrice: parseInt(min),
				maxPrice: parseInt(max),
				sortBy,
				order,
				brand,
				series,
				clothingTypeFilter,
				subtypeFilter,
			}),
		);

		const params = new URLSearchParams();
		if (typeFilter[0]) params.set("type", typeFilter[0]);
		if (genderFilter[0]) params.set("gender", genderFilter[0]);
		if (search) params.set("search", search);
		if (min && min !== "0") params.set("minPrice", min);
		if (max && max !== "200000") params.set("maxPrice", max);
		if (brand) params.set("brand", brand);
		if (series) params.set("series", series);
		if (seasonFilter[0]) params.set("season", seasonFilter[0]);
		if (sizeFrom) params.set("sizeFrom", sizeFrom);
		if (sizeTo) params.set("sizeTo", sizeTo);
		if (colorFilter[0]) params.set("color", colorFilter[0]);
		if (clothingTypeFilter) params.set("clothingType", clothingTypeFilter);
		if (subtypeFilter) params.set("subtype", subtypeFilter);
		if (sortBy !== "createdAt") params.set("sortBy", sortBy);
		if (order !== "desc") params.set("order", order);
		router.push(`/catalog?${params.toString()}`, { scroll: false });
	};

	const resetFilters = () => {
		setTypeFilter([]);
		setGenderFilter([]);
		setColorFilter([]);
		setSeasonFilter([]);
		setSizeFrom("");
		setSizeTo("");
		setSearch("");
		setMinPrice(0);
		setMaxPrice(200000);
		setBrandFilter("");
		setSeriesFilter("");
		setClothingTypeFilter("");
		setSubtypeFilter("");
		setAppliedFilters({
			type: "",
			gender: "",
			search: "",
			minPrice: "",
			maxPrice: "",
			brand: "",
			season: "",
			sizeFrom: "",
			sizeTo: "",
			color: "",
			series: "",
			clothingType: "",
			subtype: "",
		});
		localStorage.removeItem("catalogFilters");
		setFiltersOpen(false);
		router.push("/catalog", { scroll: false });
	};

	const addToFavoritesWithSize = () => {
		if (!favModalProduct || !favSize) return;
		const saved = localStorage.getItem("favorites");
		let favs: any[] = saved ? JSON.parse(saved) : [];
		const exists = favs.find(
			(f: any) => f.id === favModalProduct.id && f.size === favSize,
		);
		if (!exists) {
			favs.push({
				id: favModalProduct.id,
				name: favModalProduct.name,
				price: favModalProduct.price,
				images: favModalProduct.images,
				image: favModalProduct.image,
				type: favModalProduct.type,
				gender: favModalProduct.gender,
				skus: favModalProduct.skus,
				itemNumber: favModalProduct.itemNumber,
				size: favSize,
			});
			localStorage.setItem("favorites", JSON.stringify(favs));
			window.dispatchEvent(new Event("favoritesUpdated"));
			setFavorites((prev) => [...prev, favModalProduct.id]);
		}
		setFavModalProduct(null);
		setFavSize("");
	};

	const sortOptions = [
		{ value: "createdAt-desc", label: "По новизне" },
		{ value: "price-asc", label: "По цене: возрастание" },
		{ value: "price-desc", label: "По цене: убывание" },
	];
	const currentSortLabel =
		sortOptions.find((o) => o.value === `${sortBy}-${order}`)?.label ||
		"Сортировка";
	const totalPages = Math.ceil(total / pageSize);

	return (
		<main className="pt-16 min-h-screen flex flex-col">
			<Header />
			<div className="flex-1">
				<div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4">
						<div>
							<h1
								className="text-3xl md:text-5xl font-extrabold uppercase"
								style={{ fontFamily: "Montserrat, sans-serif" }}>
								КАТАЛОГ
							</h1>
							<p className="text-gray-400 text-xs font-bold uppercase mt-2">
								НАЙДЕНО {total} ТОВАРОВ
							</p>
						</div>
						<div className="flex items-center gap-3">
							<div className="relative ml-auto">
								<button
									onClick={() => setSortOpen(!sortOpen)}
									className="flex items-center justify-between w-full gap-2 bg-gray-50 border border-gray-100 rounded-full py-2 pl-4 pr-3 text-xs font-bold uppercase text-gray-500 hover:border-gray-200 transition cursor-pointer">
									{currentSortLabel}
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2">
										<polyline points="6 9 12 15 18 9" />
									</svg>
								</button>
								{sortOpen && (
									<>
										<div
											className="fixed inset-0 z-10"
											onClick={() => setSortOpen(false)}
										/>
										<div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
											{sortOptions.map((option) => (
												<button
													key={option.value}
													onClick={() => {
														const [s, o] = option.value.split("-");
														setSortBy(s);
														setOrder(o);
														setSortOpen(false);
													}}
													className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase transition cursor-pointer ${`${sortBy}-${order}` === option.value ? "text-primary bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}>
													{option.label}
												</button>
											))}
										</div>
									</>
								)}
							</div>
							<button
								onClick={() => setFiltersOpen(!filtersOpen)}
								className="md:hidden bg-gray-50 border border-gray-100 rounded-full py-2 px-4 text-xs font-bold uppercase text-gray-500 hover:border-gray-200 transition cursor-pointer">
								Фильтры
							</button>
						</div>
					</div>

					<div className="flex flex-col md:flex-row gap-8">
						<aside className="hidden md:block w-56 shrink-0">
							<FiltersContent
								typeFilter={typeFilter}
								setTypeFilter={setTypeFilter}
								genderFilter={genderFilter}
								setGenderFilter={setGenderFilter}
								colorFilter={colorFilter}
								setColorFilter={setColorFilter}
								seasonFilter={seasonFilter}
								setSeasonFilter={setSeasonFilter}
								sizeFrom={sizeFrom}
								setSizeFrom={setSizeFrom}
								sizeTo={sizeTo}
								setSizeTo={setSizeTo}
								brandFilter={brandFilter}
								seriesFilter={seriesFilter}
								setSeriesFilter={setSeriesFilter}
								onApply={applyFilters}
								onReset={resetFilters}
							/>
						</aside>

						<div
							className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${filtersOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
							onClick={() => setFiltersOpen(false)}>
							<div className="absolute inset-0 bg-black/40" />
							<div
								className={`absolute right-0 top-0 h-full w-72 bg-white p-6 overflow-y-auto shadow-xl transition-transform duration-300 ${filtersOpen ? "translate-x-0" : "translate-x-full"}`}
								onClick={(e) => e.stopPropagation()}>
								<div className="flex justify-between items-center mb-6">
									<span
										className="text-lg font-extrabold uppercase"
										style={{ fontFamily: "Montserrat, sans-serif" }}>
										ФИЛЬТРЫ
									</span>
									<button
										onClick={() => setFiltersOpen(false)}
										className="text-2xl text-gray-400 hover:text-primary transition cursor-pointer">
										&#10005;
									</button>
								</div>
								<FiltersContent
									typeFilter={typeFilter}
									setTypeFilter={setTypeFilter}
									genderFilter={genderFilter}
									setGenderFilter={setGenderFilter}
									colorFilter={colorFilter}
									setColorFilter={setColorFilter}
									seasonFilter={seasonFilter}
									setSeasonFilter={setSeasonFilter}
									sizeFrom={sizeFrom}
									setSizeFrom={setSizeFrom}
									sizeTo={sizeTo}
									setSizeTo={setSizeTo}
									brandFilter={brandFilter}
									seriesFilter={seriesFilter}
									setSeriesFilter={setSeriesFilter}
									onApply={applyFilters}
									onReset={resetFilters}
								/>
							</div>
						</div>

						<section className="flex-1">
							{products.length === 0 ? (
								<div className="text-center py-20 text-gray-400">
									<p className="text-lg font-bold uppercase">
										Товары не найдены
									</p>
									<p className="text-sm mt-1">
										Попробуйте изменить параметры поиска
									</p>
								</div>
							) : (
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
									{products.map((product: any) => (
										<div key={product.id} className="group relative">
											<Link
												href={`/product/${product.id}`}
												className="block cursor-pointer">
												<div className="aspect-square bg-gray-50 overflow-hidden relative flex items-center justify-center p-4 rounded-lg">
													{product.images?.[0] ? (
														<img
															src={product.images[0]}
															alt={product.name}
															className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
														/>
													) : product.image ? (
														<img
															src={product.image}
															alt={product.name}
															className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
														/>
													) : (
														<div className="text-gray-400 text-xs text-center">
															{product.name}
														</div>
													)}
												</div>
												<div className="mt-3 space-y-0.5">
													<h3
														className="text-sm font-bold uppercase leading-tight truncate"
														style={{ fontFamily: "Montserrat, sans-serif" }}>
														{product.name}
													</h3>
													<p className="text-sm font-bold">
														{product.price.toLocaleString()} RUB
													</p>
												</div>
											</Link>
											<button
												onClick={(e) => {
													e.preventDefault();
													setFavModalProduct(product);
													setFavSize("");
												}}
												className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition z-10 cursor-pointer">
												<svg
													width="18"
													height="18"
													viewBox="0 0 24 24"
													fill={
														favorites.includes(product.id) ? "#ef4444" : "none"
													}
													stroke={
														favorites.includes(product.id)
															? "#ef4444"
															: "#9ca3af"
													}
													strokeWidth="2">
													<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
												</svg>
											</button>
										</div>
									))}
								</div>
							)}
							{totalPages > 1 && (
								<div className="mt-12 flex justify-center items-center gap-2">
									<button
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
										className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-full hover:border-gray-300 disabled:opacity-30 transition cursor-pointer">
										&#8249;
									</button>
									{Array.from({ length: totalPages }, (_, i) => i + 1).map(
										(p) => (
											<button
												key={p}
												onClick={() => setPage(p)}
												className={`w-10 h-10 flex items-center justify-center font-bold text-sm rounded-full transition cursor-pointer ${p === page ? "bg-primary text-white" : "border border-gray-100 hover:border-gray-300"}`}>
												{p}
											</button>
										),
									)}
									<button
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
										disabled={page === totalPages}
										className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-full hover:border-gray-300 disabled:opacity-30 transition cursor-pointer">
										&#8250;
									</button>
								</div>
							)}
						</section>
					</div>
				</div>
			</div>

			<div
				className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${favModalProduct ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
				onClick={() => setFavModalProduct(null)}>
				<div className="absolute inset-0 bg-black/40" />
				<div
					className={`relative bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl transition-all duration-300 ${favModalProduct ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
					onClick={(e) => e.stopPropagation()}>
					<div className="flex justify-between items-center mb-4">
						<h3
							className="text-lg font-extrabold uppercase"
							style={{ fontFamily: "Montserrat, sans-serif" }}>
							Выберите размер
						</h3>
						<button
							onClick={() => setFavModalProduct(null)}
							className="text-2xl text-gray-400 hover:text-black transition">
							&#10005;
						</button>
					</div>
					<div className="grid grid-cols-4 gap-2 mb-4">
						{favModalProduct?.skus?.map((sku: any) => (
							<button
								key={sku.id}
								onClick={() => setFavSize(sku.size)}
								className={`py-2 text-xs font-bold uppercase rounded-lg border transition cursor-pointer ${
									favSize === sku.size
										? "bg-black text-white border-black"
										: "border-gray-200 text-gray-500 hover:border-gray-400"
								}`}>
								{sku.size}
								{favModalProduct.type !== "Clothing" ? " US" : ""}
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

			<Footer />
		</main>
	);
}

export default function CatalogPage() {
	return (
		<Suspense fallback={<div>Загрузка...</div>}>
			<CatalogContent />
		</Suspense>
	);
}
