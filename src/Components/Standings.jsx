import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { standingsApi } from "../api";

/* ------------------------------------------------------------------
   Standings — Tabla de posiciones + promedios reales (motor propio,
   no la simple tabla de la temporada en curso: /standings/promedios
   calcula el promedio de puntos por partido de las últimas temporadas,
   igual que el sistema real de descenso de AFA).
   ------------------------------------------------------------------ */

const TeamBadge = ({ logo, name }) =>
    logo ? (
        <img
            src={logo}
            alt={name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-white/15 shrink-0"
            loading="lazy"
        />
    ) : (
        <span className="grid place-items-center w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-[10px] font-bold shrink-0">
            {(name || "?").slice(0, 2).toUpperCase()}
        </span>
    );

const RowSkeleton = () => (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-white/5">
        <div className="skeleton h-4 w-6 rounded" />
        <div className="skeleton h-6 w-6 rounded-full" />
        <div className="skeleton h-4 flex-1 rounded" />
        <div className="skeleton h-4 w-10 rounded" />
        <div className="skeleton h-4 w-10 rounded" />
    </div>
);

const Standings = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("rank"); // "rank" | "promedio"

    useEffect(() => {
        let alive = true;
        standingsApi
            .promedios()
            .then((data) => alive && setRows(data))
            .catch((err) =>
                console.error("No se pudo cargar la tabla de promedios:", err.message),
            )
            .finally(() => alive && setLoading(false));
        return () => {
            alive = false;
        };
    }, []);

    const sorted = useMemo(() => {
        const copy = [...rows];
        if (sortBy === "promedio") copy.sort((a, b) => b.promedio - a.promedio);
        else copy.sort((a, b) => a.rank - b.rank);
        return copy;
    }, [rows, sortBy]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#05070d] via-[#0a0e17] to-[#0b1220] text-white">
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-pitch-grid opacity-40" />
                <div className="absolute -top-24 left-1/3 w-96 h-96 bg-volt/10 rounded-full blur-3xl" />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-10">
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow text-volt mb-2">
                        Liga Profesional Argentina
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-700 uppercase tracking-tight"
                    >
                        Tabla de <span className="text-gradient-cyan">posiciones</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="mt-4 max-w-2xl text-sm text-slate-400 leading-relaxed"
                    >
                        El descenso no se define por esta tabla sola: se calcula por el{" "}
                        <span className="text-white">promedio real de puntos por partido</span> de
                        las últimas temporadas, igual que el sistema oficial. Los últimos
                        puestos por promedio quedan marcados en rojo.
                    </motion.p>
                </div>
            </div>

            {/* Selector de orden */}
            <div className="sticky top-16 z-20 glass-strong border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex gap-2">
                    {[
                        { id: "rank", label: "Posición actual" },
                        { id: "promedio", label: "Tabla de promedios" },
                    ].map((o) => (
                        <button
                            key={o.id}
                            onClick={() => setSortBy(o.id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                sortBy === o.id
                                    ? "text-black bg-volt"
                                    : "text-slate-300 bg-white/5 hover:bg-white/10"
                            }`}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="glass rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                                    <th className="px-4 py-3 text-left w-10">#</th>
                                    <th className="px-2 py-3 text-left">Equipo</th>
                                    <th className="px-2 py-3 text-center">PJ</th>
                                    <th className="px-2 py-3 text-center font-bold text-slate-400">Pts</th>
                                    <th className="px-2 py-3 text-center hidden sm:table-cell">DIF</th>
                                    <th className="px-4 py-3 text-center text-volt">Promedio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!loading &&
                                    sorted.map((r, i) => (
                                        <tr
                                            key={r.apiTeamId}
                                            className={`border-t border-white/5 hover:bg-white/5 transition-colors ${
                                                r.zone === "relegation" ? "bg-coral/[0.07]" : ""
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <span className="relative pl-2 font-stat font-700 tabular-nums text-slate-300">
                                                    {r.zone === "relegation" && (
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-coral" />
                                                    )}
                                                    {sortBy === "promedio" ? i + 1 : r.rank}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3">
                                                <span className="flex items-center gap-2.5 min-w-0">
                                                    <TeamBadge logo={r.logo} name={r.team} />
                                                    <span className="truncate font-medium text-white">{r.team}</span>
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-center tabular-nums text-slate-400">{r.played}</td>
                                            <td className="px-2 py-3 text-center font-stat font-700 tabular-nums text-white">{r.points}</td>
                                            <td className="px-2 py-3 text-center tabular-nums text-slate-400 hidden sm:table-cell">
                                                {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`font-stat font-700 tabular-nums ${
                                                        r.zone === "relegation" ? "text-coral" : "text-volt"
                                                    }`}
                                                >
                                                    {r.promedio.toFixed(3)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {loading && (
                        <div>
                            {[...Array(8)].map((_, i) => <RowSkeleton key={i} />)}
                        </div>
                    )}

                    {!loading && rows.length === 0 && (
                        <div className="py-16 px-6 text-center text-slate-500">
                            <p>Todavía no hay datos de la temporada disponibles.</p>
                            <p className="mt-1 text-xs text-slate-600">
                                La API de resultados aún no habilitó la temporada en curso para
                                esta cuenta.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-coral/70" />
                    Zona de descenso por promedio
                    <Link to="/campeones" className="ml-auto text-volt hover:underline">
                        Ver historial de campeones →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Standings;
