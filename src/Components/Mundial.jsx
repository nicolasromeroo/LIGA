import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mundialApi } from "../api";

/* ------------------------------------------------------------------
   Mundial — Copa Mundial 2026 en tiempo real (estilo Promiedos)
   Datos reales vía backend (/mundial/*), que consume la API pública
   de FIFA con cache en Redis. Se refresca solo cada 30s.
   ------------------------------------------------------------------ */

const TZ = "America/Argentina/Buenos_Aires";

const dayKey = (ms) =>
    new Date(ms).toLocaleDateString("es-AR", { timeZone: TZ });

const dayLabel = (ms) => {
    const today = dayKey(Date.now());
    const tomorrow = dayKey(Date.now() + 86400000);
    const key = dayKey(ms);
    if (key === today) return "Hoy";
    if (key === tomorrow) return "Mañana";
    return new Date(ms).toLocaleDateString("es-AR", {
        timeZone: TZ,
        weekday: "long",
        day: "2-digit",
        month: "long",
    });
};

const StatusBadge = ({ m }) => {
    if (m.status === "live")
        return (
            <span className="flex items-center gap-1.5 text-live font-stat font-700 text-sm">
                <span className="live-dot" />
                {m.minute ? `${m.minute}'` : "EN VIVO"}
            </span>
        );
    if (m.status === "ft")
        return <span className="text-slate-500 font-stat font-700 text-sm">FIN</span>;
    return (
        <span className="text-volt font-stat font-700 text-sm">
            {m.time
                ? new Date(m.startTime).toLocaleTimeString("es-AR", {
                      timeZone: TZ,
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                  })
                : "—"}
        </span>
    );
};

const Flag = ({ src, name }) =>
    src ? (
        <img
            src={src}
            alt={name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-white/15 shrink-0"
            loading="lazy"
        />
    ) : (
        <span className="grid place-items-center w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-[10px] font-bold shrink-0">
            {(name || "?").slice(0, 2).toUpperCase()}
        </span>
    );

const TeamRow = ({ name, flag, score, penalties, winner, dim }) => (
    <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
            <Flag src={flag} name={name} />
            <span className={`truncate text-sm font-medium ${dim ? "text-slate-400" : "text-white"}`}>
                {name}
            </span>
        </div>
        <span className="flex items-center gap-1">
            {penalties !== null && penalties !== undefined && (
                <span className="text-[11px] text-slate-400 font-stat">({penalties})</span>
            )}
            <span
                className={`font-stat font-700 text-lg tabular-nums w-6 text-center ${
                    score === null || score === undefined
                        ? "text-slate-600"
                        : winner
                          ? "text-volt"
                          : "text-white"
                }`}
            >
                {score === null || score === undefined ? "-" : score}
            </span>
        </span>
    </div>
);

const MatchCard = ({ m, i }) => {
    const live = m.status === "live";
    const hasPens = m.homePenalties !== null && m.homePenalties !== undefined;
    const homeWins =
        m.status === "ft" &&
        (m.winnerIsHome === true ||
            (m.winnerIsHome === null &&
                (hasPens ? m.homePenalties > m.awayPenalties : m.homeScore > m.awayScore)));
    const awayWins =
        m.status === "ft" &&
        (m.winnerIsHome === false ||
            (m.winnerIsHome === null &&
                (hasPens ? m.awayPenalties > m.homePenalties : m.awayScore > m.homeScore)));

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                live ? "glass-strong border-volt/25 hover:ring-glow-cyan" : "glass hover:border-white/20"
            }`}
        >
            {live && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-live to-red-700" />
            )}
            <div className="flex items-center justify-between mb-3 gap-2">
                <span className="text-[11px] text-slate-400 truncate">
                    🏆 {m.group || m.stage}
                </span>
                <StatusBadge m={m} />
            </div>
            <div className="space-y-2">
                <TeamRow
                    name={m.home}
                    flag={m.homeFlag}
                    score={m.homeScore}
                    penalties={hasPens ? m.homePenalties : null}
                    winner={homeWins}
                    dim={awayWins}
                />
                <TeamRow
                    name={m.away}
                    flag={m.awayFlag}
                    score={m.awayScore}
                    penalties={hasPens ? m.awayPenalties : null}
                    winner={awayWins}
                    dim={homeWins}
                />
            </div>
            {(m.stadium || m.city) && (
                <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-500 truncate">
                    📍 {[m.stadium, m.city].filter(Boolean).join(" · ")}
                </div>
            )}
        </motion.div>
    );
};

/* ---------------- Tabla de un grupo (fase de grupos) ---------------- */

const GroupTable = ({ g, i }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(i * 0.05, 0.5), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass rounded-xl overflow-hidden"
    >
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-display font-700 uppercase tracking-wider text-sm text-white">
                {g.group}
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Mundial 2026</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                        <th className="px-3 py-2 text-left w-8">#</th>
                        <th className="px-2 py-2 text-left">Equipo</th>
                        <th className="px-2 py-2 text-center font-bold text-slate-400">Pts</th>
                        <th className="px-2 py-2 text-center">PJ</th>
                        <th className="px-2 py-2 text-center">G</th>
                        <th className="px-2 py-2 text-center">E</th>
                        <th className="px-2 py-2 text-center">P</th>
                        <th className="px-2 py-2 text-center hidden sm:table-cell">GF</th>
                        <th className="px-2 py-2 text-center hidden sm:table-cell">GC</th>
                        <th className="px-3 py-2 text-center">Dif</th>
                    </tr>
                </thead>
                <tbody>
                    {g.rows.map((r) => {
                        const qualified = r.qualification === "ConfirmedQualified";
                        const eliminated = r.qualification === "Eliminated";
                        return (
                            <tr
                                key={r.abbr || r.team}
                                className="border-t border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <td className="px-3 py-2">
                                    <span
                                        className={`relative pl-2 font-stat font-700 tabular-nums ${
                                            qualified ? "text-volt" : eliminated ? "text-slate-600" : "text-slate-300"
                                        }`}
                                    >
                                        {qualified && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-volt" />
                                        )}
                                        {r.position}
                                    </span>
                                </td>
                                <td className="px-2 py-2">
                                    <span className="flex items-center gap-2 min-w-0">
                                        <Flag src={r.flag} name={r.team} />
                                        <span
                                            className={`truncate font-medium ${eliminated ? "text-slate-500" : "text-white"}`}
                                        >
                                            {r.team}
                                        </span>
                                    </span>
                                </td>
                                <td className="px-2 py-2 text-center font-stat font-700 tabular-nums text-white">
                                    {r.points}
                                </td>
                                <td className="px-2 py-2 text-center tabular-nums text-slate-400">{r.played}</td>
                                <td className="px-2 py-2 text-center tabular-nums text-slate-400">{r.won}</td>
                                <td className="px-2 py-2 text-center tabular-nums text-slate-400">{r.drawn}</td>
                                <td className="px-2 py-2 text-center tabular-nums text-slate-400">{r.lost}</td>
                                <td className="px-2 py-2 text-center tabular-nums text-slate-400 hidden sm:table-cell">
                                    {r.goalsFor}
                                </td>
                                <td className="px-2 py-2 text-center tabular-nums text-slate-400 hidden sm:table-cell">
                                    {r.goalsAgainst}
                                </td>
                                <td
                                    className={`px-3 py-2 text-center tabular-nums font-medium ${
                                        r.goalDiff > 0
                                            ? "text-volt"
                                            : r.goalDiff < 0
                                              ? "text-red-400"
                                              : "text-slate-400"
                                    }`}
                                >
                                    {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </motion.div>
);

/* ---------------- Rueda de eliminatorias ----------------
   Cuadro radial: los 16avos en el anillo exterior, cada ronda converge
   hacia el centro y el campeón queda en el medio. El árbol se construye
   con los placeholders reales de FIFA ("W91" = ganador del partido 91). */

const WHEEL_C = 500; // centro del viewBox 1000x1000
const RING = [0, 155, 240, 330, 430]; // radio por profundidad (0 = final)
const FLAG_R = [27, 24, 21, 19, 17];
const PAIR_SEP = [75, 34, 30, 27, 24];

const polar = (a, r) => [
    WHEEL_C + r * Math.cos(a),
    WHEEL_C + r * Math.sin(a),
];

const normAngle = (d) => {
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
};

/** Camino codo radial: sale del hijo, gira por un radio intermedio y entra al padre. */
const edgePath = (a1, r1, a2, r2) => {
    const rm = (r1 + r2) / 2;
    const [x1, y1] = polar(a1, r1);
    const [mx1, my1] = polar(a1, rm);
    const [mx2, my2] = polar(a2, rm);
    const [x2, y2] = polar(a2, r2);
    const d = normAngle(a2 - a1);
    if (Math.abs(d) < 0.01) return `M ${x1} ${y1} L ${x2} ${y2}`;
    return `M ${x1} ${y1} L ${mx1} ${my1} A ${rm} ${rm} 0 0 ${d > 0 ? 1 : 0} ${mx2} ${my2} L ${x2} ${y2}`;
};

const SvgFlag = ({ id, x, y, r, src, ring, dashed, pulse }) => (
    <g>
        {src ? (
            <>
                <clipPath id={id}>
                    <circle cx={x} cy={y} r={r} />
                </clipPath>
                <image
                    href={src}
                    x={x - r}
                    y={y - r}
                    width={r * 2}
                    height={r * 2}
                    clipPath={`url(#${id})`}
                    preserveAspectRatio="xMidYMid slice"
                />
            </>
        ) : (
            <>
                <circle cx={x} cy={y} r={r} fill="#111114" />
                <text
                    x={x}
                    y={y + r * 0.36}
                    textAnchor="middle"
                    fontSize={r}
                    fill="#3f3f46"
                    fontWeight="700"
                >
                    ?
                </text>
            </>
        )}
        <circle
            cx={x}
            cy={y}
            r={r}
            fill="none"
            stroke={ring}
            strokeWidth={pulse ? 2.5 : 1.5}
            strokeDasharray={dashed ? "4 4" : "none"}
            className={pulse ? "animate-pulse" : undefined}
        />
    </g>
);

/** Un cruce (par de banderas + resultado) ubicado en (ángulo, radio). */
const WheelMatch = ({ node }) => {
    const { m, angle: a, depth } = node;
    const r = RING[depth];
    const fr = FLAG_R[depth];
    const sep = PAIR_SEP[depth];
    const [px, py] = polar(a, r);
    const tx = -Math.sin(a);
    const ty = Math.cos(a);
    const live = m.status === "live";
    const ft = m.status === "ft";
    const hasPens = m.homePenalties !== null && m.homePenalties !== undefined;
    const homeWins =
        ft &&
        (m.winnerIsHome === true ||
            (m.winnerIsHome === null &&
                (hasPens ? m.homePenalties > m.awayPenalties : m.homeScore > m.awayScore)));
    const awayWins =
        ft &&
        (m.winnerIsHome === false ||
            (m.winnerIsHome === null &&
                (hasPens ? m.awayPenalties > m.homePenalties : m.awayScore > m.homeScore)));

    const ringFor = (wins, loses, known) => {
        if (live) return "#ff2e63";
        if (wins) return "#d4ff00";
        if (loses) return "rgba(255,255,255,.12)";
        return known ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.12)";
    };

    const hx = px - tx * sep;
    const hy = py - ty * sep;
    const ax = px + tx * sep;
    const ay = py + ty * sep;
    // Marcador radialmente hacia afuera del par, para no pisar las banderas.
    const [sx, sy] = polar(a, r + fr + 17);
    const scoreText = live || ft ? `${m.homeScore ?? "-"}–${m.awayScore ?? "-"}` : "vs";

    return (
        <g>
            <title>
                {`${m.stage}: ${m.home} ${m.homeScore ?? ""}${live || ft ? "-" : " vs "}${m.awayScore ?? ""} ${m.away}${hasPens ? ` (pen ${m.homePenalties}-${m.awayPenalties})` : ""}${live && m.minute ? ` · ${m.minute}'` : ""}`}
            </title>
            <SvgFlag
                id={`wm-${m.id}-h`}
                x={hx}
                y={hy}
                r={fr}
                src={m.homeFlag}
                ring={ringFor(homeWins, awayWins, !!m.homeFlag)}
                dashed={!m.homeFlag}
                pulse={live}
            />
            <SvgFlag
                id={`wm-${m.id}-a`}
                x={ax}
                y={ay}
                r={fr}
                src={m.awayFlag}
                ring={ringFor(awayWins, homeWins, !!m.awayFlag)}
                dashed={!m.awayFlag}
                pulse={live}
            />
            <text
                x={sx}
                y={sy + 4}
                textAnchor="middle"
                fontSize={depth >= 4 ? 13 : 15}
                fontWeight="700"
                fill={live ? "#ff2e63" : ft ? "#ffffff" : "#52525b"}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {scoreText}
            </text>
            {live && m.minute && (
                <text x={sx} y={sy + 18} textAnchor="middle" fontSize={10} fill="#ff2e63">
                    {m.minute}'
                </text>
            )}
            {hasPens && (
                <text x={sx} y={sy + 17} textAnchor="middle" fontSize={9} fill="#a1a1aa">
                    ({m.homePenalties}-{m.awayPenalties})
                </text>
            )}
        </g>
    );
};

const KnockoutWheel = ({ matches }) => {
    const layout = useMemo(() => {
        const byNum = new Map();
        for (const m of matches) if (m.matchNumber) byNum.set(m.matchNumber, m);
        const final = matches.find((m) => m.stage === "Final" && m.matchNumber);
        if (!final) return null;

        const childOf = (m, ph) => {
            const w = /^W(\d+)$/.exec(ph || "");
            return w ? byNum.get(Number(w[1])) : null;
        };
        const countLeaves = (m) => {
            const kids = [childOf(m, m.placeholderA), childOf(m, m.placeholderB)].filter(Boolean);
            return kids.length ? kids.reduce((s, k) => s + countLeaves(k), 0) : 1;
        };
        const totalLeaves = countLeaves(final);
        if (totalLeaves < 2) return null;
        const slot = (2 * Math.PI) / totalLeaves;

        const nodes = [];
        const edges = [];
        let leaf = 0;

        const walk = (m, depth) => {
            const kidA = childOf(m, m.placeholderA);
            const kidB = childOf(m, m.placeholderB);
            const a = kidA ? walk(kidA, depth + 1) : null;
            const b = kidB ? walk(kidB, depth + 1) : null;

            let angle;
            if (!a && !b) {
                angle = -Math.PI / 2 + (leaf + 0.5) * slot;
                leaf++;
            } else {
                const angles = [a, b].filter(Boolean).map((n) => n.angle);
                angle = Math.atan2(
                    angles.reduce((s, x) => s + Math.sin(x), 0),
                    angles.reduce((s, x) => s + Math.cos(x), 0),
                );
            }

            const node = { m, depth, angle };
            if (depth > 0) nodes.push(node); // la final se dibuja aparte, en el centro

            [a, b].forEach((k, idx) => {
                if (!k) return;
                edges.push({
                    a1: k.angle,
                    r1: RING[Math.min(k.depth, RING.length - 1)],
                    a2: depth === 0 ? (idx === 0 ? Math.PI : 0) : angle,
                    r2: depth === 0 ? PAIR_SEP[0] : RING[depth],
                    done: k.m.status === "ft",
                });
            });
            return node;
        };
        walk(final, 0);
        return { nodes, edges, final };
    }, [matches]);

    if (!layout) return null;
    const { nodes, edges, final } = layout;

    const finalFt = final.status === "ft";
    const hasPens =
        final.homePenalties !== null && final.homePenalties !== undefined;
    const champIsHome =
        finalFt &&
        (final.winnerIsHome ??
            (hasPens
                ? final.homePenalties > final.awayPenalties
                : final.homeScore > final.awayScore));
    const champion = finalFt
        ? {
              name: champIsHome ? final.home : final.away,
              flag: champIsHome ? final.homeFlag : final.awayFlag,
          }
        : null;

    const ringLabels = [
        ["SEMIS", RING[1]],
        ["CUARTOS", RING[2]],
        ["OCTAVOS", RING[3]],
        ["16AVOS", RING[4]],
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-2xl p-4 sm:p-6 mb-10"
        >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <h2 className="font-display font-700 uppercase tracking-wider text-sm text-white">
                    Camino a la final
                </h2>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-full ring-1 ring-[#d4ff00]" /> Avanza
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="live-dot" /> En juego
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-full border border-dashed border-white/30" /> Por definir
                    </span>
                </div>
            </div>
            <svg
                viewBox="0 0 1000 1000"
                className="w-full max-w-[780px] mx-auto select-none"
                role="img"
                aria-label="Cuadro de eliminatorias del Mundial"
            >
                {/* Anillos guía + etiquetas de ronda */}
                {ringLabels.map(([label, r]) => (
                    <g key={label}>
                        <circle
                            cx={WHEEL_C}
                            cy={WHEEL_C}
                            r={r}
                            fill="none"
                            stroke="rgba(255,255,255,.05)"
                            strokeDasharray="3 6"
                        />
                        <text
                            x={WHEEL_C}
                            y={WHEEL_C - r - 7}
                            textAnchor="middle"
                            fontSize="11"
                            letterSpacing="2"
                            fill="rgba(255,255,255,.28)"
                        >
                            {label}
                        </text>
                    </g>
                ))}

                {/* Conexiones entre rondas (volt = el ganador ya avanzó) */}
                {edges.map((e, i) => (
                    <path
                        key={i}
                        d={edgePath(e.a1, e.r1, e.a2, e.r2)}
                        fill="none"
                        stroke={e.done ? "rgba(212,255,0,.38)" : "rgba(255,255,255,.09)"}
                        strokeWidth={e.done ? 2 : 1.3}
                    />
                ))}

                {/* Cruces */}
                {nodes.map((n) => (
                    <WheelMatch key={n.m.id} node={n} />
                ))}

                {/* Final, en el centro */}
                <g>
                    <title>
                        {`Final: ${final.home} vs ${final.away}${final.time ? ` · ${final.time}` : ""}`}
                    </title>
                    <SvgFlag
                        id="wm-final-h"
                        x={WHEEL_C - PAIR_SEP[0]}
                        y={WHEEL_C}
                        r={FLAG_R[0]}
                        src={final.homeFlag}
                        ring={
                            final.status === "live"
                                ? "#ff2e63"
                                : champIsHome && finalFt
                                  ? "#d4ff00"
                                  : "rgba(255,255,255,.2)"
                        }
                        dashed={!final.homeFlag}
                        pulse={final.status === "live"}
                    />
                    <SvgFlag
                        id="wm-final-a"
                        x={WHEEL_C + PAIR_SEP[0]}
                        y={WHEEL_C}
                        r={FLAG_R[0]}
                        src={final.awayFlag}
                        ring={
                            final.status === "live"
                                ? "#ff2e63"
                                : !champIsHome && finalFt
                                  ? "#d4ff00"
                                  : "rgba(255,255,255,.2)"
                        }
                        dashed={!final.awayFlag}
                        pulse={final.status === "live"}
                    />
                    {(final.status === "live" || finalFt) && (
                        <>
                            <text
                                x={WHEEL_C - PAIR_SEP[0]}
                                y={WHEEL_C + FLAG_R[0] + 18}
                                textAnchor="middle"
                                fontSize="15"
                                fontWeight="700"
                                fill="#fff"
                            >
                                {final.homeScore ?? "-"}
                            </text>
                            <text
                                x={WHEEL_C + PAIR_SEP[0]}
                                y={WHEEL_C + FLAG_R[0] + 18}
                                textAnchor="middle"
                                fontSize="15"
                                fontWeight="700"
                                fill="#fff"
                            >
                                {final.awayScore ?? "-"}
                            </text>
                        </>
                    )}

                    {/* Centro: campeón o trofeo */}
                    <circle
                        cx={WHEEL_C}
                        cy={WHEEL_C}
                        r="46"
                        fill="#0c0c0e"
                        stroke={champion ? "#ffd24a" : "rgba(255,210,74,.35)"}
                        strokeWidth={champion ? 2.5 : 1.5}
                    />
                    {champion ? (
                        <>
                            <SvgFlag
                                id="wm-champ"
                                x={WHEEL_C}
                                y={WHEEL_C}
                                r={38}
                                src={champion.flag}
                                ring="#ffd24a"
                            />
                            <text
                                x={WHEEL_C}
                                y={WHEEL_C + 66}
                                textAnchor="middle"
                                fontSize="13"
                                letterSpacing="3"
                                fontWeight="700"
                                fill="#ffd24a"
                            >
                                CAMPEÓN
                            </text>
                            <text
                                x={WHEEL_C}
                                y={WHEEL_C + 84}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#fff"
                            >
                                {champion.name}
                            </text>
                        </>
                    ) : (
                        <>
                            <text x={WHEEL_C} y={WHEEL_C + 12} textAnchor="middle" fontSize="34">
                                🏆
                            </text>
                            {final.time && (
                                <text
                                    x={WHEEL_C}
                                    y={WHEEL_C + 66}
                                    textAnchor="middle"
                                    fontSize="11"
                                    letterSpacing="2"
                                    fill="rgba(255,255,255,.4)"
                                >
                                    FINAL · {final.time}
                                </text>
                            )}
                        </>
                    )}
                </g>
            </svg>
        </motion.div>
    );
};

/* ---------------- Página ---------------- */

const TABS = ["Partidos", "Grupos", "Eliminatorias"];
const FILTERS = ["Hoy", "En Vivo", "Próximos", "Resultados", "Todos"];

// Orden del cuadro final para la pestaña Eliminatorias.
const KNOCKOUT_ORDER = [
    "Dieciseisavos de final",
    "Octavos de final",
    "Cuartos de final",
    "Semifinal",
    "Partido por el tercer puesto",
    "Final",
];

const Mundial = () => {
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("Partidos");
    const [filter, setFilter] = useState("Hoy");

    // Poll de datos reales: partidos cada 30s, tablas cada 2min.
    useEffect(() => {
        let alive = true;
        const fetchMatches = async () => {
            try {
                const data = await mundialApi.matches();
                if (alive && data.length) setMatches(data);
            } catch (err) {
                console.error("No se pudieron cargar los partidos del Mundial:", err.message);
            } finally {
                if (alive) setLoading(false);
            }
        };
        const fetchStandings = async () => {
            try {
                const data = await mundialApi.standings();
                if (alive && data.length) setStandings(data);
            } catch (err) {
                console.error("No se pudieron cargar las tablas del Mundial:", err.message);
            }
        };
        fetchMatches();
        fetchStandings();
        const pollM = setInterval(fetchMatches, 30000);
        const pollS = setInterval(fetchStandings, 120000);
        return () => {
            alive = false;
            clearInterval(pollM);
            clearInterval(pollS);
        };
    }, []);

    const liveCount = matches.filter((m) => m.status === "live").length;

    const filtered = useMemo(() => {
        const todayKey = dayKey(Date.now());
        let list;
        if (filter === "En Vivo") list = matches.filter((m) => m.status === "live");
        else if (filter === "Hoy")
            list = matches.filter((m) => m.startTime && dayKey(m.startTime) === todayKey);
        else if (filter === "Próximos") list = matches.filter((m) => m.status === "scheduled");
        else if (filter === "Resultados")
            list = [...matches.filter((m) => m.status === "ft")].reverse();
        else list = matches;

        // En vivo siempre arriba.
        return [...list].sort(
            (a, b) => (a.status === "live" ? -1 : 0) - (b.status === "live" ? -1 : 0),
        );
    }, [matches, filter]);

    // Agrupar por día (estilo Promiedos), salvo cuando el filtro ya es un día.
    const grouped = useMemo(() => {
        const groups = new Map();
        for (const m of filtered) {
            const key = m.startTime ? dayLabel(m.startTime) : "Sin fecha";
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(m);
        }
        return [...groups.entries()];
    }, [filtered]);

    const knockout = useMemo(() => {
        return KNOCKOUT_ORDER.map((stage) => ({
            stage,
            matches: matches.filter((m) => m.stage === stage),
        })).filter((s) => s.matches.length > 0);
    }, [matches]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#05070d] via-[#0a0e17] to-[#0b1220] text-white">
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-pitch-grid opacity-40" />
                <div className="absolute -top-24 left-1/3 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-10">
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow text-gold mb-2">
                        🏆 Copa Mundial de la FIFA 2026
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-700 uppercase tracking-tight"
                    >
                        El <span className="text-gradient-cyan">Mundial</span> en vivo
                    </motion.h1>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 flex items-center gap-2 text-slate-300">
                        <span className="live-dot" />
                        <span className="font-stat font-600">
                            {liveCount > 0 ? `${liveCount} partido${liveCount > 1 ? "s" : ""} en juego` : "Sin partidos en juego"}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-sm text-slate-400">Datos reales · actualización automática</span>
                    </motion.div>
                </div>
            </div>

            {/* Tabs + filtros */}
            <div className="sticky top-16 z-20 glass-strong border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-display font-600 uppercase tracking-wider transition-all duration-200 ${
                                tab === t ? "text-black bg-gold" : "text-slate-300 bg-white/5 hover:bg-white/10"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                    {tab === "Partidos" && (
                        <>
                            <span className="hidden sm:block w-px h-6 bg-white/10 mx-1" />
                            {FILTERS.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                        filter === f ? "text-black bg-volt" : "text-slate-300 bg-white/5 hover:bg-white/10"
                                    }`}
                                >
                                    {f === "En Vivo" && <span className="live-dot mr-1.5 align-middle" />}
                                    {f}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {loading && (
                    <p className="text-center text-slate-500 py-20 animate-pulse">
                        Cargando datos del Mundial…
                    </p>
                )}

                {/* -------- Partidos -------- */}
                {!loading && tab === "Partidos" && (
                    <AnimatePresence mode="popLayout">
                        {grouped.map(([day, dayMatches]) => (
                            <div key={day} className="mb-8">
                                <h2 className="mb-3 font-display font-700 uppercase tracking-wider text-sm text-slate-400">
                                    {day}
                                    <span className="ml-2 text-[11px] text-slate-600 normal-case tracking-normal">
                                        {dayMatches.length} partido{dayMatches.length > 1 ? "s" : ""}
                                    </span>
                                </h2>
                                <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dayMatches.map((m, i) => (
                                        <MatchCard key={m.id} m={m} i={i} />
                                    ))}
                                </motion.div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <p className="text-center text-slate-500 py-20">
                                No hay partidos para este filtro.
                            </p>
                        )}
                    </AnimatePresence>
                )}

                {/* -------- Grupos -------- */}
                {!loading && tab === "Grupos" && (
                    <div className="grid lg:grid-cols-2 gap-5">
                        {standings.map((g, i) => (
                            <GroupTable key={g.group} g={g} i={i} />
                        ))}
                        {standings.length === 0 && (
                            <p className="lg:col-span-2 text-center text-slate-500 py-20">
                                Las tablas de grupos no están disponibles.
                            </p>
                        )}
                    </div>
                )}

                {/* -------- Eliminatorias -------- */}
                {!loading && tab === "Eliminatorias" && (
                    <div className="space-y-10">
                        <KnockoutWheel matches={matches} />
                        {knockout.map((s) => (
                            <div key={s.stage}>
                                <h2 className="mb-3 font-display font-700 uppercase tracking-wider text-sm text-gold">
                                    {s.stage}
                                </h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {s.matches.map((m, i) => (
                                        <MatchCard key={m.id} m={m} i={i} />
                                    ))}
                                </div>
                            </div>
                        ))}
                        {knockout.length === 0 && (
                            <p className="text-center text-slate-500 py-20">
                                La fase eliminatoria todavía no comenzó.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Mundial;
