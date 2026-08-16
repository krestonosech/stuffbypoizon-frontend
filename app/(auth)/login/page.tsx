"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";

function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect") || "/";
	const { checkAuth, user } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user) {
			router.push(redirect);
		}
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await api.post("/auth/login", { email, password });
			await checkAuth();
			router.push(redirect);
		} catch (err: any) {
			setError(err.response?.data?.error || "Ошибка входа");
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
						Вход
					</h2>
					<p className="text-gray-500 text-sm">Добро пожаловать!</p>
				</div>

				{error && (
					<div className="bg-red-50 text-red-500 p-3 text-sm mb-6 text-center rounded-lg">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-semibold mb-1.5 text-gray-700">
							Email
						</label>
						<input
							type="email"
							placeholder="example@mail.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition text-sm placeholder:text-gray-400"
							required
						/>
					</div>

					<div>
						<div className="flex justify-between items-center mb-1.5">
							<label className="text-sm font-semibold text-gray-700">
								Пароль
							</label>
							<Link
								href="/forgot-password"
								className="text-xs font-semibold text-primary hover:underline">
								Забыли пароль?
							</Link>
						</div>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
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
						{loading ? "Вход..." : "Войти"}
					</button>
				</form>

				<div className="mt-6 pt-5 border-t border-gray-100 text-center">
					<p className="text-gray-500 text-sm">
						Нет аккаунта?{" "}
						<Link
							href={`/register?redirect=${encodeURIComponent(redirect)}`}
							className="font-semibold text-primary hover:underline">
							Зарегистрироваться
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

export default function LoginPage() {
	return (
		<Suspense fallback={<div>Загрузка...</div>}>
			<LoginForm />
		</Suspense>
	);
}
