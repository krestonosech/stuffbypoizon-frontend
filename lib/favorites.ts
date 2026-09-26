import api from "./api";

export interface FavoriteItem {
	id: string;
	favoriteId: string;
	name: string;
	itemNumber: string;
	images: string[];
	type: string;
	gender: string;
	skus: any[];
	size: string;
	price: number;
}

export async function fetchFavorites(): Promise<FavoriteItem[]> {
	try {
		const { data } = await api.get("/favorites");
		return data.data || [];
	} catch {
		return [];
	}
}

export async function addFavorite(productId: string, size: string) {
	try {
		await api.post("/favorites", { productId, size });
		window.dispatchEvent(new Event("favoritesUpdated"));
		return true;
	} catch {
		return false;
	}
}

export async function removeFavorite(productId: string, size?: string) {
	try {
		const params = new URLSearchParams({ productId });
		if (size) params.set("size", size);
		await api.delete(`/favorites?${params.toString()}`);
		window.dispatchEvent(new Event("favoritesUpdated"));
		return true;
	} catch {
		return false;
	}
}

export async function clearFavorites() {
	try {
		await api.delete("/favorites?all=true");
		window.dispatchEvent(new Event("favoritesUpdated"));
		return true;
	} catch {
		return false;
	}
}