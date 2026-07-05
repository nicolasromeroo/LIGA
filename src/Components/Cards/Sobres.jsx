import { useState, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from 'howler';
import "../../assets/styles/sobres.css";
import { packsApi } from "../../api";
import { PLAYER_PLACEHOLDER } from "../../api/normalize";
import { AuthContext } from "../../Contexts/AuthContext.jsx";

const sounds = {
    whoosh: new Howl({ src: ['/sounds/whoosh.mp3'] }),
    open: new Howl({ src: ['/sounds/open.mp3'] }),
    reveal: new Howl({ src: ['/sounds/reveal.mp3'] }),
};

// Probabilidades estimadas de drop por sobre (common / rare / epic / legend).
const packTypes = [
    {
        id: "1", label: "Común", cost: 0, type: "free", accent: "slate", tier: "I",
        desc: "Cartas comunes y raras para empezar tu plantel.",
        odds: { common: 80, rare: 18, epic: 2, legend: 0 },
    },
    {
        id: "2", label: "Raro", cost: 100, type: "gold", accent: "cyan", tier: "II",
        desc: "Mayor densidad de raras y opción a épicas.",
        odds: { common: 55, rare: 33, epic: 10, legend: 2 },
    },
    {
        id: "4", label: "Épico", cost: 500, type: "elite", accent: "purple", tier: "III",
        desc: "Épica garantizada en cada apertura.",
        odds: { common: 20, rare: 40, epic: 35, legend: 5 },
    },
    {
        id: "3", label: "Legendario", cost: 1000, type: "legendary", accent: "gold", tier: "IV",
        desc: "La mayor probabilidad de una legendaria.",
        odds: { common: 5, rare: 30, epic: 45, legend: 20 },
    },
];

const ACCENTS = {
    slate: { hex: "#94a3b8", border: "border-line", glow: "rgba(148,163,184,.30)", text: "text-slate-300" },
    cyan: { hex: "#22d3ee", border: "border-cyan/40", glow: "rgba(34,211,238,.40)", text: "text-cyan" },
    purple: { hex: "#a855f7", border: "border-purple-500/40", glow: "rgba(168,85,247,.45)", text: "text-purple-400" },
    gold: { hex: "#ffd24a", border: "border-gold/50", glow: "rgba(255,210,74,.50)", text: "text-gold" },
};

const RARITY_HEX = { common: "#94a3b8", rare: "#3b82f6", epic: "#a855f7", legend: "#ffd24a" };

const rarityRing = {
    legendary: "border-gold/70",
    rare: "border-cyan/50",
    epic: "border-purple-500/60",
    common: "border-line",
};
const rarityGlowHex = {
    legendary: "#ffd24a", legend: "#ffd24a",
    epic: "#a855f7", rare: "#3b82f6", common: "#94a3b8",
};

/* Emblema angular del tier: cresta hexagonal con numeral romano. */
const Crest = ({ color, numeral, className = "", style }) => (
    <div className={`relative ${className}`} style={style}>
        <svg viewBox="0 0 64 74" className="w-full h-full" aria-hidden="true">
            <defs>
                <linearGradient id={`crest-${numeral}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.20" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path
                d="M32 3 L58 15 L58 42 L32 71 L6 42 L6 15 Z"
                fill={`url(#crest-${numeral})`}
                stroke={color}
                strokeWidth="1.4"
                strokeLinejoin="round"
            />
            <path
                d="M32 11 L50 19.5 L50 40 L32 62 L14 40 L14 19.5 Z"
                fill="none"
                stroke={color}
                strokeOpacity="0.35"
                strokeWidth="1"
                strokeLinejoin="round"
            />
        </svg>
        <span
            className="absolute inset-0 grid place-items-center font-mega text-2xl -mt-0.5"
            style={{ color }}
        >
            {numeral}
        </span>
    </div>
);

/* Chevron para CTA. */
const Chevron = ({ className = "" }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
    </svg>
);

/* Barra segmentada de probabilidades. */
const OddsBar = ({ odds }) => {
    const order = ["common", "rare", "epic", "legend"];
    return (
        <div className="w-full">
            <div className="flex h-1.5 w-full overflow-hidden bg-black/40">
                {order.map((k) =>
                    odds[k] > 0 ? (
                        <span
                            key={k}
                            style={{ width: `${odds[k]}%`, background: RARITY_HEX[k] }}
                            className="h-full transition-all"
                        />
                    ) : null
                )}
            </div>
        </div>
    );
};

const Sobres = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [isOpening, setIsOpening] = useState(false);
    const [selectedPack, setSelectedPack] = useState(null);
    const [flipped, setFlipped] = useState(null);
    const [showCards, setShowCards] = useState(false);
    const packRefs = useRef({});

    // packType es el tipo de sobre (free, gold, elite, legendary).
    const openPack = async (packType) => {
        if (!user) {
            alert("Tenés que iniciar sesión para abrir sobres.");
            return;
        }
        sounds.whoosh.play();
        setFlipped(packType);
        setSelectedPack(packType);
        setShowCards(false);

        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsOpening(true);
        sounds.open.play();

        try {
            const { cards: nuevasCartas } = await packsApi.buy(packType);
            if (!Array.isArray(nuevasCartas) || nuevasCartas.length === 0) {
                throw new Error('El servidor devolvió un sobre vacío');
            }

            await new Promise(resolve => setTimeout(resolve, 1500));
            sounds.reveal.play();
            setCards(nuevasCartas);
            setShowCards(true);
            refreshUser?.(); // actualiza los puntos en la NavBar

            setTimeout(() => {
                setIsOpening(false);
                setFlipped(null);
            }, 3000);
        } catch (err) {
            console.error("Error al abrir el sobre:", err.message);
            alert(
                err.response?.data?.message ||
                "Error al abrir el sobre. Verificá que tengas puntos suficientes."
            );
            setIsOpening(false);
            setFlipped(null);
            setCards([]);
        }
    };

    return (
        <div className="relative min-h-screen bg-ink text-[#ededea] pt-28 pb-24 px-5 sm:px-8 overflow-hidden grain">
            <div className="absolute inset-0 bg-pitch-grid opacity-40" />
            <div className="absolute -top-32 left-1/4 w-[40rem] h-[40rem] rounded-full bg-gold/10 blur-[120px]" />
            <div className="absolute top-1/3 -right-40 w-[32rem] h-[32rem] rounded-full bg-volt/[.06] blur-[130px]" />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-14 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <span className="h-px w-10 bg-gold/60" />
                        <p className="eyebrow text-gold">Ultimate Team</p>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                        className="display-giant text-[clamp(3rem,9vw,7rem)] text-white"
                    >
                        Abrí tu <span className="text-gradient-gold italic-skew">sobre</span>
                    </motion.h1>
                    <p className="mt-5 max-w-xl text-[#a3a39c] leading-relaxed">
                        Cada sobre es una tirada con probabilidades definidas. Conseguí cartas comunes,
                        raras, épicas y legendarias para armar el equipo definitivo.
                    </p>
                </div>

                {/* Grid de sobres */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {packTypes.map((pack, idx) => {
                        const a = ACCENTS[pack.accent];
                        const isThis = selectedPack === pack.type;
                        const isPremium = pack.accent === "gold" || pack.accent === "purple";
                        return (
                            <motion.div
                                key={pack.id}
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08, duration: 0.5 }}
                                className="relative h-[26rem] perspective-1400"
                                ref={el => packRefs.current[pack.id] = el}
                            >
                                <motion.div
                                    className="relative w-full h-full cursor-pointer preserve-3d"
                                    style={{
                                        transform: flipped === pack.type ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                        transition: 'transform .8s cubic-bezier(.22,1,.36,1)',
                                    }}
                                    whileHover={!isOpening && flipped !== pack.type ? { y: -14 } : {}}
                                    onClick={() => !isOpening && openPack(pack.type)}
                                >
                                    {/* Frente */}
                                    <div
                                        className={`group absolute inset-0 panel ${a.border} clip-card overflow-hidden shine backface-hidden ${isPremium ? "holo-foil" : ""} ${isThis && isOpening ? "scale-105" : ""}`}
                                        style={{
                                            boxShadow: `0 24px 70px -28px ${a.glow}`,
                                            transition: 'transform .4s, box-shadow .4s',
                                            '--foil': `${a.hex}55`,
                                            '--foil-2': `${a.hex}22`,
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-stripes opacity-25" />
                                        <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: a.hex }} />

                                        <div className="relative h-full flex flex-col p-6">
                                            {/* Cabecera: tier + índice */}
                                            <div className="flex items-start justify-between">
                                                <span className="eyebrow text-[#6b6b64]">Sobre</span>
                                                <span
                                                    className="font-mega text-lg leading-none"
                                                    style={{ color: `${a.hex}80` }}
                                                >
                                                    0{idx + 1}
                                                </span>
                                            </div>

                                            {/* Emblema */}
                                            <div className="relative flex-1 grid place-items-center">
                                                <div
                                                    className="absolute w-28 h-28 rounded-full blur-2xl aura-spin"
                                                    style={{ background: `radial-gradient(circle, ${a.hex}22, transparent 70%)` }}
                                                />
                                                <Crest
                                                    color={a.hex}
                                                    numeral={pack.tier}
                                                    className="w-[4.5rem] h-[5rem] emblem-breathe"
                                                />
                                            </div>

                                            {/* Título + descripción */}
                                            <div className="text-center">
                                                <h2 className={`display-giant text-[1.7rem] ${a.text}`}>{pack.label}</h2>
                                                <p className="text-[11px] text-[#8a8a82] mt-1.5 leading-snug min-h-[2.2rem]">{pack.desc}</p>
                                            </div>

                                            {/* Probabilidades */}
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="eyebrow text-[#5a5a52] text-[9px]">Drop rate</span>
                                                    {pack.odds.legend > 0 && (
                                                        <span className="text-[9px] font-stat font-700 uppercase tracking-wider text-gold">
                                                            {pack.odds.legend}% Legend
                                                        </span>
                                                    )}
                                                </div>
                                                <OddsBar odds={pack.odds} />
                                            </div>

                                            {/* Footer: costo + CTA */}
                                            <div className="mt-5 flex items-center justify-between">
                                                <div className="panel-2 clip-tag px-3.5 py-1.5">
                                                    {pack.cost === 0
                                                        ? <span className="text-xs font-stat font-700 tracking-wide text-volt">GRATIS · 24H</span>
                                                        : <span className="text-xs font-stat font-700 tracking-wide text-gold">{pack.cost} <span className="text-[#6b6b64]">PTS</span></span>}
                                                </div>
                                                <span className="inline-flex items-center gap-1 eyebrow text-[#5a5a52] group-hover:text-white transition-colors">
                                                    Abrir <Chevron className="group-hover:translate-x-0.5 transition-transform" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reverso (abriendo) */}
                                    <div
                                        className={`absolute inset-0 panel ${a.border} clip-card overflow-hidden grid place-items-center backface-hidden`}
                                        style={{ transform: 'rotateY(180deg)', boxShadow: `0 24px 70px -28px ${a.glow}` }}
                                    >
                                        <div className="absolute inset-0 bg-stripes opacity-30" />
                                        <div className="relative flex flex-col items-center">
                                            {/* Anillos expansivos */}
                                            <div className="relative grid place-items-center w-32 h-32">
                                                <span className="absolute w-20 h-20 rounded-full ring-pulse" style={{ border: `1.5px solid ${a.hex}` }} />
                                                <span className="absolute w-20 h-20 rounded-full ring-pulse-2" style={{ border: `1.5px solid ${a.hex}` }} />
                                                <Crest
                                                    color={a.hex}
                                                    numeral={pack.tier}
                                                    className="w-[4rem] h-[4.5rem] emblem-glow"
                                                    style={{ '--eglow': a.hex }}
                                                />
                                            </div>
                                            <div className="mt-6 w-32 h-0.5 bg-black/50 overflow-hidden">
                                                <span className="block h-full w-1/3 load-slide" style={{ background: a.hex }} />
                                            </div>
                                            <div className={`mt-4 eyebrow ${a.text}`}>Abriendo sobre</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Cartas obtenidas */}
                <AnimatePresence>
                    {showCards && cards.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="border-t border-line pt-14"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="mb-10 flex items-end justify-between flex-wrap gap-4"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="h-px w-10 bg-volt/60" />
                                        <p className="eyebrow text-volt">Resultado</p>
                                    </div>
                                    <h2 className="display-giant text-4xl md:text-5xl text-white">
                                        Cartas <span className="text-volt italic-skew">obtenidas</span>
                                    </h2>
                                </div>
                                <span className="panel-2 clip-tag px-4 py-2 text-sm font-stat font-700 text-white">
                                    {cards.length} {cards.length === 1 ? "CARTA" : "CARTAS"}
                                </span>
                            </motion.div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                                {cards.map((card, index) => {
                                    const ring = rarityRing[card.rarityKey] || rarityRing.common;
                                    const glow = rarityGlowHex[card.rarityKey] || rarityGlowHex.common;
                                    const isRare = card.rarityKey === "legendary" || card.rarityKey === "epic";
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.7, rotateY: 90, y: 30 }}
                                            animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
                                            transition={{ delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                            whileHover={{ y: -12 }}
                                            className={`group relative panel ${ring} clip-card overflow-hidden ${isRare ? "rarity-pulse" : ""}`}
                                            style={{ '--rc': glow }}
                                        >
                                            {/* barra de rareza superior */}
                                            <div className="absolute inset-x-0 top-0 h-[3px] z-20" style={{ background: glow }} />

                                            <div className="absolute z-20 top-3 right-3 panel-2 clip-tag px-2 py-0.5">
                                                <span className="text-[10px] font-stat font-700 uppercase" style={{ color: glow }}>
                                                    {card.rarity || "común"}
                                                </span>
                                            </div>
                                            <div className="relative h-44 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent z-10" />
                                                <img
                                                    src={card.image || PLAYER_PLACEHOLDER}
                                                    alt={card.name}
                                                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = PLAYER_PLACEHOLDER; }}
                                                />
                                            </div>
                                            <div className="relative z-20 px-3 pb-3 -mt-3">
                                                <h3 className="display-giant text-xl text-white truncate leading-none">{card.name}</h3>
                                                <p className="text-[11px] text-[#8a8a82] uppercase tracking-wider mt-1 truncate">{card.team} · {card.position}</p>
                                                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                                                    {[
                                                        { l: "ATA", v: card.stats?.attack },
                                                        { l: "DEF", v: card.stats?.defense },
                                                        { l: "VEL", v: card.stats?.speed },
                                                        { l: "PAS", v: card.stats?.pass },
                                                    ].map((s) => (
                                                        <div key={s.l} className="flex items-center justify-between border-b border-line pb-0.5">
                                                            <span className="eyebrow text-[#6b6b64]">{s.l}</span>
                                                            <span className="font-stat font-700 text-volt tabular-nums">{s.v ?? 0}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Sobres;
