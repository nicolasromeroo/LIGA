import { motion } from "framer-motion";
import { PLAYER_PLACEHOLDER } from "../../api/normalize";

/* Carta de jugador estilo FUT — Tailwind + framer-motion */
const rarityStyles = {
    Común: { ring: "ring-slate-500/50", glow: "from-slate-500/20", chip: "bg-slate-600" },
    Raro: { ring: "ring-blue-400/60", glow: "from-blue-500/30", chip: "bg-blue-600" },
    Épico: { ring: "ring-purple-400/60", glow: "from-purple-500/30", chip: "bg-purple-600" },
    Legendario: { ring: "ring-yellow-400/70", glow: "from-yellow-500/30", chip: "bg-yellow-500 text-black" },
};

const PlayerCard = ({ player, onClick, selected }) => {
    const r = rarityStyles[player.rarity] || rarityStyles["Común"];
    const ovr = player.stats?.generalValue ?? player.power ?? "—";

    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.97 }}
            className={`relative w-full text-left rounded-2xl overflow-hidden ring-2 transition-all duration-300 shine ${
                selected
                    ? "ring-volt ring-glow-cyan"
                    : `${r.ring} hover:ring-volt/60`
            }`}
        >
            <div className={`absolute inset-0 bg-gradient-to-t ${r.glow} to-transparent`} />
            <div className="relative bg-gradient-to-br from-[#0e1626] to-[#05070d]">
                {/* Selección */}
                {selected && (
                    <div className="absolute top-2 right-2 z-20 grid place-items-center w-7 h-7 rounded-full bg-volt text-black shadow-lg">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}

                {/* OVR + posición */}
                <div className="absolute top-2 left-2 z-20 text-center leading-none">
                    <div className="font-stat font-700 text-2xl text-gold drop-shadow">{ovr}</div>
                    <div className="text-[10px] uppercase tracking-wider text-volt">{player.position}</div>
                </div>

                {/* Imagen */}
                <div className="relative h-36 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-transparent z-10" />
                    <img
                        src={player.image}
                        alt={player.name}
                        className="w-full h-full object-contain object-center scale-95"
                        onError={(e) => { e.target.onerror = null; e.target.src = PLAYER_PLACEHOLDER; }}
                    />
                </div>

                {/* Info */}
                <div className="relative z-10 px-3 pb-3 -mt-2">
                    <h3 className="font-display font-600 text-white truncate">{player.name}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{player.team}</p>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {[
                            { l: "ATA", v: player.stats?.attack },
                            { l: "DEF", v: player.stats?.defense },
                            { l: "VEL", v: player.stats?.speed },
                        ].map((s) => (
                            <div key={s.l} className="text-center">
                                <div className="font-stat font-700 text-sm text-white tabular-nums">{s.v ?? "—"}</div>
                                <div className="text-[9px] uppercase tracking-wider text-slate-500">{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

export default PlayerCard;
