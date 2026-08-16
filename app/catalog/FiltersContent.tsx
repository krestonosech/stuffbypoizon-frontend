"use client";

import { useEffect, useRef, useState } from "react";
import api from "../../lib/api";

const COLORS = [
	{ name: "Черный", hex: "#000000" },
	{ name: "Белый", hex: "#FFFFFF" },
	{ name: "Серый", hex: "#9CA3AF" },
	{ name: "Красный", hex: "#EF4444" },
	{ name: "Синий", hex: "#3B82F6" },
	{ name: "Зеленый", hex: "#22C55E" },
	{ name: "Желтый", hex: "#EAB308" },
	{ name: "Фиолетовый", hex: "#A855F7" },
	{ name: "Розовый", hex: "#EC4899" },
	{ name: "Бежевый", hex: "#D6C7A1" },
	{
		name: "Мультиколор",
		hex: "linear-gradient(90deg, #EF4444, #EAB308, #22C55E, #3B82F6, #A855F7)",
	},
];

const SEASONS = [
	{ key: "summer", label: "Лето" },
	{ key: "winter", label: "Зима" },
	{ key: "demi", label: "Межсезонье" },
	{ key: "all", label: "Круглый год" },
];

const SNEAKER_SIZES = [
	"35.5",
	"36",
	"36 2/3",
	"36.5",
	"37 1/3",
	"37.5",
	"38",
	"38 2/3",
	"38.5",
	"39 1/3",
	"39",
	"40",
	"40 2/3",
	"40.5",
	"41 1/3",
	"41",
	"41.5",
	"42",
	"42 2/3",
	"42.5",
	"43 1/3",
	"43",
	"43.5",
	"44",
	"44 2/3",
	"44.5",
	"45 1/3",
	"45",
	"45.5",
	"46",
	"46 2/3",
	"46.5",
	"47 1/3",
	"47",
	"47.5",
	"48",
	"48.5",
	"49",
];
const CLOTHING_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

const categories = [
	{ key: "Sneakers", label: "Кроссовки" },
	{ key: "Clothing", label: "Одежда" },
	{ key: "Accessories", label: "Аксессуары" },
	{ key: "Bags", label: "Сумки" },
];

const genders = [
	{ key: "Men", label: "Мужской" },
	{ key: "Women", label: "Женский" },
	{ key: "Unisex", label: "Унисекс" },
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

interface FiltersContentProps {
	typeFilter: string[];
	setTypeFilter: (val: string[]) => void;
	genderFilter: string[];
	setGenderFilter: (val: string[]) => void;
	colorFilter: string[];
	setColorFilter: (val: string[]) => void;
	seasonFilter: string[];
	setSeasonFilter: (val: string[]) => void;
	sizeFrom: string;
	setSizeFrom: (val: string) => void;
	sizeTo: string;
	setSizeTo: (val: string) => void;
	brandFilter: string;
	seriesFilter: string;
	setSeriesFilter: (val: string) => void;
	onApply: (brand: string, min: string, max: string, series: string) => void;
	onReset: () => void;
}

export default function FiltersContent({
	typeFilter,
	setTypeFilter,
	genderFilter,
	setGenderFilter,
	colorFilter,
	setColorFilter,
	seasonFilter,
	setSeasonFilter,
	sizeFrom,
	setSizeFrom,
	sizeTo,
	setSizeTo,
	brandFilter,
	seriesFilter,
	setSeriesFilter,
	onApply,
	onReset,
}: FiltersContentProps) {
	const minInputRef = useRef<HTMLInputElement>(null);
	const maxInputRef = useRef<HTMLInputElement>(null);
	const [sizeFromOpen, setSizeFromOpen] = useState(false);
	const [sizeToOpen, setSizeToOpen] = useState(false);
	const [localBrand, setLocalBrand] = useState(brandFilter);
	const [brands, setBrands] = useState<string[]>([]);
	const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
	const [brandSearch, setBrandSearch] = useState("");

	useEffect(() => {
		fetchBrands();
	}, []);
	useEffect(() => {
		setLocalBrand(brandFilter);
	}, [brandFilter]);

	const fetchBrands = async () => {
		try {
			const { data } = await api.get("/products?brands=list");
			setBrands(data.data || []);
		} catch {}
	};

	const filteredBrands = brands.filter((b) =>
		b.toLowerCase().includes(brandSearch.toLowerCase()),
	);
	const toggleColor = (name: string) => {
		setColorFilter(
			colorFilter.includes(name)
				? colorFilter.filter((c) => c !== name)
				: [...colorFilter, name],
		);
	};

	const currentSizes = typeFilter.includes("Clothing")
		? CLOTHING_SIZES
		: SNEAKER_SIZES;
	const availableSizesFrom = sizeTo
		? currentSizes.filter(
				(s) => currentSizes.indexOf(s) <= currentSizes.indexOf(sizeTo),
			)
		: currentSizes;
	const availableSizesTo = sizeFrom
		? currentSizes.filter(
				(s) => currentSizes.indexOf(s) >= currentSizes.indexOf(sizeFrom),
			)
		: currentSizes;
	const sizeLabel = typeFilter.includes("Clothing")
		? "РАЗМЕР ОДЕЖДЫ"
		: "РАЗМЕР ОБУВИ (EU)";
	const showSizes =
		!typeFilter.includes("Accessories") && !typeFilter.includes("Bags");

	const handleApply = () => {
		const min = minInputRef.current?.value || "0";
		const max = maxInputRef.current?.value || "200000";
		onApply(localBrand, min, max, seriesFilter);
	};

	return (
		<div className="space-y-8">
			{/* Категории */}
			<div>
				<h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">
					КАТЕГОРИИ
				</h3>
				<ul className="space-y-2">
					{categories.map((cat) => (
						<li key={cat.key}>
							<label className="flex items-center gap-2 cursor-pointer group">
								<input
									type="checkbox"
									checked={typeFilter.includes(cat.key)}
									onChange={() =>
										setTypeFilter(typeFilter.includes(cat.key) ? [] : [cat.key])
									}
									className="w-4 h-4 text-primary focus:ring-primary border-gray-200 cursor-pointer"
								/>
								<span className="text-sm font-bold uppercase text-gray-500 group-hover:text-primary transition cursor-pointer">
									{cat.label}
								</span>
							</label>
						</li>
					))}
				</ul>
			</div>

			{/* Пол */}
			<div>
				<h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">
					ПОЛ
				</h3>
				<ul className="space-y-2">
					{genders.map((g) => (
						<li key={g.key}>
							<label className="flex items-center gap-2 cursor-pointer group">
								<input
									type="checkbox"
									checked={genderFilter.includes(g.key)}
									onChange={() =>
										setGenderFilter(genderFilter.includes(g.key) ? [] : [g.key])
									}
									className="w-4 h-4 text-primary focus:ring-primary border-gray-200 cursor-pointer"
								/>
								<span className="text-sm font-bold uppercase text-gray-500 group-hover:text-primary transition cursor-pointer">
									{g.label}
								</span>
							</label>
						</li>
					))}
				</ul>
			</div>

			{/* Размеры */}
			{showSizes && (
				<div>
					<h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">
						{sizeLabel}
					</h3>
					<div className="flex items-center gap-2">
						<div className="relative w-full">
							<button
								onClick={() => {
									setSizeFromOpen(!sizeFromOpen);
									setSizeToOpen(false);
								}}
								className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold uppercase text-gray-500 hover:border-gray-200 transition cursor-pointer">
								{sizeFrom || "ОТ"}{" "}
								<svg
									width="10"
									height="10"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2">
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</button>
							{sizeFromOpen && (
								<>
									<div
										className="fixed inset-0 z-10"
										onClick={() => setSizeFromOpen(false)}
									/>
									<div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
										{availableSizesFrom.map((s) => (
											<button
												key={s}
												onClick={() => {
													setSizeFrom(s);
													setSizeFromOpen(false);
												}}
												className={`w-full text-left px-3 py-2 text-xs font-bold uppercase transition cursor-pointer ${sizeFrom === s ? "text-primary bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}>
												{s}
											</button>
										))}
									</div>
								</>
							)}
						</div>
						<span className="text-gray-300 text-xs">-</span>
						<div className="relative w-full">
							<button
								onClick={() => {
									setSizeToOpen(!sizeToOpen);
									setSizeFromOpen(false);
								}}
								className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold uppercase text-gray-500 hover:border-gray-200 transition cursor-pointer">
								{sizeTo || "ДО"}{" "}
								<svg
									width="10"
									height="10"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2">
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</button>
							{sizeToOpen && (
								<>
									<div
										className="fixed inset-0 z-10"
										onClick={() => setSizeToOpen(false)}
									/>
									<div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
										{availableSizesTo.map((s) => (
											<button
												key={s}
												onClick={() => {
													setSizeTo(s);
													setSizeToOpen(false);
												}}
												className={`w-full text-left px-3 py-2 text-xs font-bold uppercase transition cursor-pointer ${sizeTo === s ? "text-primary bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}>
												{s}
											</button>
										))}
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Цвета */}
			<div>
				<h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">
					ЦВЕТ
				</h3>
				<div className="flex flex-wrap gap-2">
					{COLORS.map((c) => (
						<button
							key={c.name}
							onClick={() => toggleColor(c.name)}
							className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${colorFilter.includes(c.name) ? "border-primary scale-110" : "border-gray-200 hover:border-gray-400"}`}
							style={{ background: c.hex }}
							title={c.name}
						/>
					))}
				</div>
			</div>

			{/* Бренд — селект */}
			<div>
				<h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">
					БРЕНД
				</h3>
				<div className="relative">
					<button
						onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
						className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold uppercase text-gray-500 hover:border-gray-200 transition cursor-pointer">
						{localBrand || "Выбрать бренд"}{" "}
						<svg
							width="10"
							height="10"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2">
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</button>
					{brandDropdownOpen && (
						<>
							<div
								className="fixed inset-0 z-10"
								onClick={() => setBrandDropdownOpen(false)}
							/>
							<div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
								<div className="p-2 border-b border-gray-100">
									<input
										className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-xs focus:ring-0 focus:border-gray-200"
										placeholder="Поиск бренда..."
										value={brandSearch}
										onChange={(e) => setBrandSearch(e.target.value)}
										onClick={(e) => e.stopPropagation()}
									/>
								</div>
								<div className="max-h-48 overflow-y-auto">
									<button
										onClick={() => {
											setLocalBrand("");
											setSeriesFilter("");
											setBrandDropdownOpen(false);
										}}
										className={`w-full text-left px-3 py-2 text-xs font-bold uppercase transition cursor-pointer ${!localBrand ? "text-primary bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}>
										Все бренды
									</button>
									{filteredBrands.map((brand) => (
										<button
											key={brand}
											onClick={() => {
												setLocalBrand(brand);
												setSeriesFilter("");
												setBrandDropdownOpen(false);
											}}
											className={`w-full text-left px-3 py-2 text-xs font-bold uppercase transition cursor-pointer ${localBrand === brand ? "text-primary bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}>
											{brand}
										</button>
									))}
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Серии — список под брендом */}
			{localBrand && SERIES_BY_BRAND[localBrand] && (
				<div>
					<h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">
						СЕРИЯ
					</h3>
					<div className="flex flex-wrap gap-2">
						<button
							onClick={() => setSeriesFilter("")}
							className={`px-3 py-1.5 text-[11px] font-bold uppercase rounded-lg border transition cursor-pointer ${!seriesFilter ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
							Все
						</button>
						{SERIES_BY_BRAND[localBrand].map((series) => (
							<button
								key={series}
								onClick={() => setSeriesFilter(series)}
								className={`px-3 py-1.5 text-[11px] font-bold uppercase rounded-lg border transition cursor-pointer ${seriesFilter === series ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
								{series}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Сезон */}
			<div>
				<h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">
					СЕЗОН
				</h3>
				<div className="grid grid-cols-2 gap-2">
					{SEASONS.map((s) => (
						<button
							key={s.key}
							onClick={() =>
								setSeasonFilter(seasonFilter.includes(s.key) ? [] : [s.key])
							}
							className={`py-2 text-xs font-bold uppercase rounded-lg border transition cursor-pointer ${seasonFilter.includes(s.key) ? "bg-primary text-white border-primary" : "border-gray-100 text-gray-500 hover:border-gray-300"}`}>
							{s.label}
						</button>
					))}
				</div>
			</div>

			{/* Цена */}
			<div>
				<h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">
					ЦЕНА (RUB)
				</h3>
				<div className="flex items-center gap-2">
					<input
						ref={minInputRef}
						className="w-full border border-gray-100 rounded-lg bg-gray-50 p-2 text-sm focus:border-gray-200 focus:ring-0 placeholder:text-gray-300"
						placeholder="ОТ"
						type="number"
					/>
					<input
						ref={maxInputRef}
						className="w-full border border-gray-100 rounded-lg bg-gray-50 p-2 text-sm focus:border-gray-200 focus:ring-0 placeholder:text-gray-300"
						placeholder="ДО"
						type="number"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<button
					onClick={handleApply}
					className="w-full py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition cursor-pointer">
					Применить
				</button>
				<button
					onClick={() => {
						if (minInputRef.current) minInputRef.current.value = "0";
						if (maxInputRef.current) maxInputRef.current.value = "200000";
						setLocalBrand("");
						setSeriesFilter("");
						onReset();
					}}
					className="w-full py-2.5 border border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-50 transition cursor-pointer">
					Сбросить фильтры
				</button>
			</div>
		</div>
	);
}
