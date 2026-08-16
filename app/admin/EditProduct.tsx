"use client";
import { useState } from "react";
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

interface Props {
	product: any;
	onSuccess: () => void;
}

export default function EditProduct({ product, onSuccess }: Props) {
	const [form, setForm] = useState({
		name: product.name,
		description: product.description,
		itemNumber: product.itemNumber,
		type: product.type,
		gender: product.gender,
		dropDate: product.dropDate?.split("T")[0] || "",
		totalModels: product.totalModels?.toString() || "",
		brand: product.brand || "",
		season: product.season || "",
		clothingType: product.clothingType || "",
		series: product.series || "",
	});
	const [selectedColors, setSelectedColors] = useState<string[]>(
		product.color ? product.color.split(",").filter(Boolean) : [],
	);
	const [skus, setSkus] = useState(
		product.skus?.map((s: any) => ({
			size: s.size,
			price: s.price.toString(),
			stock: s.stock.toString(),
		})) || [{ size: "", price: "", stock: "0" }],
	);
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>(
		product.images || [],
	);
	const [saving, setSaving] = useState(false);

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const fd = new FormData();
			fd.append("name", form.name);
			fd.append("description", form.description);
			fd.append("itemNumber", form.itemNumber.trim());
			fd.append("type", form.type);
			fd.append("gender", form.gender);
			fd.append("dropDate", form.dropDate);
			fd.append("totalModels", form.totalModels);
			fd.append("color", selectedColors.join(","));
			fd.append("brand", form.brand);
			fd.append("season", form.season);
			fd.append("series", form.series);
			fd.append("clothingType", form.clothingType);
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
			await fetch(`http://localhost:3001/api/admin/products/${product.id}`, {
				method: "PUT",
				credentials: "include",
				body: fd,
			});
			onSuccess();
		} catch {}
		setSaving(false);
	};

	const fields: {
		key: string;
		label: string;
		type: "text" | "select" | "date" | "number";
		options?: { value: string; label: string }[];
	}[] = [
		{ key: "name", label: "Название *", type: "text" },
		{ key: "itemNumber", label: "Артикул *", type: "text" },
		{
			key: "type",
			label: "Тип *",
			type: "select",
			options: [
				{ value: "", label: "Выбрать" },
				{ value: "Sneakers", label: "Кроссовки" },
				{ value: "Clothing", label: "Одежда" },
				{ value: "Accessories", label: "Аксессуары" },
				{ value: "Bags", label: "Сумки" },
			],
		},
		{
			key: "gender",
			label: "Пол *",
			type: "select",
			options: [
				{ value: "", label: "Выбрать" },
				{ value: "Men", label: "Мужской" },
				{ value: "Women", label: "Женский" },
				{ value: "Unisex", label: "Унисекс" },
			],
		},
		{ key: "dropDate", label: "Дата дропа *", type: "date" },
		{ key: "totalModels", label: "Выпущено моделей *", type: "number" },
		{
			key: "brand",
			label: "Бренд",
			type: "select",
			options: [
				{ value: "", label: "Выбрать" },
				...BRANDS.map((b) => ({ value: b, label: b })),
			],
		},
		{
			key: "series",
			label: "Серия",
			type: "select",
			options: [
				{ value: "", label: "Выбрать" },
				...(SERIES_BY_BRAND[form.brand] || []).map((s) => ({
					value: s,
					label: s,
				})),
			],
		},
		{
			key: "season",
			label: "Сезон",
			type: "select",
			options: [
				{ value: "", label: "Выбрать" },
				{ value: "summer", label: "Лето" },
				{ value: "winter", label: "Зима" },
				{ value: "demi", label: "Межсезонье" },
				{ value: "all", label: "Круглый год" },
			],
		},
	];

	return (
		<div>
			<h1
				className="text-2xl md:text-3xl font-extrabold uppercase mb-8"
				style={{ fontFamily: "Montserrat, sans-serif" }}>
				Изменить товар
			</h1>
			<form
				onSubmit={handleSubmit}
				className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 space-y-6 max-w-2xl">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{fields.map((f) => (
						<div key={f.key}>
							<label className="block text-xs font-bold text-gray-400 uppercase mb-1">
								{f.label}
							</label>
							{f.type === "select" ? (
								<select
									className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
									value={(form as any)[f.key]}
									onChange={(e) => {
										if (f.key === "brand") {
											setForm({ ...form, brand: e.target.value, series: "" });
										} else {
											setForm({ ...form, [f.key]: e.target.value });
										}
									}}>
									{f.options?.map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
							) : f.type === "date" ? (
								<input
									type="date"
									className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
									value={(form as any)[f.key]}
									onChange={(e) =>
										setForm({ ...form, [f.key]: e.target.value })
									}
								/>
							) : f.type === "number" ? (
								<input
									type="number"
									className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
									value={(form as any)[f.key]}
									onChange={(e) =>
										setForm({ ...form, [f.key]: e.target.value })
									}
								/>
							) : (
								<input
									className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
									value={(form as any)[f.key]}
									onChange={(e) =>
										setForm({ ...form, [f.key]: e.target.value })
									}
								/>
							)}
						</div>
					))}
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
					disabled={saving}
					className="w-full py-3 bg-primary text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer">
					{saving ? "Сохранение..." : "Сохранить изменения"}
				</button>
			</form>
		</div>
	);
}
