import { API_URL } from "./client";

// Adaptadores entre el modelo del backend (campos planos, rareza en mayúsculas)
// y la forma que esperan los componentes del front (stats anidadas, rareza en
// español / claves de estilo).

// Imagen de reemplazo (silueta) para jugadores sin foto.
export const PLAYER_PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='340'>
            <rect width='100%' height='100%' fill='#11141d'/>
            <g fill='#2a2f3d'>
                <circle cx='150' cy='120' r='55'/>
                <path d='M55 320c0-60 45-95 95-95s95 35 95 95z'/>
            </g>
        </svg>`,
    );

// Convierte la ruta de imagen del back en una URL usable por el navegador.
// - URLs absolutas (http...) o data URIs se dejan igual.
// - Rutas relativas servidas por el back (ej: /players/x.png) se prefijan.
export const toImageUrl = (img) => {
    if (!img) return PLAYER_PLACEHOLDER;
    if (/^(https?:)?\/\//.test(img) || img.startsWith("data:")) return img;
    return `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

const RARITY_KEY = {
    comun: "common",
    common: "common",
    rara: "rare",
    raro: "rare",
    rare: "rare",
    epica: "epic",
    epico: "epic",
    epic: "epic",
    legendaria: "legendary",
    legendario: "legendary",
    legendary: "legendary",
};

const RARITY_LABEL = {
    common: "Común",
    rare: "Raro",
    epic: "Épico",
    legendary: "Legendario",
};

export const rarityKey = (r) => RARITY_KEY[String(r || "").toLowerCase()] || "common";
export const rarityLabel = (r) => RARITY_LABEL[rarityKey(r)] || "Común";

// Jugador del catálogo (modelo Player).
export const normalizePlayer = (p = {}) => ({
    _id: p.id,
    id: p.id,
    playerId: p.id,
    name: p.name,
    team: p.team,
    club: p.club,
    nationality: p.nationality,
    position: p.position,
    image: toImageUrl(p.image),
    rarity: rarityLabel(p.rarity),
    rarityKey: rarityKey(p.rarity),
    power: p.overall ?? p.rating ?? 0,
    stats: {
        generalValue: p.overall ?? p.rating ?? 0,
        rating: p.rating,
        attack: p.attack,
        defense: p.defense,
        speed: p.speed,
        pass: p.pass,
        dribble: p.dribble,
        vision: p.vision,
    },
});

// Carta poseída por un usuario (modelo PlayerCard, incluye player + su rareza).
export const normalizeCard = (c = {}) => {
    const base = normalizePlayer(c.player || {});
    return {
        ...base,
        _id: c.id, // id único de la carta (para selección en PvP)
        id: c.id,
        cardId: c.id,
        playerId: c.playerId ?? base.playerId,
        rarity: rarityLabel(c.rarity),
        rarityKey: rarityKey(c.rarity),
    };
};

// Liga a la que pertenece el fixture (solo se configuró Liga Profesional
// Argentina del lado del back, pero el helper queda genérico por si se suma
// otra liga más adelante).
const flagForLeague = (league = "") =>
    /argentin/i.test(league) ? "🇦🇷" : "⚽";

const FIXTURE_STATUS = {
    live: "live",
    ft: "ft",
    scheduled: "scheduled",
    cancelled: "cancelled",
    other: "scheduled",
};

// Partido real (modelo NormalizedFixture del back /sportapi) → forma que
// esperan LiveScores/LiveTicker/Dashboard. No inventa eventos ni minuto:
// lo que la API no da, se deja vacío/null en vez de simularlo.
export const normalizeFixture = (f = {}) => ({
    id: f.id,
    league: f.league,
    country: flagForLeague(f.league),
    home: f.home,
    away: f.away,
    homeLogo: f.homeLogo,
    awayLogo: f.awayLogo,
    homeScore: f.homeScore,
    awayScore: f.awayScore,
    minute: f.minute,
    startTime: f.startTime,
    status: FIXTURE_STATUS[f.status] || "scheduled",
    time: f.startTime
        ? new Date(f.startTime).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
          })
        : null,
    events: [],
});

// Usuario autenticado: agrega alias usados por la UI (pts, role en minúsculas).
export const normalizeUser = (u = {}) => ({
    ...u,
    pts: u.points ?? 0,
    role: String(u.role || "user").toLowerCase(),
});
