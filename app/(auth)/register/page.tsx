"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";

function RegisterForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect") || "/";
	const { checkAuth, user } = useAuth();
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user) {
			router.push(redirect);
		}
	}, [user]);

	const update = (field: string, value: string) =>
		setForm({ ...form, [field]: value });

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await api.post("/auth/register", form);
			localStorage.setItem("token", response.data.token);
			await checkAuth();
			router.push(redirect);
		} catch (err: any) {
			setError(err.response?.data?.error || "Ошибка регистрации");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gray-50">
			<button
				type="button"
				onClick={() => {
					if (
						document.referrer &&
						!document.referrer.includes("/login") &&
						!document.referrer.includes("/register")
					) {
						router.back();
					} else {
						router.push("/");
					}
				}}
				className="absolute top-6 left-6 text-gray-400 hover:text-black transition text-2xl">
				&#8249;
			</button>
			<div className="mb-10 flex flex-col items-center">
				<img
					src="/main-icon.jpg"
					alt="Logo"
					className="w-20 h-20 rounded-full mb-4"
				/>
				<h1
					className="text-2xl font-extrabold tracking-tight uppercase"
					style={{ fontFamily: "Montserrat, sans-serif" }}>
					STUFFBYPOIZON
				</h1>
			</div>

			<div className="bg-white border border-gray-200 w-full max-w-[400px] p-8 rounded-2xl shadow-sm">
				<div className="mb-6">
					<h2
						className="text-2xl font-bold mb-1"
						style={{ fontFamily: "Montserrat, sans-serif" }}>
						Регистрация
					</h2>
					<p className="text-gray-500 text-sm">Создайте новый аккаунт</p>
				</div>

				{error && (
					<div className="bg-red-50 text-red-500 p-3 text-sm mb-6 text-center rounded-lg">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-semibold mb-1.5 text-gray-700">
							Имя
						</label>
						<input
							type="text"
							placeholder="Иван"
							value={form.name}
							onChange={(e) => update("name", e.target.value)}
							className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition text-sm placeholder:text-gray-400"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold mb-1.5 text-gray-700">
							Email
						</label>
						<input
							type="email"
							placeholder="example@mail.com"
							value={form.email}
							onChange={(e) => update("email", e.target.value)}
							className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition text-sm placeholder:text-gray-400"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold mb-1.5 text-gray-700">
							Телефон
						</label>
						<input
							type="tel"
							placeholder="+7 900 123 45 67"
							value={form.phone}
							onChange={(e) => {
								let raw = e.target.value.replace(/\D/g, "");
								if (raw.length === 0) {
									update("phone", "");
									return;
								}
								if (raw.startsWith("7") || raw.startsWith("8"))
									raw = raw.slice(1);
								raw = raw.slice(0, 10);
								if (raw.length === 0) {
									update("phone", "");
									return;
								}
								let masked = "+7";
								if (raw.length > 0) masked += " " + raw.slice(0, 3);
								if (raw.length > 3) masked += " " + raw.slice(3, 6);
								if (raw.length > 6) masked += " " + raw.slice(6, 8);
								if (raw.length > 8) masked += " " + raw.slice(8, 10);
								update("phone", masked);
							}}
							className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition text-sm placeholder:text-gray-400"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold mb-1.5 text-gray-700">
							Пароль
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={form.password}
								onChange={(e) => update("password", e.target.value)}
								className="w-full h-12 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition text-sm placeholder:text-gray-400"
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition">
								{showPassword ? "🙈" : "👁"}
							</button>
						</div>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full h-12 bg-primary text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:opacity-90 disabled:opacity-50 transition active:scale-[0.98]">
						{loading ? "Регистрация..." : "Зарегистрироваться"}
					</button>
				</form>

				<div className="mt-6 pt-5 border-t border-gray-100 text-center">
					<p className="text-gray-500 text-sm">
						Уже есть аккаунт?{" "}
						<Link
							href={`/login?redirect=${encodeURIComponent(redirect)}`}
							className="font-semibold text-primary hover:underline">
							Войти
						</Link>
					</p>
				</div>
			</div>

			<footer className="mt-16 text-center">
				<p className="text-xs text-gray-400">
					© 2024 stuffbypoizon.ru. Все права защищены.
				</p>
			</footer>
		</div>
	);
}

export default function RegisterPage() {
	return (
		<Suspense fallback={<div>Загрузка...</div>}>
			<RegisterForm />
		</Suspense>
	);
}
