"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import api from "../lib/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const slides = [
	{ src: "/nike.jpg", label: "NIKE", href: "/catalog?brand=Nike" },
	{ src: "/yeezy.jpg", label: "YEEZY", href: "/catalog?brand=Yeezy" },
	{ src: "/uggi.jpg", label: "УГГИ", href: "/catalog?brand=UGG" },
	{
		src: "/hat.jpg",
		label: "ГОЛОВНЫЕ УБОРЫ",
		href: "/catalog?type=Clothing&clothingType=Верхняя одежда",
	},
	{
		src: "/glasses.jpg",
		label: "АКСЕССУАРЫ",
		href: "/catalog?type=Accessories",
	},
	{
		src: "/bag.jpg",
		label: "СУМКИ",
		href: "/catalog?type=Accessories&subtype=Сумки",
	},
];

async function getProducts() {
	try {
		const { data } = await api.get("/products?pageSize=8");
		return data.data || [];
	} catch {
		return [];
	}
}

export default function Home() {
	const [products, setProducts] = useState<any[]>([]);
	const [currentSlide, setCurrentSlide] = useState(0);
	const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
	const touchStartX = useRef(0);
	const touchEndX = useRef(0);
	const [touchDelta, setTouchDelta] = useState(0);

	useEffect(() => {
		getProducts().then(setProducts);
	}, []);

	const startAutoPlay = () => {
		if (autoPlayRef.current) clearInterval(autoPlayRef.current);
		autoPlayRef.current = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % slides.length);
		}, 3000);
	};

	useEffect(() => {
		startAutoPlay();
		return () => {
			if (autoPlayRef.current) clearInterval(autoPlayRef.current);
		};
	}, []);

	const goToSlide = (index: number) => {
		setCurrentSlide(index);
		startAutoPlay();
	};

	const handleTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
		setTouchDelta(0);
		if (autoPlayRef.current) clearInterval(autoPlayRef.current);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		touchEndX.current = e.touches[0].clientX;
		const delta = touchStartX.current - touchEndX.current;
		setTouchDelta(delta);
	};

	const handleTouchEnd = () => {
		const diff = touchStartX.current - touchEndX.current;
		if (Math.abs(diff) > 50) {
			if (diff > 0) setCurrentSlide((prev) => (prev + 1) % slides.length);
			else
				setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
		}
		setTouchDelta(0);
		startAutoPlay();
	};

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % slides.length);
		startAutoPlay();
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
		startAutoPlay();
	};

	const extendedSlides = [...slides, ...slides, ...slides];
	const startIndex = slides.length + currentSlide;

	return (
		<main>
			<Header />

			{/* Слайдшоу */}
			<section
				className="w-full bg-white overflow-hidden relative"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}>
				{/* Десктоп: 3 колонки */}
				<div className="hidden md:block relative">
					{/* Стрелка влево */}
					<button
						onClick={prevSlide}
						className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-gray-800">
							<path d="M15 18l-6-6 6-6" />
						</svg>
					</button>

					{/* Стрелка вправо */}
					<button
						onClick={nextSlide}
						className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-gray-800">
							<path d="M9 18l6-6-6-6" />
						</svg>
					</button>

					<div
						className="flex transition-transform duration-500 ease-in-out"
						style={{
							transform: `translateX(-${startIndex * (100 / 3)}%)`,
						}}>
						{extendedSlides.map((slide, i) => (
							<Link
								key={`${slide.label}-${i}`}
								href={slide.href}
								className="group cursor-pointer relative flex-shrink-0 w-1/3">
								<div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
									<img
										src={slide.src}
										alt={slide.label}
										className="w-full h-full object-cover"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
									<div className="absolute bottom-0 left-0 right-0 top-1/2 flex items-center justify-center">
										<p
											className="text-xl md:text-2xl font-extrabold text-white uppercase tracking-wider text-center px-4 drop-shadow-lg"
											style={{ fontFamily: "Montserrat, sans-serif" }}>
											{slide.label}
										</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* Мобилка: 1 фотка почти во весь экран */}
				<div className="md:hidden relative pt-4">
					<div
						className="flex transition-transform duration-500 ease-in-out"
						style={{
							transform: touchDelta
								? `translateX(calc(-${startIndex * 100}% - ${touchDelta}px))`
								: `translateX(-${startIndex * 100}%)`,
						}}>
						{extendedSlides.map((slide, i) => (
							<Link
								key={`${slide.label}-${i}`}
								href={slide.href}
								className="group cursor-pointer relative flex-shrink-0 w-full px-4">
								<div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 relative">
									<img
										src={slide.src}
										alt={slide.label}
										className="w-full h-full object-cover"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
									<div className="absolute bottom-0 left-0 right-0 top-1/2 flex items-center justify-center">
										<p
											className="text-xl font-extrabold text-white uppercase tracking-wider text-center px-4 drop-shadow-lg"
											style={{ fontFamily: "Montserrat, sans-serif" }}>
											{slide.label}
										</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* Индикаторы */}
				<div className="flex justify-center gap-1.5 py-4 bg-white">
					{slides.map((_, i) => (
						<button
							key={i}
							onClick={() => goToSlide(i)}
							className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-primary w-6" : "bg-gray-300"}`}
						/>
					))}
				</div>
			</section>

			{/* Товары */}
			<section className="py-12 md:py-16 bg-[#fafafa]">
				<div className="max-w-[1440px] mx-auto px-4 md:px-16">
					<h2
						className="text-3xl md:text-5xl font-extrabold uppercase mb-8 md:mb-10 text-center tracking-wider"
						style={{ fontFamily: "Montserrat, sans-serif" }}>
						ПОПУЛЯРНЫЕ ТОВАРЫ
					</h2>
					{products.length === 0 ? (
						<div className="text-center py-20 text-gray-400">
							<p className="text-lg font-bold uppercase">
								Товары скоро появятся
							</p>
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
							{products.map((product: any) => (
								<Link
									key={product.id}
									href={`/product/${product.id}`}
									className="group cursor-pointer">
									<div className="aspect-[4/5] bg-gray-50 mb-3 md:mb-4 overflow-hidden relative rounded-2xl border border-gray-100">
										{product.images?.[0] ? (
											<img
												src={product.images[0]}
												alt={product.name}
												className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
											/>
										) : product.image ? (
											<img
												src={product.image}
												alt={product.name}
												className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
												{product.name}
											</div>
										)}
									</div>
									<h3
										className="text-sm md:text-base font-bold uppercase leading-tight group-hover:text-primary transition-colors line-clamp-2"
										style={{ fontFamily: "Montserrat, sans-serif" }}>
										{product.name}
									</h3>
									<p className="text-sm font-bold mt-1">
										от {product.price?.toLocaleString()} RUB
									</p>
								</Link>
							))}
						</div>
					)}
				</div>
			</section>

			{/* Категории */}
			<section className="py-12 md:py-16 border-t border-gray-100">
				<div className="max-w-[1440px] mx-auto px-4 md:px-16">
					<h2
						className="text-3xl md:text-5xl font-extrabold uppercase mb-8 md:mb-10 text-center tracking-wider"
						style={{ fontFamily: "Montserrat, sans-serif" }}>
						КАТЕГОРИИ
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
						{[
							{
								name: "КРОССОВКИ",
								type: "Sneakers",
								img: "/categories/sneakers.jpg",
								color: "from-blue-900/60",
							},
							{
								name: "ОДЕЖДА",
								type: "Clothing",
								img: "/categories/clothing.webp",
								color: "from-green-900/60",
							},
							{
								name: "АКСЕССУАРЫ",
								type: "Accessories",
								img: "/categories/accessories.jpg",
								color: "from-yellow-900/60",
							},
						].map((cat) => (
							<Link
								key={cat.name}
								href={`/catalog?type=${cat.type}`}
								className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200">
								<div
									className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent z-10`}
								/>
								<div
									className="w-full h-full bg-cover bg-center"
									style={{ backgroundImage: `url(${cat.img})` }}
								/>
								<div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20">
									<h3
										className="text-xl md:text-2xl font-extrabold text-white uppercase tracking-wider"
										style={{ fontFamily: "Montserrat, sans-serif" }}>
										{cat.name}
									</h3>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			<Footer />
		</main>
	);
}
