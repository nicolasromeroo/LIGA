import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { standingsApi } from "../api";

const TeamBadge = ({ logo, name }) =>
    logo ? (
        <img
            src={logo}
            alt={name}
            className="w-12 h-12 rounded-full object-cover ring-1 ring-white/15 shrink-0"
            loading="lazy"
        />
    ) : (
        <span className="grid place-items-center w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-bold shrink-0">
            {(name || "?").slice(0, 2).toUpperCase()}
        </span>
    );

const ChampionRow = ({ c, i }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.4 }}
        className="glass rounded-xl px-5 py-4 flex items-center gap-4"
    >
        <span className="font-mega text-2xl text-volt/70 w-16 shrink-0">{c.season}</span>
        <TeamBadge logo={c.logo} name={c.team} />
        <div className="min-w-0 flex-1">
            <p className="font-display font-700 text-white truncate">{c.team}</p>
            {c.note && <p className="text-xs text-slate-500 truncate">{c.note}</p>}
        </div>
        <span className="text-2xl shrink-0" title={c.source === "ADMIN" ? "Corregido manualmente" : "Sugerido automáticamente"}>
            🏆
        </span>
    </motion.div>
);

const Champions = () => {
    const [champions, setChampions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        standingsApi
            .champions()
            .then((data) => alive && setChampions(data))
            .catch((err) => console.error("No se pudo cargar el historial de campeones:", err.message))
            .finally(() => alive && setLoading(false));
        return () => {
            alive = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#05070d] via-[#0a0e17] to-[#0b1220] text-white">
            <div className="relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-pitch-grid opacity-40" />
                <div className="absolute -top-24 right-1/3 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-10">
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow text-gold mb-2">
                        Liga Profesional Argentina
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-700 uppercase tracking-tight"
                    >
                        Historial de <span className="text-gradient-gold">campeones</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="mt-4 max-w-xl text-sm text-slate-400"
                    >
                        Se calcula solo al cerrar cada temporada: el primero de la tabla
                        final. Un admin puede corregirlo si hace falta.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton h-20 rounded-xl" />
                        ))}
                    </div>
                ) : champions.length > 0 ? (
                    <div className="space-y-3">
                        {champions.map((c, i) => (
                            <ChampionRow key={c.season} c={c} i={i} />
                        ))}
                    </div>
                ) : (
                    <div className="glass rounded-xl py-16 px-6 text-center text-slate-500">
                        <p>Todavía no hay ninguna temporada cerrada.</p>
                        <p className="mt-1 text-xs text-slate-600">
                            El campeón se calcula automáticamente cuando termina la
                            temporada en curso.
                        </p>
                    </div>
                )}

                <Link to="/tabla" className="mt-6 inline-block text-volt hover:underline text-sm">
                    ← Ver tabla de posiciones
                </Link>
            </div>
        </div>
    );
};

export default Champions;
