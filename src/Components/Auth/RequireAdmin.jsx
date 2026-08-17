import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../Contexts/AuthContext.jsx";

// Guarda de ruta para /panel: sin esto, cualquiera podía navegar directo a
// la URL y usar el CRUD de jugadores/noticias (el link del NavBar solo se
// ocultaba visualmente, no bloqueaba nada).
const RequireAdmin = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-ink">
                <motion.div
                    className="h-10 w-10 rounded-full border-2 border-volt/30 border-t-volt"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                />
            </div>
        );
    }

    if (user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RequireAdmin;
