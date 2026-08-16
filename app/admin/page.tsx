"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/layout/Header";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../lib/auth-context";
import api from "../../lib/api";
import CreateProduct from "./CreateProduct";
import EditProduct from "./EditProduct";

const statusOptions = ["pending", "paid", "delivered", "cancelled"];
const statusLabels: Record<string, string> = {
	pending: "В обработке",
	paid: "Оплачен",
	delivered: "Доставлен",
	cancelled: "Отменён",
};

export default function AdminPage() {
	return (
		<ProtectedRoute>
			<AdminContent />
		</ProtectedRoute>
	);
}

function AdminContent() {
	const { user } = useAuth();
	const router = useRouter();
	const [stats, setStats] = useState({ orders: 0, products: 0 });
	const [orders, setOrders] = useState<any[]>([]);
	const [activeTab, setActiveTab] = useState<
		"dashboard" | "inventory" | "orders" | "create" | "edit"
	>("dashboard");
	const [products, setProducts] = useState<any[]>([]);
	const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
	const [editingProduct, setEditingProduct] = useState<any>(null);

	useEffect(() => {
		if (user?.role !== "admin") {
			router.push("/");
			return;
		}
		fetchStats();
		fetchOrders();
		fetchProducts();
	}, [user]);
	const fetchStats = async () => {
		try {
			const { data: o } = await api.get("/orders");
			const { data: p } = await api.get("/products?pageSize=1");
			setStats({
				orders: o.data?.length || 0,
				products: p.pagination?.total || 0,
			});
		} catch {}
	};
	const fetchOrders = async () => {
		try {
			const { data } = await api.get("/orders");
			setOrders(data.data || []);
		} catch {}
	};
	const fetchProducts = async () => {
		try {
			const { data } = await api.get("/products?pageSize=50");
			setProducts(data.data || []);
		} catch {}
	};
	const updateOrderStatus = async (orderId: string, status: string) => {
		setUpdatingOrder(orderId);
		try {
			await api.put(`/orders/${orderId}`, { status });
			fetchOrders();
		} catch {}
		setUpdatingOrder(null);
	};

	const startEdit = async (product: any) => {
		try {
			const { data } = await api.get(`/products/${product.id}`);
			const p = data.data;
			setEditingProduct(p);
			setActiveTab("edit");
		} catch {}
	};

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("ru-RU", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});

	const getStatusColor = (s: string) =>
		s === "delivered"
			? "bg-green-50 text-green-600"
			: s === "paid"
				? "bg-blue-50 text-primary"
				: s === "cancelled"
					? "bg-red-50 text-red-500"
					: "bg-yellow-50 text-yellow-600";

	if (user?.role !== "admin") return null;

	return (
		<main className="pt-16 min-h-screen flex flex-col">
			<Header />
			<div className="flex-1 flex">
				<aside className="hidden lg:block w-64 bg-white border-r border-gray-100 shrink-0">
					<div className="p-6">
						<div className="flex items-center gap-3 mb-8">
							<img src="/main-icon.jpg" alt="Logo" className="h-10 w-auto" />
							<div>
								<p
									className="text-sm font-extrabold uppercase"
									style={{ fontFamily: "Montserrat, sans-serif" }}>
									STUFFBYPOIZON
								</p>
								<p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
									Админ-панель
								</p>
							</div>
						</div>
						<nav className="space-y-1">
							{[
								{ key: "dashboard", label: "Дашборд" },
								{ key: "inventory", label: "Инвентарь" },
								{ key: "orders", label: "Заказы" },
								{ key: "create", label: "Создать товар" },
							].map((item) => (
								<button
									key={item.key}
									onClick={() => setActiveTab(item.key as any)}
									className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-xs font-bold uppercase transition cursor-pointer ${activeTab === item.key ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50"}`}>
									{item.label}
								</button>
							))}
						</nav>
					</div>
				</aside>
				<div className="flex-1 p-6 md:p-10 max-w-6xl">
					<div className="flex gap-2 mb-8 lg:hidden">
						{[
							{ key: "dashboard", label: "Дашборд" },
							{ key: "inventory", label: "Инвентарь" },
							{ key: "orders", label: "Заказы" },
							{ key: "create", label: "Создать товар" },
						].map((tab) => (
							<button
								key={tab.key}
								onClick={() => setActiveTab(tab.key as any)}
								className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition cursor-pointer ${activeTab === tab.key ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
								{tab.label}
							</button>
						))}
					</div>

					{activeTab === "dashboard" && (
						<div>
							<div className="mb-8">
								<h1
									className="text-2xl md:text-3xl font-extrabold uppercase"
									style={{ fontFamily: "Montserrat, sans-serif" }}>
									Обзор
								</h1>
								<p className="text-gray-400 text-sm mt-1">
									Показатели в реальном времени.
								</p>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
								<div className="bg-white border border-gray-100 p-6 rounded-xl">
									<p className="text-xs font-bold text-gray-400 uppercase mb-2">
										Новые заказы
									</p>
									<h3
										className="text-3xl font-extrabold"
										style={{ fontFamily: "Montserrat, sans-serif" }}>
										{stats.orders}
									</h3>
								</div>
								<div className="bg-white border border-gray-100 p-6 rounded-xl">
									<p className="text-xs font-bold text-gray-400 uppercase mb-2">
										Всего позиций
									</p>
									<h3
										className="text-3xl font-extrabold"
										style={{ fontFamily: "Montserrat, sans-serif" }}>
										{stats.products}
									</h3>
								</div>
							</div>
							<div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
								<div className="px-6 py-4 border-b border-gray-100">
									<h3 className="text-sm font-bold uppercase">
										Последние заказы
									</h3>
								</div>
								<div className="overflow-x-auto">
									<table className="w-full text-left text-sm">
										<thead>
											<tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase">
												<th className="px-6 py-3">ID</th>
												<th className="px-6 py-3">Клиент</th>
												<th className="px-6 py-3">Телефон</th>
												<th className="px-6 py-3">Связь</th>
												<th className="px-6 py-3">Username</th>
												<th className="px-6 py-3">Товары</th>
												<th className="px-6 py-3">Сумма</th>
												<th className="px-6 py-3">Дата</th>
												<th className="px-6 py-3">Статус</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-50">
											{orders.slice(0, 5).map((order) => (
												<tr key={order.id} className="hover:bg-gray-50">
													<td className="px-6 py-4 font-bold text-xs">
														#{order.id.slice(0, 8)}
													</td>
													<td className="px-6 py-4 text-xs">
														{order.user?.name || "—"}
													</td>
													<td className="px-6 py-4 text-xs text-gray-400">
														{order.user?.phone || "—"}
													</td>
													<td className="px-6 py-4 text-xs">
														{order.contactType === "telegram" ? (
															<a
																href={`https://t.me/${order.telegramNick?.replace(/^@/, "") || order.user?.phone?.replace(/\D/g, "")}`}
																target="_blank"
																rel="noopener noreferrer"
																className="text-primary font-bold hover:underline">
																Telegram
															</a>
														) : order.contactType === "whatsapp" ? (
															<a
																href={`https://wa.me/${order.user?.phone?.replace(/\D/g, "")}`}
																target="_blank"
																rel="noopener noreferrer"
																className="text-primary font-bold hover:underline">
																WhatsApp
															</a>
														) : (
															"—"
														)}
													</td>
													<td className="px-6 py-4 text-xs text-gray-400">
														{order.contactType === "telegram"
															? `@${order.telegramNick || "—"}`
															: "—"}
													</td>
													<td className="px-6 py-4 text-xs min-w-[250px]">
														{order.items?.map((item: any, i: number) => (
															<div
																key={i}
																className={
																	i > 0
																		? "mt-1.5 pt-1.5 border-t border-gray-100"
																		: ""
																}>
																<div className="font-bold">
																	{item.sku?.product?.name || "Товар"}
																</div>
																<div className="text-gray-400">
																	Размер: {item.sku?.size || "—"} US · Кол-во:{" "}
																	{item.quantity}
																</div>
															</div>
														))}
													</td>
													<td className="px-6 py-4 text-xs">
														{order.total.toLocaleString()} RUB
													</td>
													<td className="px-6 py-4 text-gray-400 text-xs">
														{formatDate(order.createdAt)}
													</td>
													<td className="px-6 py-4">
														<select
															value={order.status}
															onChange={(e) =>
																updateOrderStatus(order.id, e.target.value)
															}
															disabled={updatingOrder === order.id}
															className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase cursor-pointer border-0 outline-none ${getStatusColor(order.status)}`}>
															{statusOptions.map((s) => (
																<option key={s} value={s}>
																	{statusLabels[s]}
																</option>
															))}
														</select>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}

					{activeTab === "inventory" && (
						<div>
							<h1
								className="text-2xl md:text-3xl font-extrabold uppercase mb-8"
								style={{ fontFamily: "Montserrat, sans-serif" }}>
								Инвентарь
							</h1>
							<div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
								<div className="overflow-x-auto">
									<table className="w-full text-left text-sm">
										<thead>
											<tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase">
												<th className="px-6 py-3">Название</th>
												<th className="px-6 py-3">Артикул</th>
												<th className="px-6 py-3">Цена</th>
												<th className="px-6 py-3">На складе</th>
												<th className="px-6 py-3"></th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-50">
											{products.map((p) => (
												<tr key={p.id} className="hover:bg-gray-50">
													<td className="px-6 py-4 font-bold">{p.name}</td>
													<td className="px-6 py-4 text-gray-400 text-xs">
														{p.itemNumber}
													</td>
													<td className="px-6 py-4">
														{p.price?.toLocaleString()} RUB
													</td>
													<td className="px-6 py-4">
														<span
															className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${(p.skus?.[0]?.stock || 0) > 5 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
															{p.skus?.reduce(
																(sum: number, s: any) => sum + s.stock,
																0,
															) || 0}{" "}
															шт.
														</span>
													</td>
													<td className="px-6 py-4">
														<button
															onClick={() => startEdit(p)}
															className="text-primary font-bold text-xs hover:underline cursor-pointer">
															Изменить
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}

					{activeTab === "orders" && (
						<div>
							<h1
								className="text-2xl md:text-3xl font-extrabold uppercase mb-8"
								style={{ fontFamily: "Montserrat, sans-serif" }}>
								Заказы
							</h1>
							<div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
								<div className="overflow-x-auto">
									<table className="w-full text-left text-sm">
										<thead>
											<tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase">
												<th className="px-6 py-3">ID</th>
												<th className="px-6 py-3">Клиент</th>
												<th className="px-6 py-3">Телефон</th>
												<th className="px-6 py-3">Связь</th>
												<th className="px-6 py-3">Username</th>
												<th className="px-6 py-3">Товары</th>
												<th className="px-6 py-3">Сумма</th>
												<th className="px-6 py-3">Дата</th>
												<th className="px-6 py-3">Статус</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-50">
											{orders.map((order) => (
												<tr key={order.id} className="hover:bg-gray-50">
													<td className="px-6 py-4 font-bold text-xs">
														#{order.id.slice(0, 8)}
													</td>
													<td className="px-6 py-4 text-xs">
														{order.user?.name || "—"}
													</td>
													<td className="px-6 py-4 text-xs text-gray-400">
														{order.user?.phone || "—"}
													</td>
													<td className="px-6 py-4 text-xs">
														{order.contactType === "telegram" ? (
															<a
																href={`https://t.me/${order.telegramNick?.replace(/^@/, "") || order.user?.phone?.replace(/\D/g, "")}`}
																target="_blank"
																rel="noopener noreferrer"
																className="text-primary font-bold hover:underline">
																Telegram
															</a>
														) : order.contactType === "whatsapp" ? (
															<a
																href={`https://wa.me/${order.user?.phone?.replace(/\D/g, "")}`}
																target="_blank"
																rel="noopener noreferrer"
																className="text-primary font-bold hover:underline">
																WhatsApp
															</a>
														) : (
															"—"
														)}
													</td>
													<td className="px-6 py-4 text-xs text-gray-400">
														{order.contactType === "telegram"
															? `@${order.telegramNick || "—"}`
															: "—"}
													</td>
													<td className="px-6 py-4 text-xs min-w-[250px]">
														{order.items?.map((item: any, i: number) => (
															<div
																key={i}
																className={
																	i > 0
																		? "mt-1.5 pt-1.5 border-t border-gray-100"
																		: ""
																}>
																<div className="font-bold">
																	{item.sku?.product?.name || "Товар"}
																</div>
																<div className="text-gray-400">
																	Размер: {item.sku?.size || "—"} US · Кол-во:{" "}
																	{item.quantity}
																</div>
															</div>
														))}
													</td>
													<td className="px-6 py-4 text-xs">
														{order.total.toLocaleString()} RUB
													</td>
													<td className="px-6 py-4 text-gray-400 text-xs">
														{formatDate(order.createdAt)}
													</td>
													<td className="px-6 py-4">
														<select
															value={order.status}
															onChange={(e) =>
																updateOrderStatus(order.id, e.target.value)
															}
															disabled={updatingOrder === order.id}
															className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase cursor-pointer border-0 outline-none ${getStatusColor(order.status)}`}>
															{statusOptions.map((s) => (
																<option key={s} value={s}>
																	{statusLabels[s]}
																</option>
															))}
														</select>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}
					{activeTab === "create" && (
						<CreateProduct onSuccess={fetchProducts} />
					)}
					{activeTab === "edit" && editingProduct && (
						<EditProduct
							product={editingProduct}
							onSuccess={() => {
								setEditingProduct(null);
								fetchProducts();
								setActiveTab("inventory");
							}}
						/>
					)}
				</div>
			</div>
		</main>
	);
}
