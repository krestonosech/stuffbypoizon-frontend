"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
	mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: "",
		phone: "",
		password: "",
		name: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const endpoint =
				mode === "login" ? "/api/auth/login" : "/api/auth/register";
			const body =
				mode === "login"
					? { email: formData.email, password: formData.password }
					: formData;

			const res = await fetch(`http://localhost:3000${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
				credentials: "include",
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Ошибка");
			}

			router.push("/");
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ошибка");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col justify-center px-4">
			<div className="max-w-md mx-auto w-full space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold">STUFF BY POIZON</h1>
					<p className="text-gray-500 mt-2">by Ivan Rudskoy</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<h2 className="text-xl font-semibold text-center">
						{mode === "login" ? "Вход" : "Регистрация"}
					</h2>

					{error && (
						<div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
							{error}
						</div>
					)}

					{mode === "register" && (
						<input
							type="text"
							placeholder="Имя"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
							required
						/>
					)}

					<input
						type="email"
						placeholder="Email"
						value={formData.email}
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
						className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
						required
					/>

					{mode === "register" && (
						<input
							type="tel"
							placeholder="Телефон (+79001234567)"
							value={formData.phone}
							onChange={(e) =>
								setFormData({ ...formData, phone: e.target.value })
							}
							className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
							required
						/>
					)}

					<input
						type="password"
						placeholder="Пароль"
						value={formData.password}
						onChange={(e) =>
							setFormData({ ...formData, password: e.target.value })
						}
						className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
						required
					/>

					<button
						type="submit"
						disabled={loading}
						className="w-full h-12 bg-black text-white rounded-xl font-medium hover:bg-gray-900 disabled:opacity-50 transition">
						{loading
							? "Загрузка..."
							: mode === "login"
								? "Войти"
								: "Зарегистрироваться"}
					</button>
				</form>

				<p className="text-center text-sm text-gray-500">
					{mode === "login" ? (
						<>
							Нет аккаунта?{" "}
							<Link
								href="/register"
								className="text-black font-medium hover:underline">
								Зарегистрироваться
							</Link>
						</>
					) : (
						<>
							Уже есть аккаунт?{" "}
							<Link
								href="/login"
								className="text-black font-medium hover:underline">
								Войти
							</Link>
						</>
					)}
				</p>
			</div>
		</div>
	);
}
