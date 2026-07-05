import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cardsApi } from "../../api";
import { PLAYER_PLACEHOLDER } from "../../api/normalize";

const rarityRing = {
  Común: "border-white/25",
  Raro: "border-cyan/70",
  Épico: "border-purple-500/80",
  Legendario: "border-gold",
};
const rarityTag = {
  Común: "text-slate-300",
  Raro: "text-cyan",
  Épico: "text-purple-400",
  Legendario: "text-gold",
};

const FORMATIONS = {
  "4-3-3": {
    label: "4-3-3",
    description: "Equilibrio entre ataque y control",
    slots: [
      { key: "gk", label: "POR", top: "86%", left: "50%" },
      { key: "lb", label: "LB", top: "67%", left: "16%" },
      { key: "cb1", label: "CB", top: "69%", left: "37%" },
      { key: "cb2", label: "CB", top: "69%", left: "63%" },
      { key: "rb", label: "RB", top: "67%", left: "84%" },
      { key: "cm1", label: "CM", top: "47%", left: "28%" },
      { key: "cm2", label: "CM", top: "51%", left: "50%" },
      { key: "cm3", label: "CM", top: "47%", left: "72%" },
      { key: "lw", label: "LW", top: "24%", left: "18%" },
      { key: "st", label: "ST", top: "16%", left: "50%" },
      { key: "rw", label: "RW", top: "24%", left: "82%" },
    ],
  },
  "4-4-2": {
    label: "4-4-2",
    description: "Poca profundidad, mucha solidez",
    slots: [
      { key: "gk", label: "POR", top: "86%", left: "50%" },
      { key: "lb", label: "LB", top: "67%", left: "16%" },
      { key: "cb1", label: "CB", top: "69%", left: "37%" },
      { key: "cb2", label: "CB", top: "69%", left: "63%" },
      { key: "rb", label: "RB", top: "67%", left: "84%" },
      { key: "lm", label: "LM", top: "45%", left: "16%" },
      { key: "cm1", label: "CM", top: "48%", left: "37%" },
      { key: "cm2", label: "CM", top: "48%", left: "63%" },
      { key: "rm", label: "RM", top: "45%", left: "84%" },
      { key: "st1", label: "ST", top: "18%", left: "36%" },
      { key: "st2", label: "ST", top: "18%", left: "64%" },
    ],
  },
  "3-4-3": {
    label: "3-4-3",
    description: "Más presión y control por bandas",
    slots: [
      { key: "gk", label: "POR", top: "86%", left: "50%" },
      { key: "cb1", label: "CB", top: "68%", left: "28%" },
      { key: "cb2", label: "CB", top: "70%", left: "50%" },
      { key: "cb3", label: "CB", top: "68%", left: "72%" },
      { key: "lm", label: "LM", top: "45%", left: "16%" },
      { key: "cm1", label: "CM", top: "48%", left: "37%" },
      { key: "cm2", label: "CM", top: "48%", left: "63%" },
      { key: "rm", label: "RM", top: "45%", left: "84%" },
      { key: "lw", label: "LW", top: "24%", left: "18%" },
      { key: "st", label: "ST", top: "16%", left: "50%" },
      { key: "rw", label: "RW", top: "24%", left: "82%" },
    ],
  },
};

const STORAGE_KEY = "liga:equipoIdeal";
const power = (p) => p?.stats?.generalValue ?? p?.power ?? 0;

/* Serializa la selección actual para guardar/comparar (solo ids) */
const serializeTeam = (formation, selectedPlayers) =>
  JSON.stringify({
    formation,
    slots: Object.fromEntries(
      Object.entries(selectedPlayers)
        .filter(([, p]) => Boolean(p))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([slot, p]) => [slot, p.playerId]),
    ),
  });

const MyPlayers = () => {
  const [misJugadores, setMisJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formation, setFormation] = useState("4-3-3");
  const [selectedPlayers, setSelectedPlayers] = useState({});
  const [activeSlot, setActiveSlot] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [toast, setToast] = useState(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    const fetchMyPlayers = async () => {
      try {
        const data = await cardsApi.mine();
        setMisJugadores(data);
      } catch (err) {
        console.error("Error al traer jugadores:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPlayers();
  }, []);

  const jugadoresUnicos = useMemo(() => {
    const agrupados = misJugadores.reduce((acc, jugador) => {
      const id = jugador.playerId;
      if (!acc[id]) acc[id] = { ...jugador, cantidad: 1 };
      else acc[id].cantidad += 1;
      return acc;
    }, {});

    return Object.values(agrupados).sort((a, b) => power(b) - power(a));
  }, [misJugadores]);

  /* Restaura el Equipo Ideal guardado una vez que la colección está cargada */
  useEffect(() => {
    if (loading || restoredRef.current || !jugadoresUnicos.length) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const targetFormation = FORMATIONS[saved.formation]
        ? saved.formation
        : "4-3-3";
      const byId = new Map(jugadoresUnicos.map((p) => [p.playerId, p]));
      const validKeys = new Set(
        FORMATIONS[targetFormation].slots.map((s) => s.key),
      );
      const restored = {};
      Object.entries(saved.slots || {}).forEach(([slot, playerId]) => {
        const player = byId.get(playerId);
        if (player && validKeys.has(slot)) restored[slot] = player;
      });
      setFormation(targetFormation);
      setSelectedPlayers(restored);
      setSavedSnapshot(serializeTeam(targetFormation, restored));
    } catch (err) {
      console.error("No se pudo restaurar el equipo ideal:", err);
    }
  }, [loading, jugadoresUnicos]);

  const assignedPlayers = useMemo(
    () => Object.values(selectedPlayers).filter(Boolean),
    [selectedPlayers],
  );

  const teamOvr = useMemo(() => {
    if (!assignedPlayers.length) return 0;
    return Math.round(
      assignedPlayers.reduce((acc, p) => acc + power(p), 0) /
        assignedPlayers.length,
    );
  }, [assignedPlayers]);

  const chemistryScore = useMemo(() => {
    if (!assignedPlayers.length) return 0;

    let score = assignedPlayers.reduce(
      (acc, player) => acc + Math.min(18, Math.round(power(player) / 8)),
      0,
    );
    const clubs = new Map();
    assignedPlayers.forEach((player) => {
      clubs.set(player.team, (clubs.get(player.team) || 0) + 1);
    });
    const clubBonus = Array.from(clubs.values()).reduce(
      (acc, count) => acc + (count > 1 ? 8 : 0),
      0,
    );
    const legendaryBonus =
      assignedPlayers.filter((player) => player.rarity === "Legendario")
        .length * 6;
    return Math.min(100, score + clubBonus + legendaryBonus);
  }, [assignedPlayers]);

  const currentSnapshot = serializeTeam(formation, selectedPlayers);
  const isDirty = savedSnapshot !== null
    ? currentSnapshot !== savedSnapshot
    : assignedPlayers.length > 0;

  const saveIdealTeam = () => {
    try {
      localStorage.setItem(STORAGE_KEY, currentSnapshot);
      setSavedSnapshot(currentSnapshot);
      setToast(true);
      setTimeout(() => setToast(false), 2200);
    } catch (err) {
      console.error("No se pudo guardar el equipo ideal:", err);
    }
  };

  const assignPlayer = (slotKey, player) => {
    setSelectedPlayers((prev) => ({ ...prev, [slotKey]: player }));
    setActiveSlot(null);
  };

  const clearSlot = (slotKey) => {
    setSelectedPlayers((prev) => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const currentFormation = FORMATIONS[formation];
  const assignedIds = new Set(assignedPlayers.map((p) => p.playerId));

  return (
    <div className="relative min-h-screen bg-ink text-[#ededea] pt-28 pb-bottom-nav px-5 sm:px-8 overflow-hidden grain">
      <div className="absolute inset-0 bg-pitch-grid opacity-40" />
      <div className="absolute -top-32 left-1/4 w-[40rem] h-[40rem] rounded-full bg-volt/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 right-[-3rem] hidden select-none xl:block">
        <span className="display-giant outline-text text-[10rem] opacity-30">
          XI
        </span>
      </div>

      {/* Toast de guardado */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed left-1/2 top-24 z-50 -translate-x-1/2"
          >
            <div className="clip-tag flex items-center gap-3 bg-volt px-6 py-3 font-display text-sm font-700 uppercase tracking-wider text-ink shadow-[0_10px_40px_rgba(212,255,0,0.35)]">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-volt text-xs">
                ✓
              </span>
              Equipo ideal guardado
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto pb-16">
        {/* Cabecera */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="eyebrow text-volt mb-3"
            >
              Tu equipo
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="display-giant text-[clamp(3rem,8vw,6rem)] text-white"
            >
              Tu <span className="text-volt italic-skew">equipo ideal</span>
            </motion.h1>
            <p className="mt-4 max-w-2xl text-[#a3a39c]">
              Elegí una formación, colocá tus cartas en el campo y guardá tu
              once definitivo. Pronto vas a poder llevarlo a un PvP con
              alineación completa.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="panel clip-tag px-5 py-3 text-center">
              <span className="font-mega text-3xl text-volt">
                {jugadoresUnicos.length}
              </span>
              <span className="eyebrow text-[#6b6b64] ml-2">cartas</span>
            </div>
            <div className="panel clip-tag px-5 py-3 text-center">
              <span className="font-mega text-3xl text-gold">
                {teamOvr || "—"}
              </span>
              <span className="eyebrow text-[#6b6b64] ml-2">OVR</span>
            </div>
            <Link
              to="/players"
              className="bg-volt text-ink font-display font-700 uppercase tracking-wider text-sm clip-btn px-6 grid place-items-center hover:bg-white transition-colors"
            >
              Ver colección
            </Link>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-5">
          {/* ---------- Campo ---------- */}
          <div className="panel clip-card p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-volt">Campo táctico</p>
                <h2 className="text-2xl font-display font-700 text-white">
                  Tu once ideal
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(FORMATIONS).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setFormation(key)}
                    className={`clip-tag px-4 py-2 font-stat text-sm font-700 transition ${
                      formation === key
                        ? "bg-volt text-ink"
                        : "bg-[#11151d] text-[#8a8a82] hover:text-white"
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-sm border border-line/70 bg-[#050b08] p-2.5 md:p-3">
              <div className="relative h-[560px] overflow-hidden rounded-sm border border-volt/15 bg-[linear-gradient(180deg,#0d3b22_0%,#0a2d1a_55%,#071f12_100%)]">
                {/* Césped cortado en franjas */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_55px,rgba(255,255,255,0.035)_55px,rgba(255,255,255,0.035)_112px)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,255,0,0.07),transparent_65%)]" />
                {/* Líneas de cancha */}
                <div className="absolute inset-x-7 top-5 bottom-5 rounded-sm border border-white/20" />
                <div className="absolute left-7 right-7 top-1/2 h-px bg-white/20" />
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
                <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30" />
                {/* Áreas */}
                <div className="absolute left-1/2 top-5 h-14 w-44 -translate-x-1/2 border-x border-b border-white/20" />
                <div className="absolute left-1/2 top-5 h-7 w-20 -translate-x-1/2 border-x border-b border-white/20" />
                <div className="absolute left-1/2 bottom-5 h-14 w-44 -translate-x-1/2 border-x border-t border-white/20" />
                <div className="absolute left-1/2 bottom-5 h-7 w-20 -translate-x-1/2 border-x border-t border-white/20" />

                {currentFormation.slots.map((slot) => {
                  const player = selectedPlayers[slot.key];
                  const ring = player
                    ? rarityRing[player.rarity] || rarityRing["Común"]
                    : "";
                  const isActive = activeSlot === slot.key;
                  return (
                    <button
                      key={slot.key}
                      onClick={() => {
                        if (player) {
                          clearSlot(slot.key);
                        } else {
                          setActiveSlot(isActive ? null : slot.key);
                        }
                      }}
                      className="group absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ top: slot.top, left: slot.left }}
                      title={
                        player
                          ? `Quitar a ${player.name}`
                          : `Asignar ${slot.label}`
                      }
                    >
                      {player ? (
                        <div className="flex w-[74px] flex-col items-center">
                          <div className="relative">
                            <img
                              src={player.image || PLAYER_PLACEHOLDER}
                              alt={player.name}
                              className={`h-14 w-14 rounded-full border-2 bg-ink object-cover shadow-[0_6px_18px_rgba(0,0,0,0.5)] transition group-hover:brightness-110 ${ring}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PLAYER_PLACEHOLDER;
                              }}
                            />
                            <span className="absolute -right-1.5 -top-1.5 grid h-5.5 min-h-5 w-5.5 min-w-5 place-items-center rounded-full bg-gold font-stat text-[10px] font-700 text-ink">
                              {power(player) || "—"}
                            </span>
                            <span className="absolute -bottom-1 -right-1.5 hidden h-5 w-5 place-items-center rounded-full bg-coral text-[10px] font-700 text-white group-hover:grid">
                              ✕
                            </span>
                          </div>
                          <span className="clip-tag mt-1 max-w-full truncate bg-ink/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                            {player.name.split(" ").slice(-1)[0]}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`relative flex h-14 w-14 flex-col items-center justify-center rounded-full border transition ${
                            isActive
                              ? "border-volt bg-volt/20 shadow-[0_0_20px_rgba(212,255,0,0.4)]"
                              : "border-dashed border-white/35 bg-ink/40 hover:border-volt/60 hover:bg-ink/60"
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              className="absolute inset-0 rounded-full border border-volt"
                              animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
                              transition={{ repeat: Infinity, duration: 1.2 }}
                            />
                          )}
                          <span
                            className={`font-stat text-[11px] font-700 uppercase tracking-widest ${
                              isActive ? "text-volt" : "text-white/70"
                            }`}
                          >
                            {slot.label}
                          </span>
                          <span className="text-[8px] uppercase text-white/30">
                            {isActive ? "elegí" : "+"}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#8a8a82]">
              <p>{currentFormation.description}</p>
              <p className="text-volt">
                {activeSlot
                  ? `Asignando a ${currentFormation.slots.find((slot) => slot.key === activeSlot)?.label} — elegí una carta →`
                  : "Tocá una posición del campo para elegir una carta"}
              </p>
            </div>
          </div>

          {/* ---------- Panel lateral ---------- */}
          <div className="space-y-5">
            {/* Guardar equipo ideal */}
            <div className="panel clip-card relative overflow-hidden p-6">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,255,0,0.07),transparent_60%)]" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow text-volt">Equipo ideal</p>
                    <h3 className="mt-2 text-2xl font-display font-700 text-white">
                      Guardá tu once definitivo
                    </h3>
                  </div>
                  <span
                    className={`clip-tag shrink-0 px-3 py-1.5 text-[10px] font-700 uppercase tracking-wider ${
                      !assignedPlayers.length
                        ? "bg-surface-2 text-[#6b6b64]"
                        : isDirty
                          ? "bg-gold/15 text-gold"
                          : "bg-volt/15 text-volt"
                    }`}
                  >
                    {!assignedPlayers.length
                      ? "Vacío"
                      : isDirty
                        ? "Sin guardar"
                        : "✓ Guardado"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="panel-2 clip-tag py-2.5">
                    <div className="font-stat text-xl font-700 text-white">
                      {assignedPlayers.length}/11
                    </div>
                    <div className="eyebrow text-[9px] text-[#6b6b64]">
                      Titulares
                    </div>
                  </div>
                  <div className="panel-2 clip-tag py-2.5">
                    <div className="font-stat text-xl font-700 text-gold">
                      {teamOvr || "—"}
                    </div>
                    <div className="eyebrow text-[9px] text-[#6b6b64]">
                      OVR medio
                    </div>
                  </div>
                  <div className="panel-2 clip-tag py-2.5">
                    <div className="font-stat text-xl font-700 text-volt">
                      {formation}
                    </div>
                    <div className="eyebrow text-[9px] text-[#6b6b64]">
                      Formación
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveIdealTeam}
                  disabled={!assignedPlayers.length || !isDirty}
                  className={`clip-btn shine relative mt-5 w-full py-3.5 font-display text-sm font-700 uppercase tracking-[0.2em] transition-all ${
                    assignedPlayers.length && isDirty
                      ? "bg-volt text-ink hover:bg-white"
                      : "cursor-not-allowed border border-line text-[#5a5a54]"
                  }`}
                >
                  {!assignedPlayers.length
                    ? "Armá tu equipo primero"
                    : isDirty
                      ? "Guardar equipo ideal"
                      : "Equipo guardado"}
                </button>
                <p className="mt-3 text-xs text-[#6b6b64]">
                  Tu equipo ideal queda guardado en este dispositivo.
                  Próximamente: PvP 11 vs 11 con tu alineación completa.
                </p>
              </div>
            </div>

            {/* Química */}
            <div className="panel clip-card p-6">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-volt">Química</p>
                <span className="font-stat text-lg font-700 text-white">
                  {chemistryScore}%
                </span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden bg-[#11151d]">
                <motion.div
                  className={`h-full ${
                    chemistryScore >= 70
                      ? "bg-volt"
                      : chemistryScore >= 40
                        ? "bg-gold"
                        : "bg-coral"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${chemistryScore}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="mt-3 text-sm text-[#a3a39c]">
                Sumá cartas del mismo club y jugadores legendarios para subir la
                química del equipo.
              </p>
            </div>

            {/* Colección */}
            <div className="panel clip-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow text-volt">Tu colección</p>
                  <h3 className="mt-2 text-2xl font-display font-700 text-white">
                    Elegí jugadores para el once
                  </h3>
                </div>
              </div>

              {loading ? (
                <div className="grid place-items-center py-10">
                  <motion.div
                    className="w-8 h-8 border-2 border-volt/30 border-t-volt rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.9,
                      ease: "linear",
                    }}
                  />
                </div>
              ) : jugadoresUnicos.length === 0 ? (
                <div className="mt-4 rounded-none border border-line/70 bg-[#0c1018] p-5 text-sm text-[#8a8a82]">
                  Todavía no tenés cartas para armar tu equipo.{" "}
                  <Link to="/sobres" className="text-volt hover:underline">
                    Abrí un sobre y empezá →
                  </Link>
                </div>
              ) : (
                <div className="mt-4 grid gap-2.5 max-h-[420px] overflow-auto pr-1">
                  {jugadoresUnicos.map((player) => {
                    const tag = rarityTag[player.rarity] || rarityTag["Común"];
                    const inTeam = assignedIds.has(player.playerId);
                    return (
                      <button
                        key={player._id}
                        onClick={() =>
                          activeSlot ? assignPlayer(activeSlot, player) : null
                        }
                        className={`flex items-center justify-between border px-3 py-3 text-left transition ${
                          inTeam
                            ? "border-volt/40 bg-volt/[0.06]"
                            : activeSlot
                              ? "border-line/70 bg-[#0c1018] hover:border-volt hover:bg-volt/[0.08] cursor-pointer"
                              : "border-line/70 bg-[#0c1018] opacity-80"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={player.image || PLAYER_PLACEHOLDER}
                              alt={player.name}
                              className="h-11 w-11 rounded-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PLAYER_PLACEHOLDER;
                              }}
                            />
                            {inTeam && (
                              <span className="absolute -right-1 -bottom-1 grid h-4.5 w-4.5 min-h-4 min-w-4 place-items-center rounded-full bg-volt text-[9px] font-700 text-ink">
                                ✓
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-display font-600 text-white">
                              {player.name}
                            </p>
                            <p className="text-xs text-[#8a8a82]">
                              {player.position} · {player.team}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span
                              className={`text-[11px] font-semibold uppercase ${tag}`}
                            >
                              {player.rarity}
                            </span>
                            {player.cantidad > 1 && (
                              <p className="mt-0.5 text-xs text-volt">
                                x{player.cantidad}
                              </p>
                            )}
                          </div>
                          <span className="grid h-9 w-9 shrink-0 place-items-center bg-surface-2 font-stat text-base font-700 text-gold">
                            {power(player) || "—"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPlayers;
