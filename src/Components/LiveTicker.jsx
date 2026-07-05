import { Link } from "react-router-dom";

/* Ticker horizontal de partidos en vivo (estilo cintillo deportivo).
   Reemplazá TICKER por datos reales de tu API/WebSocket. */
const TICKER = [
    { l: "🇦🇷", h: "River", a: "Boca", hs: 2, as: 1, m: "67'" },
    { l: "🇪🇸", h: "R. Madrid", a: "Barcelona", hs: 3, as: 2, m: "88'" },
    { l: "🏴", h: "Man City", a: "Liverpool", hs: 1, as: 1, m: "ENT" },
    { l: "🇦🇷", h: "Racing", a: "Independiente", hs: 0, as: 0, m: "23'" },
    { l: "🇮🇹", h: "Inter", a: "Milan", hs: 2, as: 0, m: "FIN" },
];

const Item = ({ g }) => (
    <span className="inline-flex items-center gap-2 px-5 text-sm whitespace-nowrap">
        <span>{g.l}</span>
        <span className="text-slate-300">{g.h}</span>
        <span className="font-stat font-700 text-white tabular-nums">{g.hs}-{g.as}</span>
        <span className="text-slate-300">{g.a}</span>
        <span className={`font-stat text-xs ${g.m === "FIN" ? "text-slate-500" : "text-live"}`}>{g.m}</span>
        <span className="text-slate-700">•</span>
    </span>
);

const LiveTicker = () => {
    const row = [...TICKER, ...TICKER];
    return (
        <Link to="/live" className="block group relative z-30 bg-[#05070d] border-b border-white/5 overflow-hidden">
            <div className="flex items-center">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-live to-red-700 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[11px] font-700 uppercase tracking-wider text-white">En vivo</span>
                </div>
                <div className="relative flex-1 overflow-hidden">
                    <div className="flex animate-[marquee_28s_linear_infinite] group-hover:[animation-play-state:paused]">
                        {row.map((g, i) => <Item key={i} g={g} />)}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default LiveTicker;
