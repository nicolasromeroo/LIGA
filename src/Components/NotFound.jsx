import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => (
    <div className="relative min-h-screen overflow-hidden bg-ink pb-bottom-nav text-[#ededea] grain grid place-items-center">
        <div className="absolute inset-0 bg-pitch-grid opacity-40" />
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-volt/[0.07] blur-[130px]" />

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 mx-auto max-w-lg px-6 text-center"
        >
            <p className="eyebrow text-volt">Fuera de juego</p>
            <h1 className="display-giant mt-4 text-[clamp(4rem,16vw,8rem)] outline-text">
                404
            </h1>
            <p className="mt-4 text-sm text-[#a3a39c] sm:text-base">
                Esta cancha no existe. Puede que el link esté roto o la página se
                haya movido.
            </p>
            <Link
                to="/"
                className="clip-btn shine relative mt-9 inline-block bg-volt px-10 py-4 font-display text-sm font-700 uppercase tracking-[0.2em] text-ink transition-all hover:bg-white"
            >
                Volver al inicio
            </Link>
        </motion.div>
    </div>
);

export default NotFound;
