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
	name: string;
	phone?: string;
	role?: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	checkAuth: () => Promise<void>;
	setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const checkAuth = async () => {
		try {
			const { data } = await api.get("/auth/me");
			setUser(data.user || data.data || null);
		} catch {
			setUser(null);
			localStorage.removeItem("token");
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
