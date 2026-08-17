import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sportdbApi } from "../api";

/* Ticker horizontal de partidos en vivo (estilo cintillo deportivo).
   Datos reales vía /sportapi/live; si no hay partidos en vivo, el ticker
   simplemente no se muestra (nunca rellena con datos falsos). */
const Item = ({ g }) => (
    <span className="inline-flex items-center gap-2 px-5 text-sm whitespace-nowrap">
        <span>{g.country}</span>
        <span className="text-slate-300">{g.home}</span>
        <span className="font-stat font-700 text-white tabular-nums">
            {g.homeScore ?? 0}-{g.awayScore ?? 0}
        </span>
        <span className="text-slate-300">{g.away}</span>
        <span className="font-stat text-xs text-live">
            {typeof g.minute === "number" ? `${g.minute}'` : "EN VIVO"}
        </span>
        <span className="text-slate-700">•</span>
    </span>
);

const LiveTicker = () => {
    const [live, setLive] = useState([]);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            try {
                const data = await sportdbApi.live();
                if (alive) setLive(data);
            } catch (err) {
                console.error("No se pudo cargar el ticker en vivo:", err.message);
            }
        };
        load();
        const poll = setInterval(load, 30000);
        return () => {
            alive = false;
            clearInterval(poll);
        };
    }, []);

    if (live.length === 0) return null;

    const row = [...live, ...live];
    return (
        <Link to="/live" className="block group relative z-30 bg-[#05070d] border-b border-white/5 overflow-hidden">
            <div className="flex items-center">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-live to-red-700 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[11px] font-700 uppercase tracking-wider text-white">En vivo</span>
                </div>
                <div className="relative flex-1 overflow-hidden">
                    <div className="flex animate-[marquee_28s_linear_infinite] group-hover:[animation-play-state:paused]">
                        {row.map((g, i) => <Item key={`${g.id}-${i}`} g={g} />)}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default LiveTicker;
