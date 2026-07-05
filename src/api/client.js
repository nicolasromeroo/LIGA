import axios from "axios";

// URL base del backend. Configurable por entorno (VITE_API_URL).
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: API_URL,
});

// Adjunta el token JWT (si existe) a cada request.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
