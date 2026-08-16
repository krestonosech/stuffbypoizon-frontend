"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import api from "./api";

interface User {
	id: string;
	email: string;
	name: string | null;
	phone: string;
	role?: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	checkAuth: () => void;
	setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	checkAuth: () => {},
	setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const checkAuth = async (): Promise<void> => {
		try {
			const { data } = await api.get("/auth/me");
			setUser(data.user);
		} catch {
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, checkAuth, setUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
