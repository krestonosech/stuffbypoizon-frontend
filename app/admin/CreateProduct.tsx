"use client";
import { useState, useRef } from "react";
import {
	COLORS,
	SNEAKER_SIZES,
	CLOTHING_SIZES,
	DEFAULT_SIZE,
	CLOTHING_TYPES,
	getSizesByBrand,
	BRANDS,
	SERIES_BY_BRAND,
} from "./constants";

export default function CreateProduct({
	onSuccess,
}: {
	onSuccess: () => void;
}) {
	const [form, setForm] = useState({
		name: "",
		description: "",
		itemNumber: "",
		type: "",
		gender: "",
		dropDate: "",
		totalModels: "",
		brand: "",
		season: "",
		clothingType: "",
		series: "",
	});
	const [selectedColors, setSelectedColors] = useState<string[]>([]);
	const [skus, setSkus] = useState([{ size: "", price: "", stock: "0" }]);
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [creating, setCreating] = useState(false);
	const [createError, setCreateError] = useState("");
	const [createSuccess, setCreateSuccess] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const getSizeOptions = (type: string, brand: string) => {
		if (type === "Clothing") return CLOTHING_SIZES;
		if (type === "Accessories" || type === "Bags") return DEFAULT_SIZE;
		return getSizesByBrand(brand);
	};

	const toggleColor = (name: string) => {
		setSelectedColors((prev) =>
			prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
		);
	};

	const addSku = () => setSkus([...skus, { size: "", price: "", stock: "0" }]);
	const removeSku = (i: number) => setSkus(skus.filter((_, idx) => idx !== i));
	const updateSku = (i: number, field: string, value: string) => {
		const arr = [...skus];
		(arr[i] as any)[field] = value;
		setSkus(arr);
	};

	const removeImage = (i: number) => {
		setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
		setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!skus.some((s) => s.size && s.price)) {
			setCreateError("Добавьте хотя бы один размер с ценой");
			return;
		}
		setCreateError("");
		setCreateSuccess("");
		setCreating(true);
		try {
			const fd = new FormData();
			fd.append("name", form.name);
			fd.append("description", form.description);
			fd.append("itemNumber", form.itemNumber);
			fd.append("type", form.type);
			fd.append("gender", form.gender);
			fd.append("dropDate", form.dropDate);
			fd.append("totalModels", form.totalModels);
			fd.append("color", selectedColors.join(","));
			fd.append("brand", form.brand);
			fd.append("season", form.season);
			fd.append("clothingType", form.clothingType);
			fd.append("series", form.series);
			fd.append(
				"skus",
				JSON.stringify(
					skus.map((s) => ({
						size: s.size,
						price: Number(s.price),
						stock: Number(s.stock),
					})),
				),
			);
			imageFiles.forEach((f) => fd.append("images", f));
			const res = await fetch("http://localhost:3001/api/admin/products", {
				method: "POST",
				credentials: "include",
				body: fd,
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Ошибка");
			setCreateSuccess("Товар создан!");
			setForm({
				name: "",
				description: "",
				itemNumber: "",
				type: "",
				gender: "",
				dropDate: "",
				totalModels: "",
				brand: "",
				season: "",
				clothingType: "",
				series: "",
			});
			setSelectedColors([]);
			setSkus([{ size: "", price: "", stock: "0" }]);
			setImageFiles([]);
			setImagePreviews([]);
			if (fileInputRef.current) fileInputRef.current.value = "";
			onSuccess();
		} catch (err: any) {
			setCreateError(err.message || "Ошибка создания");
		} finally {
			setCreating(false);
		}
	};

	return (
		<div>
			<h1
				className="text-2xl md:text-3xl font-extrabold uppercase mb-8"
				style={{ fontFamily: "Montserrat, sans-serif" }}>
				Создать товар
			</h1>
			{createError && (
				<div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
					{createError}
				</div>
			)}
			{createSuccess && (
				<div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">
					{createSuccess}
				</div>
			)}
			<form
				onSubmit={handleCreate}
				className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 space-y-6 max-w-2xl">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
							Название *
						</label>
						<input
							className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							required
						/>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
							Артикул *
						</label>
						<input
							className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
							value={form.itemNumber}
							onChange={(e) => setForm({ ...form, itemNumber: e.target.value })}
							required
						/>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
							Тип *
						</label>
						<select
							className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
							value={form.type}
							onChange={(e) => {
								setForm({ ...form, type: e.target.value });
								setSkus([{ size: "", price: "", stock: "0" }]);
							}}
							required>
							<option value="">Выбрать</option>
							<option value="Sneakers">Кроссовки</option>
							<option value="Clothing">Одежда</option>
							<option value="Accessories">Аксессуары</option>
							<option value="Bags">Сумки</option>
						</select>
					</div>
					{form.type === "Clothing" && (
						<div>
							<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
								Тип одежды
							</label>
							<select
								className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
								value={form.clothingType}
								onChange={(e) =>
									setForm({ ...form, clothingType: e.target.value })
								}>
								<option value="">Выбрать</option>
								{CLOTHING_TYPES.map((t) => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
						</div>
					)}
					<div>
						<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
							Пол *
						</label>
						<select
							className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
							value={form.gender}
							onChange={(e) => setForm({ ...form, gender: e.target.value })}
							required>
							<option value="">Выбрать</option>
							<option value="Men">Мужской</option>
							<option value="Women">Женский</option>
							<option value="Unisex">Унисекс</option>
						</select>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
							Дата дропа *
						</label>
						<input
							type="date"
							className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
							value={form.dropDate}
							onChange={(e) => setForm({ ...form, dropDate: e.target.value })}
							required
						/>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
							Выпущено моделей *
						</label>
						<input
							type="number"
							className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
							value={form.totalModels}
							onChange={(e) =>
								setForm({ ...form, totalModels: e.target.value })
							}
							required
						/>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
							Цвета
						</label>
						<div className="flex flex-wrap gap-2">
							{COLORS.map((c) => (
								<button
									key={c.name}
									type="button"
									onClick={() => toggleColor(c.name)}
									className={`w-7 h-7 rounded-full border-2 transition ${selectedColors.includes(c.name) ? "border-primary scale-110" : "border-gray-200 hover:border-gray-400"}`}
									style={{ background: c.hex }}
									title={c.name}
								/>
							))}
						</div>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
							Бренд
						</label>
						<select
							className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
							value={form.brand}
							onChange={(e) => setForm({ ...form, brand: e.target.value })}>
							<option value="">Выбрать</option>
							{BRANDS.map((b) => (
								<option key={b} value={b}>
									{b}
								</option>
							))}
						</select>
					</div>
					{form.brand && SERIES_BY_BRAND[form.brand] && (
						<div>
							<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
								Серия
							</label>
							<select
								className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
								value={form.series || ""}
								onChange={(e) => setForm({ ...form, series: e.target.value })}>
								<option value="">Выбрать</option>
								{SERIES_BY_BRAND[form.brand]?.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</select>
						</div>
					)}
					<div>
						<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
							Сезон
						</label>
						<select
							className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
							value={form.season}
							onChange={(e) => setForm({ ...form, season: e.target.value })}>
							<option value="">Выбрать</option>
							<option value="summer">Лето</option>
							<option value="winter">Зима</option>
							<option value="demi">Межсезонье</option>
							<option value="all">Круглый год</option>
						</select>
					</div>
				</div>
				<div>
					<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
						Описание *
					</label>
					<textarea
						className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
						rows={4}
						value={form.description}
						onChange={(e) => setForm({ ...form, description: e.target.value })}
						required
					/>
				</div>
				<div>
					<label className="block text-xs font-bold text-gray-400 uppercase mb-2">
						SKU (размеры, цены, сток) *
					</label>
					<div className="space-y-3">
						{skus.map((sku, i) => (
							<div key={i} className="flex gap-2 items-end">
								<select
									value={sku.size}
									onChange={(e) => updateSku(i, "size", e.target.value)}
									className="w-24 border border-gray-200 rounded-lg p-2 text-sm"
									required>
									<option value="">Размер</option>
									{getSizeOptions(form.type, form.brand).map((s) => (
										<option key={s} value={s}>
											{s}
										</option>
									))}
								</select>
								<input
									placeholder="Цена"
									type="number"
									value={sku.price}
									onChange={(e) => updateSku(i, "price", e.target.value)}
									className="flex-1 border border-gray-200 rounded-lg p-2 text-sm"
									required
								/>
								<input
									placeholder="Сток"
									type="number"
									value={sku.stock}
									onChange={(e) => updateSku(i, "stock", e.target.value)}
									className="w-20 border border-gray-200 rounded-lg p-2 text-sm"
								/>
								{skus.length > 1 && (
									<button
										type="button"
										onClick={() => removeSku(i)}
										className="text-red-400 hover:text-red-600 text-xl">
										&times;
									</button>
								)}
							</div>
						))}
						<button
							type="button"
							onClick={addSku}
							className="text-xs font-bold text-primary hover:underline">
							+ Добавить размер
						</button>
					</div>
				</div>
				<div>
					<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
						Фото (можно несколько)
					</label>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						multiple
						onChange={(e) => {
							const arr = Array.from(e.target.files || []);
							setImageFiles((prev) => [...prev, ...arr]);
							setImagePreviews((prev) => [
								...prev,
								...arr.map((f) => URL.createObjectURL(f)),
							]);
						}}
						className="text-sm"
					/>
					{imagePreviews.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-3">
							{imagePreviews.map((prev, i) => (
								<div
									key={i}
									className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
									<img
										src={prev}
										alt=""
										className="w-full h-full object-cover"
									/>
									<button
										type="button"
										onClick={() => removeImage(i)}
										className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
										&times;
									</button>
								</div>
							))}
						</div>
					)}
				</div>
				<button
					type="submit"
					disabled={creating}
					className="w-full py-3 bg-primary text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer">
					{creating ? "Создание..." : "Создать товар"}
				</button>
			</form>
		</div>
	);
}
