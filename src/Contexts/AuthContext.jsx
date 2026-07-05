import { createContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Refresca el perfil del usuario autenticado desde el backend.
    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            return null;
        }
        try {
            const me = await authApi.me();
            setUser(me);
            if (me?.id) localStorage.setItem("userId", String(me.id));
            return me;
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            setUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, [refreshUser]);

    const login = async (credentials) => {
        const { token, user: basicUser } = await authApi.login(credentials);
        localStorage.setItem("token", token);
        if (basicUser?.id) localStorage.setItem("userId", String(basicUser.id));
        // Trae el perfil completo (cartas, packs, etc.).
        const full = await refreshUser();
        setUser(full || basicUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
