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

// Si el token expiró/es inválido, cualquier request protegido devuelve 401:
// antes esto fallaba en silencio (cada componente lo tragaba con un
// console.error). Se limpia la sesión y se manda a /login. No aplica a los
// 401 de /auth/login (credenciales incorrectas es un flujo normal, no una
// sesión vencida) ni si ya estábamos deslogueados.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || "";
        const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");
        const hadToken = Boolean(localStorage.getItem("token"));

        if (status === 401 && !isAuthEndpoint && hadToken) {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            if (window.location.pathname !== "/login") {
                window.location.assign("/login");
            }
        }

        return Promise.reject(error);
    },
);

export default api;
