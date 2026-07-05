import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sportdbApi } from "../api";

/* ------------------------------------------------------------------
   LiveScores — Centro de partidos en vivo (estilo Promiedos)
   Los datos de abajo son MOCK listos para reemplazar por tu API/WebSocket.
   Ej:  socket.on("match_update", setMatches)
        axios.get("/api/matches/live").then(r => setMatches(r.data))
   ------------------------------------------------------------------ */

const MOCK_MATCHES = [
    {
        id: 1, league: "Liga Profesional", country: "🇦🇷",
        home: "River Plate", away: "Boca Juniors",
        homeScore: 2, awayScore: 1, minute: 67, status: "live",
        events: ["⚽ 12' Borja", "⚽ 41' Cavani", "⚽ 58' Colidio"],
    },
    {
        id: 2, league: "Liga Profesional", country: "🇦🇷",
        home: "Racing Club", away: "Independiente",
        homeScore: 0, awayScore: 0, minute: 23, status: "live", events: [],
    },
    {
        id: 3, league: "LaLiga", country: "🇪🇸",
        home: "Real Madrid", away: "Barcelona",
        homeScore: 3, awayScore: 2, minute: 88, status: "live",
        events: ["⚽ 9' Vinícius", "⚽ 34' Lewandowski", "⚽ 51' Bellingham"],
    },
    {
        id: 4, league: "Premier League", country: "🏴",
        home: "Man. City", away: "Liverpool",
        homeScore: 1, awayScore: 1, minute: "HT", status: "ht", events: [],
    },
    {
        id: 5, league: "LaLiga", country: "🇪🇸",
        home: "Atlético", away: "Sevilla",
        homeScore: 2, awayScore: 0, status: "ft", events: [],
    },
    {
        id: 6, league: "Premier League", country: "🏴",
        home: "Arsenal", away: "Chelsea",
        homeScore: null, awayScore: null, time: "17:30", status: "scheduled", events: [],
    },
    {
        id: 7, league: "Serie A", country: "🇮🇹",
        home: "Inter", away: "Milan",
        homeScore: null, awayScore: null, time: "19:45", status: "scheduled", events: [],
    },
];

const StatusBadge = ({ m }) => {
    if (m.status === "live")
        return (
            <span className="flex items-center gap-1.5 text-live font-stat font-700 text-sm">
                <span className="live-dot" />
                {m.minute}'
            </span>
        );
    if (m.status === "ht")
        return <span className="text-gold font-stat font-700 text-sm">ENT</span>;
    if (m.status === "ft")
        return <span className="text-slate-500 font-stat font-700 text-sm">FIN</span>;
    return <span className="text-volt font-stat font-700 text-sm">{m.time}</span>;
};

const TeamRow = ({ name, score, winner, dim }) => (
    <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid place-items-center w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-[10px] font-bold shrink-0">
                {name.slice(0, 2).toUpperCase()}
            </span>
            <span className={`truncate text-sm font-medium ${dim ? "text-slate-400" : "text-white"}`}>
                {name}
            </span>
        </div>
        <span
            className={`font-stat font-700 text-lg tabular-nums w-6 text-center ${
                score === null ? "text-slate-600" : winner ? "text-volt" : "text-white"
            }`}
        >
            {score === null ? "-" : score}
        </span>
    </div>
);

const MatchCard = ({ m, i }) => {
    const live = m.status === "live";
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                live
                    ? "glass-strong border-volt/25 hover:ring-glow-cyan"
                    : "glass hover:border-white/20"
            }`}
        >
            {live && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-live to-red-700" />
            )}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-400 truncate">{m.country} {m.league}</span>
                <StatusBadge m={m} />
            </div>
            <div className="space-y-2">
                <TeamRow name={m.home} score={m.homeScore} winner={m.homeScore > m.awayScore} dim={m.status === "ft" && m.homeScore < m.awayScore} />
                <TeamRow name={m.away} score={m.awayScore} winner={m.awayScore > m.homeScore} dim={m.status === "ft" && m.awayScore < m.homeScore} />
            </div>
            {m.events.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-x-3 gap-y-1">
                    {m.events.map((e, idx) => (
                        <span key={idx} className="text-[11px] text-slate-400">{e}</span>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

const LiveScores = () => {
    const [matches, setMatches] = useState(MOCK_MATCHES);
    const [filter, setFilter] = useState("Todos");

    // Trae partidos REALES desde la API de fútbol (vía /sportdb/matches).
    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await sportdbApi.matches();
                if (data.length) setMatches(data);
            } catch (err) {
                console.error("No se pudieron cargar los partidos:", err.message);
            }
        };
        fetchMatches();
        const poll = setInterval(fetchMatches, 30000);
        return () => clearInterval(poll);
    }, []);

    // Reloj en vivo: avanza el minuto de los partidos en juego.
    useEffect(() => {
        const id = setInterval(() => {
            setMatches((prev) =>
                prev.map((m) =>
                    m.status === "live" && typeof m.minute === "number" && m.minute < 90
                        ? { ...m, minute: m.minute + 1 }
                        : m
                )
            );
        }, 5000);
        return () => clearInterval(id);
    }, []);

    const leagues = ["Todos", "En Vivo", ...new Set(matches.map((m) => m.league))];

    const filtered = useMemo(() => {
        if (filter === "Todos") return matches;
        if (filter === "En Vivo") return matches.filter((m) => m.status === "live" || m.status === "ht");
        return matches.filter((m) => m.league === filter);
    }, [matches, filter]);

    const liveCount = matches.filter((m) => m.status === "live").length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#05070d] via-[#0a0e17] to-[#0b1220] text-white">
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-pitch-grid opacity-40" />
                <div className="absolute -top-24 left-1/3 w-96 h-96 bg-volt/10 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-10">
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow text-volt mb-2">
                        Centro de partidos
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-700 uppercase tracking-tight"
                    >
                        Resultados <span className="text-gradient-cyan">en vivo</span>
                    </motion.h1>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 flex items-center gap-2 text-slate-300">
                        <span className="live-dot" />
                        <span className="font-stat font-600">{liveCount} partidos en juego</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-sm text-slate-400">Actualización automática</span>
                    </motion.div>
                </div>
            </div>

            {/* Filtros */}
            <div className="sticky top-16 z-20 glass-strong border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
                    {leagues.map((l) => (
                        <button
                            key={l}
                            onClick={() => setFilter(l)}
                            className={`relative shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                filter === l
                                    ? "text-black bg-volt"
                                    : "text-slate-300 bg-white/5 hover:bg-white/10"
                            }`}
                        >
                            {l === "En Vivo" && <span className="live-dot mr-1.5 align-middle" />}
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grilla de partidos */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <AnimatePresence mode="popLayout">
                    <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((m, i) => (
                            <MatchCard key={m.id} m={m} i={i} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filtered.length === 0 && (
                    <p className="text-center text-slate-500 py-20">No hay partidos para este filtro.</p>
                )}
            </div>
        </div>
    );
};

export default LiveScores;
