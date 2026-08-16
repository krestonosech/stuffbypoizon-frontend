"use client";

import { useAuth } from "../lib/auth-context";
import Link from "next/link";

export default function ProtectedRoute({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
				<p className="text-2xl mb-4">🔒</p>
				<h2 className="text-xl font-bold mb-2">Требуется авторизация</h2>
				<p className="text-gray-500 mb-6">
					Войдите или зарегистрируйтесь для доступа
				</p>
				<div className="flex gap-3">
					<Link
						href="/login"
						className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold uppercase">
						Войти
					</Link>
					<Link
						href="/register"
						className="border border-gray-300 px-6 py-2 rounded-full text-sm font-bold uppercase">
						Регистрация
					</Link>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
