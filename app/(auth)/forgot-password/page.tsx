"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [step, setStep] = useState<"input" | "code" | "newPassword">("input");
	const [method, setMethod] = useState<"email" | "phone">("email");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSendCode = async (e: React.FormEvent) => {
		e.preventDefault();
		if (method === "email" && !email) {
			setError("Введите email");
			return;
		}
		if (method === "phone" && !phone) {
			setError("Введите телефон");
			return;
		}
		setLoading(true);
		setError("");
		try {
			await api.post("/auth/forgot-password", {
				email: method === "email" ? email : "",
				phone: method === "phone" ? phone : "",
			});
			setStep("code");
		} catch (err: any) {
			setError(err.response?.data?.error || "Ошибка");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyCode = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!code) {
			setError("Введите код");
			return;
		}
		setLoading(true);
		setError("");
		try {
			await api.post("/auth/verify-reset-code", {
				email: method === "email" ? email : "",
				phone: method === "phone" ? phone : "",
				code,
			});
			setStep("newPassword");
		} catch (err: any) {
			setError(err.response?.data?.error || "Неверный код");
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newPassword || newPassword.length < 6) {
			setError("Пароль минимум 6 символов");
			return;
		}
		setLoading(true);
		setError("");
		try {
			await api.post("/auth/reset-password", {
				email: method === "email" ? email : "",
				phone: method === "phone" ? phone : "",
				code,
				newPassword,
			});
			router.push("/login");
		} catch (err: any) {
			setError(err.response?.data?.error || "Ошибка");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gray-50">
			<button
				onClick={() => router.back()}
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
				{step === "input" && (
					<>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ fontFamily: "Montserrat, sans-serif" }}>
							Забыли пароль?
						</h2>
						<p className="text-gray-500 text-sm mb-6">
							Выберите способ восстановления
						</p>
						{error && (
							<div className="bg-red-50 text-red-500 p-3 text-sm mb-4 text-center rounded-lg">
								{error}
							</div>
						)}
						<form onSubmit={handleSendCode} className="space-y-4">
							{/* Выбор способа */}
							<div className="grid grid-cols-2 gap-2">
								<button
									type="button"
									onClick={() => setMethod("email")}
									className={`py-2 text-xs font-bold uppercase rounded-lg border transition ${method === "email" ? "border-primary bg-blue-50 text-primary" : "border-gray-200 text-gray-500"}`}>
									По Email
								</button>
								<button
									type="button"
									onClick={() => setMethod("phone")}
									className={`py-2 text-xs font-bold uppercase rounded-lg border transition ${method === "phone" ? "border-primary bg-blue-50 text-primary" : "border-gray-200 text-gray-500"}`}>
									По телефону
								</button>
							</div>

							{method === "email" ? (
								<input
									type="email"
									placeholder="Email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
								/>
							) : (
								<input
									type="tel"
									placeholder="Телефон"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
								/>
							)}

							<button
								type="submit"
								disabled={loading}
								className="w-full h-12 bg-primary text-white font-bold text-sm uppercase rounded-xl hover:opacity-90 disabled:opacity-50 transition">
								{loading ? "Отправка..." : "Отправить код"}
							</button>
						</form>
					</>
				)}

				{step === "code" && (
					<>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ fontFamily: "Montserrat, sans-serif" }}>
							Код подтверждения
						</h2>
						<p className="text-gray-500 text-sm mb-6">
							Введите код из сообщения
						</p>
						{error && (
							<div className="bg-red-50 text-red-500 p-3 text-sm mb-4 text-center rounded-lg">
								{error}
							</div>
						)}
						<form onSubmit={handleVerifyCode} className="space-y-4">
							<input
								type="text"
								placeholder="Код"
								value={code}
								onChange={(e) => setCode(e.target.value)}
								maxLength={6}
								className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center tracking-[0.5em] focus:ring-1 focus:ring-primary focus:border-primary outline-none"
							/>
							<button
								type="submit"
								className="w-full h-12 bg-primary text-white font-bold text-sm uppercase rounded-xl hover:opacity-90 transition">
								Проверить код
							</button>
						</form>
					</>
				)}

				{step === "newPassword" && (
					<>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ fontFamily: "Montserrat, sans-serif" }}>
							Новый пароль
						</h2>
						<p className="text-gray-500 text-sm mb-6">
							Придумайте новый пароль
						</p>
						{error && (
							<div className="bg-red-50 text-red-500 p-3 text-sm mb-4 text-center rounded-lg">
								{error}
							</div>
						)}
						<form onSubmit={handleResetPassword} className="space-y-4">
							<input
								type="password"
								placeholder="Новый пароль"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
							/>
							<button
								type="submit"
								disabled={loading}
								className="w-full h-12 bg-primary text-white font-bold text-sm uppercase rounded-xl hover:opacity-90 disabled:opacity-50 transition">
								{loading ? "Сохранение..." : "Сохранить пароль"}
							</button>
						</form>
					</>
				)}

				<div className="mt-6 pt-5 border-t border-gray-100 text-center">
					<Link
						href="/login"
						className="text-sm text-gray-500 hover:text-primary">
						Вернуться ко входу
					</Link>
				</div>
			</div>
		</div>
	);
}
