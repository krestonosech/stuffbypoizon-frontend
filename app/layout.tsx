import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";

export const metadata: Metadata = {
	title: "STUFFBYPOIZON.RU",
	description: "Эксклюзивные кроссовки и аутентичная уличная культура",
	icons: {
		icon: "/main.png",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ru">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@400;600&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="min-h-screen flex flex-col font-[family-name:var(--font-family-inter)] bg-background text-on-background">
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
