"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../lib/auth-context";

export default function Footer() {
	const { user } = useAuth();
	const [openSection, setOpenSection] = useState<string | null>(null);

	const toggleSection = (section: string) => {
		setOpenSection(openSection === section ? null : section);
	};

	const sections = [
		{
			id: "account",
			title: "ЛИЧНЫЙ КАБИНЕТ",
			links: user
				? [{ label: "Профиль", href: "/profile" }]
				: [
						{ label: "Войти", href: "/login" },
						{ label: "Регистрация", href: "/register" },
					],
		},
		{
			id: "contacts",
			title: "КОНТАКТЫ",
			links: [
				{ label: "Telegram", href: "#" },
				{ label: "WhatsApp", href: "#" },
			],
		},
		{
			id: "info",
			title: "ИНФОРМАЦИЯ",
			links: [
				{ label: "Доставка", href: "#" },
				{ label: "Оплата", href: "#" },
			],
		},
		{
			id: "legal",
			title: "ПРАВОВАЯ",
			links: [
				{ label: "Приватность", href: "#" },
				{ label: "Условия", href: "#" },
				{ label: "Отзывы", href: "/reviews" },
			],
		},
	];

	return (
		<footer className="w-full py-10 md:py-14 bg-black border-t border-[#222]">
			<div className="max-w-[1440px] mx-auto px-4 md:px-16">
				{/* Десктоп — 4 колонки */}
				<div className="hidden md:grid grid-cols-4 gap-8 mb-10">
					{sections.map((section) => (
						<div key={section.id}>
							<h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
								{section.title}
							</h3>
							<ul className="space-y-3">
								{section.links.map((link) => (
									<li key={link.label}>
										<Link
											href={link.href}
											className="text-sm text-[#888] hover:text-white transition">
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Мобилка — дропдауны */}
				<div className="md:hidden space-y-1">
					{sections.map((section) => (
						<div key={section.id} className="border-b border-[#222]">
							<button
								onClick={() => toggleSection(section.id)}
								className="w-full flex items-center justify-between py-4 text-left">
								<span className="text-xs font-bold text-white uppercase tracking-widest">
									{section.title}
								</span>
								<svg
									className={`w-4 h-4 text-[#888] transition-transform duration-300 ${
										openSection === section.id ? "rotate-90" : ""
									}`}
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2">
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</button>
							<div
								className={`grid transition-all duration-300 ${
									openSection === section.id
										? "grid-rows-[1fr] opacity-100"
										: "grid-rows-[0fr] opacity-0"
								}`}>
								<div className="overflow-hidden">
									<ul className="space-y-3 pb-4 pl-2">
										{section.links.map((link) => (
											<li key={link.label}>
												<Link
													href={link.href}
													className="text-sm text-[#888] hover:text-white transition">
													{link.label}
												</Link>
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Нижняя строка */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 md:pt-0">
					<div className="flex items-center gap-3">
						<img
							src="/main-icon.jpg"
							alt="SB"
							className="h-8 md:h-10 w-auto rounded-full ring-2 ring-[#007FFF]/30"
						/>
						<span
							className="text-lg md:text-xl font-bold uppercase tracking-tight text-white"
							style={{ fontFamily: "Montserrat, sans-serif" }}>
							stuffbypoizon.ru
						</span>
					</div>
					<p className="text-[10px] md:text-[11px] text-[#666] uppercase tracking-widest">
						© 2024 STUFFBYPOIZON.RU
					</p>
				</div>
			</div>
		</footer>
	);
}
