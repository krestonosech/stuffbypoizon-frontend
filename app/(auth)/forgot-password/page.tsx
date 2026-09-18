"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep("code");
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-reset-code", { email, code });
      setStep("password");
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        code,
        newPassword: password,
      });
      router.push("/login?reset=success");
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gray-50">
      <Link
        href="/login"
        className="absolute top-6 left-6 text-2xl text-gray-400 hover:text-black">
        &#8249;
      </Link>
      <div className="bg-white border border-gray-200 w-full max-w-[400px] p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold mb-1">Восстановление пароля</h2>
        {step === "email" && (
          <form onSubmit={handleEmail} className="space-y-4 mt-6">
            <p className="text-gray-500 text-sm">
              Введите email, указанный при регистрации
            </p>
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              required
            />
            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}
            <button
              disabled={loading}
              className="w-full h-12 bg-primary text-white font-bold uppercase rounded-xl">
              {loading ? "Отправка..." : "Отправить код"}
            </button>
          </form>
        )}
        {step === "code" && (
          <form onSubmit={handleCode} className="space-y-4 mt-6">
            <p className="text-gray-500 text-sm">
              Введите код из письма ({email})
            </p>
            <input
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center text-lg tracking-widest"
              required
            />
            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}
            <button
              disabled={loading}
              className="w-full h-12 bg-primary text-white font-bold uppercase rounded-xl">
              {loading ? "Проверка..." : "Подтвердить"}
            </button>
          </form>
        )}
        {step === "password" && (
          <form onSubmit={handlePassword} className="space-y-4 mt-6">
            <p className="text-gray-500 text-sm">Придумайте новый пароль</p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Новый пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition cursor-pointer">
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Повторите пароль"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-12 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition cursor-pointer">
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}
            <button
              disabled={loading}
              className="w-full h-12 bg-primary text-white font-bold uppercase rounded-xl cursor-pointer">
              {loading ? "Сохранение..." : "Сохранить пароль"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
