import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { prodeApi } from "../api";
import { AuthContext } from "../Contexts/AuthContext.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

/* ---------------- helpers ---------------- */

const STATUS = {
  scheduled: { text: "Próximo", cls: "text-cyan" },
  live: { text: "En vivo", cls: "text-live" },
  finished: { text: "Finalizado", cls: "text-[#8a8a82]" },
  cancelled: { text: "Suspendido", cls: "text-[#8a8a82]" },
};
const PRED_STATUS = {
  pending: { text: "Pendiente", cls: "text-[#8a8a82]" },
  won: { text: "Acertado", cls: "text-volt" },
  lost: { text: "Sin puntos", cls: "text-[#5a5a52]" },
};

const formatDate = (value) => {
  if (!value) return "Por definir";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ---------------- iconos ---------------- */
const Icon = {
  Plus: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" width="16" height="16" {...p}><path d="M12 5v14M5 12h14" /></svg>),
  Users: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
  Back: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>),
  Copy: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>),
  Trophy: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" {...p}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM5 9a3 3 0 0 1-3-3V5h5M19 9a3 3 0 0 0 3-3V5h-5" /></svg>),
};

/* ---------------- predictor de un partido ---------------- */
const MatchPredictor = ({ match, existing, onSave }) => {
  const [a, setA] = useState(existing ? existing.scoreA : "");
  const [b, setB] = useState(existing ? existing.scoreB : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const locked = match.status === "finished" || match.status === "cancelled";

  useEffect(() => {
    if (existing) {
      setA(existing.scoreA);
      setB(existing.scoreB);
    }
  }, [existing]);

  const submit = async () => {
    if (a === "" || b === "") return;
    setSaving(true);
    try {
      await onSave({ matchId: match.id, scoreA: Number(a), scoreB: Number(b) });
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    } catch (err) {
      toast.error(err.response?.data?.message || "No se pudo guardar el pronóstico");
    } finally {
      setSaving(false);
    }
  };

  const st = STATUS[match.status] || STATUS.scheduled;

  return (
    <div className="panel border-line clip-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-line bg-ink-2/50">
        <span className={`eyebrow text-[10px] ${st.cls} inline-flex items-center gap-1.5`}>
          {match.status === "live" && <span className="live-dot" />}
          {st.text}
        </span>
        <span className="eyebrow text-[10px] text-[#6b6b64]">{formatDate(match.scheduledAt)}</span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-right min-w-0">
            <p className="font-display font-700 text-white truncate">{match.teamA}</p>
            <p className="eyebrow text-[9px] text-[#6b6b64] mt-0.5">Local</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number" min="0" inputMode="numeric" value={a} disabled={locked}
              onChange={(e) => setA(e.target.value)} placeholder="-"
              className="w-11 h-11 text-center font-stat font-700 text-lg bg-surface border border-line text-white outline-none focus:border-volt clip-tag disabled:opacity-40"
            />
            <span className="text-[#5a5a52] font-mega">:</span>
            <input
              type="number" min="0" inputMode="numeric" value={b} disabled={locked}
              onChange={(e) => setB(e.target.value)} placeholder="-"
              className="w-11 h-11 text-center font-stat font-700 text-lg bg-surface border border-line text-white outline-none focus:border-volt clip-tag disabled:opacity-40"
            />
          </div>

          <div className="min-w-0">
            <p className="font-display font-700 text-white truncate">{match.teamB}</p>
            <p className="eyebrow text-[9px] text-[#6b6b64] mt-0.5">Visitante</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-xs">
            {match.result ? (
              <span className="text-volt font-stat font-700">Final {match.result}</span>
            ) : existing ? (
              <span className={`eyebrow text-[10px] ${PRED_STATUS[existing.status]?.cls}`}>
                {PRED_STATUS[existing.status]?.text}
                {existing.status === "won" ? ` · +${existing.pointsWon}` : ""}
              </span>
            ) : (
              <span className="eyebrow text-[10px] text-[#5a5a52]">Sin pronóstico</span>
            )}
          </div>
          {!locked && (
            <button
              onClick={submit} disabled={saving || a === "" || b === ""}
              className="px-5 py-2 bg-volt text-ink font-display font-700 uppercase tracking-wider text-xs clip-btn hover:bg-white disabled:opacity-40 transition-colors"
            >
              {saved ? "Guardado" : existing ? "Actualizar" : "Pronosticar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------- tarjeta de torneo ---------------- */
const TorneoCard = ({ torneo, onOpen, onJoin }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -6 }}
    className="group panel border-line clip-card overflow-hidden cursor-pointer flex flex-col"
    onClick={onOpen}
  >
    <div className="absolute inset-x-0 top-0 h-[3px] bg-volt" />
    <div className="p-5 flex-1">
      <div className="flex items-start justify-between gap-2 mb-3">
        {torneo.oficial ? (
          <span className="eyebrow text-[9px] text-gold panel-2 clip-tag px-2 py-1">Oficial</span>
        ) : (
          <span className="eyebrow text-[9px] text-cyan panel-2 clip-tag px-2 py-1">
            {torneo.isPublic ? "Público" : "Privado"}
          </span>
        )}
        {torneo.isOwner && (
          <span className="eyebrow text-[9px] text-volt">Creado por vos</span>
        )}
      </div>
      <h3 className="display-giant text-2xl text-white leading-none group-hover:text-volt transition-colors">
        {torneo.nombre}
      </h3>
      {torneo.descripcion && (
        <p className="mt-2 text-sm text-[#8a8a82] line-clamp-2">{torneo.descripcion}</p>
      )}
    </div>
    <div className="px-5 py-3 border-t border-line flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-[#8a8a82] text-sm font-stat">
        <Icon.Users /> {torneo.memberCount}
      </span>
      {typeof torneo.puntos === "number" ? (
        <span className="font-stat font-700 text-volt">{torneo.puntos} pts</span>
      ) : onJoin ? (
        <button
          onClick={(e) => { e.stopPropagation(); onJoin(); }}
          className="eyebrow text-[10px] text-ink bg-volt px-3 py-1.5 clip-tag hover:bg-white transition-colors"
        >
          Unirme
        </button>
      ) : null}
    </div>
  </motion.div>
);

/* ============================================================
   Componente principal
   ============================================================ */
const Prode = () => {
  const { user } = useContext(AuthContext);

  const [torneos, setTorneos] = useState({ mine: [], descubrir: [] });
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tab, setTab] = useState("pronosticar");

  // formularios
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", isPublic: true });
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadTorneos = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      setTorneos(await prodeApi.torneos());
    } catch (err) {
      console.error("Error al cargar torneos:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      setDetail(await prodeApi.torneo(id));
    } catch (err) {
      toast.error(err.response?.data?.message || "No se pudo abrir el torneo");
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => { loadTorneos(); }, [loadTorneos]);
  useEffect(() => { if (selectedId) loadDetail(selectedId); }, [selectedId, loadDetail]);

  const createTorneo = async () => {
    if (form.nombre.trim().length < 3) return;
    setBusy(true);
    try {
      const t = await prodeApi.createTorneo(form);
      setShowCreate(false);
      setForm({ nombre: "", descripcion: "", isPublic: true });
      await loadTorneos();
      setSelectedId(t.id);
    } catch (err) {
      toast.error(err.response?.data?.message || "No se pudo crear el torneo");
    } finally {
      setBusy(false);
    }
  };

  const joinByCode = async () => {
    if (!joinCode.trim()) return;
    setBusy(true);
    try {
      const t = await prodeApi.joinByCode(joinCode.trim().toUpperCase());
      setJoinCode("");
      await loadTorneos();
      setSelectedId(t.id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Código inválido");
    } finally {
      setBusy(false);
    }
  };

  const joinPublic = async (id) => {
    try {
      await prodeApi.joinPublic(id);
      await loadTorneos();
      setSelectedId(id);
    } catch (err) {
      toast.error(err.response?.data?.message || "No se pudo unir");
    }
  };

  const predictInTorneo = async (payload) => {
    await prodeApi.predictTorneo(selectedId, payload);
    await loadDetail(selectedId);
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const [confirmLeave, setConfirmLeave] = useState(false);

  const leaveOrDelete = async () => {
    const t = detail?.torneo;
    if (!t) return;
    setConfirmLeave(false);
    try {
      if (t.isOwner) await prodeApi.deleteTorneo(t.id);
      else await prodeApi.leaveTorneo(t.id);
      setSelectedId(null);
      setDetail(null);
      await loadTorneos();
    } catch (err) {
      toast.error(err.response?.data?.message || "No se pudo completar la acción");
    }
  };

  const predByMatch = useMemo(() => {
    const map = {};
    (detail?.misPronosticos || []).forEach((p) => { map[p.matchId] = p; });
    return map;
  }, [detail]);

  const myRow = detail?.leaderboard?.find((r) => r.isMe);
  const upcoming = (detail?.fixture || []).filter((m) => m.status !== "finished");
  const finishedFx = (detail?.fixture || []).filter((m) => m.status === "finished");

  /* ---------------- render ---------------- */

  return (
    <div className="relative min-h-screen bg-ink text-[#ededea] pt-28 pb-24 px-5 sm:px-8 overflow-hidden grain">
      <div className="absolute inset-0 bg-pitch-grid opacity-30" />
      <div className="absolute -top-32 right-1/4 w-[40rem] h-[40rem] rounded-full bg-volt/[.07] blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-10 bg-volt/60" />
            <p className="eyebrow text-volt">Prode Master</p>
          </div>
          <h1 className="display-giant text-[clamp(2.75rem,8vw,6rem)] text-white">
            Torneos de <span className="text-volt italic-skew">pronósticos</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[#a3a39c] leading-relaxed">
            Creá tu torneo, invitá gente con un código y competí pronosticando partidos reales.
            <span className="text-white"> Resultado exacto +3</span>,
            <span className="text-white"> acertar el ganador +1</span>. Se cuentan 90' + 30' de
            suplementario, sin penales.
          </p>
        </div>

        {!user && (
          <div className="panel clip-card p-8 text-center">
            <p className="text-[#a3a39c]">
              Iniciá sesión para crear torneos y pronosticar.{" "}
              <Link to="/login" className="text-volt hover:underline">Ingresar</Link>
            </p>
          </div>
        )}

        {user && (
          <AnimatePresence mode="wait">
            {/* ==================== VISTA LISTA ==================== */}
            {!selectedId && (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Acciones */}
                <div className="grid md:grid-cols-2 gap-4 mb-10">
                  <button
                    onClick={() => setShowCreate(true)}
                    className="group panel border-line clip-card p-5 text-left hover:border-volt/50 transition-colors flex items-center gap-4"
                  >
                    <span className="grid place-items-center w-12 h-12 bg-volt text-ink clip-tag shrink-0">
                      <Icon.Plus />
                    </span>
                    <span>
                      <span className="block font-display font-700 text-white text-lg group-hover:text-volt transition-colors">
                        Crear torneo
                      </span>
                      <span className="block text-sm text-[#8a8a82]">Armá tu liga privada e invitá amigos</span>
                    </span>
                  </button>

                  <div className="panel border-line clip-card p-5 flex items-center gap-3">
                    <input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO"
                      maxLength={8}
                      className="flex-1 min-w-0 bg-surface border border-line text-white font-stat font-700 tracking-[0.3em] text-center py-3 outline-none focus:border-volt clip-tag placeholder:text-[#5a5a52] placeholder:tracking-normal placeholder:font-body"
                    />
                    <button
                      onClick={joinByCode} disabled={busy || !joinCode.trim()}
                      className="px-5 py-3 border border-volt/50 text-volt font-display font-700 uppercase tracking-wider text-xs clip-btn hover:bg-volt/10 disabled:opacity-40 transition-colors shrink-0"
                    >
                      Unirme
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[0, 1, 2].map((i) => <div key={i} className="skeleton h-48 clip-card" />)}
                  </div>
                ) : (
                  <>
                    {/* Mis torneos */}
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="display-giant text-2xl text-white">Mis torneos</h2>
                      <span className="h-px flex-1 bg-line" />
                      <span className="eyebrow text-[10px] text-[#6b6b64]">{torneos.mine.length}</span>
                    </div>
                    {torneos.mine.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                        {torneos.mine.map((t) => (
                          <TorneoCard key={t.id} torneo={t} onOpen={() => setSelectedId(t.id)} />
                        ))}
                      </div>
                    ) : (
                      <div className="panel clip-card p-8 text-center mb-12">
                        <p className="text-[#8a8a82]">Todavía no estás en ningún torneo. Creá uno o sumate a uno público.</p>
                      </div>
                    )}

                    {/* Descubrir */}
                    {torneos.descubrir.length > 0 && (
                      <>
                        <div className="flex items-center gap-3 mb-5">
                          <h2 className="display-giant text-2xl text-white">Torneos públicos</h2>
                          <span className="h-px flex-1 bg-line" />
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {torneos.descubrir.map((t) => (
                            <TorneoCard
                              key={t.id} torneo={t}
                              onOpen={() => setSelectedId(t.id)}
                              onJoin={() => joinPublic(t.id)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ==================== VISTA DETALLE ==================== */}
            {selectedId && (
              <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <button
                  onClick={() => { setSelectedId(null); setDetail(null); setTab("pronosticar"); }}
                  className="inline-flex items-center gap-2 eyebrow text-[10px] text-[#8a8a82] hover:text-volt transition-colors mb-6"
                >
                  <Icon.Back /> Volver a torneos
                </button>

                {detailLoading || !detail ? (
                  <div className="space-y-5">
                    <div className="skeleton h-40 clip-card" />
                    <div className="skeleton h-64 clip-card" />
                  </div>
                ) : (
                  <>
                    {/* Cabecera del torneo */}
                    <div className="panel border-line clip-card overflow-hidden mb-6">
                      <div className="absolute inset-x-0 top-0 h-[3px] bg-volt" />
                      <div className="p-6 grid lg:grid-cols-[1fr_auto] gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {detail.torneo.oficial ? (
                              <span className="eyebrow text-[9px] text-gold panel-2 clip-tag px-2 py-1">Oficial</span>
                            ) : (
                              <span className="eyebrow text-[9px] text-cyan panel-2 clip-tag px-2 py-1">
                                {detail.torneo.isPublic ? "Público" : "Privado"}
                              </span>
                            )}
                            <span className="eyebrow text-[9px] text-[#6b6b64] inline-flex items-center gap-1.5">
                              <Icon.Users /> {detail.torneo.memberCount} participantes
                            </span>
                          </div>
                          <h2 className="display-giant text-4xl text-white">{detail.torneo.nombre}</h2>
                          {detail.torneo.descripcion && (
                            <p className="mt-2 text-sm text-[#a3a39c] max-w-xl">{detail.torneo.descripcion}</p>
                          )}
                        </div>

                        {/* Código de invitación + acciones */}
                        <div className="flex flex-col gap-3 lg:items-end">
                          <div className="panel-2 clip-card p-4">
                            <p className="eyebrow text-[9px] text-[#6b6b64] mb-1.5">Código de invitación</p>
                            <button onClick={() => copyCode(detail.torneo.codigo)} className="group inline-flex items-center gap-2.5">
                              <span className="font-mega text-2xl tracking-[0.2em] text-gradient-volt">{detail.torneo.codigo}</span>
                              <span className="text-[#8a8a82] group-hover:text-volt transition-colors">
                                <Icon.Copy />
                              </span>
                            </button>
                            {copied && <p className="eyebrow text-[9px] text-volt mt-1">Copiado</p>}
                          </div>
                          {detail.isMember && (
                            <button onClick={() => setConfirmLeave(true)} className="eyebrow text-[10px] text-[#6b6b64] hover:text-live transition-colors">
                              {detail.torneo.isOwner ? "Eliminar torneo" : "Abandonar torneo"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Mi posición */}
                      {myRow && (
                        <div className="grid grid-cols-3 border-t border-line divide-x divide-line">
                          <div className="p-4 text-center">
                            <p className="eyebrow text-[9px] text-[#6b6b64]">Mi posición</p>
                            <p className="font-mega text-2xl text-white mt-1">#{myRow.rank}</p>
                          </div>
                          <div className="p-4 text-center">
                            <p className="eyebrow text-[9px] text-[#6b6b64]">Puntos</p>
                            <p className="font-mega text-2xl text-volt mt-1">{myRow.puntos}</p>
                          </div>
                          <div className="p-4 text-center">
                            <p className="eyebrow text-[9px] text-[#6b6b64]">Exactos</p>
                            <p className="font-mega text-2xl text-white mt-1">{myRow.aciertos}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {!detail.isMember && (
                      <div className="panel clip-card p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
                        <p className="text-[#a3a39c] text-sm">Sumate a este torneo para cargar tus pronósticos.</p>
                        <button
                          onClick={() => joinPublic(detail.torneo.id)}
                          className="px-5 py-2.5 bg-volt text-ink font-display font-700 uppercase tracking-wider text-xs clip-btn hover:bg-white transition-colors"
                        >
                          Unirme al torneo
                        </button>
                      </div>
                    )}

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[
                        { id: "pronosticar", label: "Pronosticar" },
                        { id: "tabla", label: "Tabla de posiciones" },
                        { id: "fixture", label: "Fixture" },
                      ].map((t) => (
                        <button
                          key={t.id} onClick={() => setTab(t.id)}
                          className={`eyebrow text-[10px] px-4 py-2.5 clip-tag transition-colors ${
                            tab === t.id ? "bg-volt text-ink" : "panel-2 text-[#8a8a82] hover:text-white"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Contenido de tab */}
                    {tab === "pronosticar" && (
                      <div className="grid gap-4">
                        {!detail.isMember ? (
                          <p className="text-center text-[#8a8a82] py-16">Uníte al torneo para pronosticar.</p>
                        ) : upcoming.length === 0 ? (
                          <p className="text-center text-[#8a8a82] py-16">No hay partidos próximos para pronosticar por ahora.</p>
                        ) : (
                          upcoming.map((m) => (
                            <MatchPredictor key={m.id} match={m} existing={predByMatch[m.id]} onSave={predictInTorneo} />
                          ))
                        )}
                      </div>
                    )}

                    {tab === "tabla" && (
                      <div className="panel border-line clip-card overflow-hidden">
                        <div className="grid grid-cols-[3rem_1fr_5rem_5rem] px-5 py-3 border-b border-line bg-ink-2/50 eyebrow text-[9px] text-[#6b6b64]">
                          <span>#</span><span>Jugador</span>
                          <span className="text-right">Exactos</span>
                          <span className="text-right">Puntos</span>
                        </div>
                        {detail.leaderboard.length === 0 ? (
                          <p className="text-center text-[#8a8a82] py-12">Sin participantes todavía.</p>
                        ) : detail.leaderboard.map((row) => (
                          <div
                            key={row.userId}
                            className={`grid grid-cols-[3rem_1fr_5rem_5rem] px-5 py-3.5 items-center border-b border-line last:border-0 ${
                              row.isMe ? "bg-volt/[.06]" : ""
                            }`}
                          >
                            <span className={`font-mega text-lg ${row.rank <= 3 ? "text-volt" : "text-[#5a5a52]"}`}>
                              {row.rank}
                            </span>
                            <span className="font-display font-600 text-white truncate inline-flex items-center gap-2">
                              {row.rank === 1 && <span className="text-gold"><Icon.Trophy /></span>}
                              {row.name}
                              {row.isMe && <span className="eyebrow text-[8px] text-volt">Vos</span>}
                            </span>
                            <span className="text-right font-stat text-[#8a8a82] tabular-nums">{row.aciertos}</span>
                            <span className="text-right font-stat font-700 text-volt tabular-nums">{row.puntos}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab === "fixture" && (
                      <div className="grid gap-3">
                        {[...upcoming, ...finishedFx].map((m) => {
                          const st = STATUS[m.status] || STATUS.scheduled;
                          return (
                            <div key={m.id} className="panel border-line clip-card px-5 py-4 flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="font-display font-600 text-white truncate">{m.teamA} vs {m.teamB}</p>
                                <p className="text-sm text-[#6b6b64] mt-0.5">{formatDate(m.scheduledAt)}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`eyebrow text-[10px] ${st.cls} inline-flex items-center gap-1.5 justify-end`}>
                                  {m.status === "live" && <span className="live-dot" />}{st.text}
                                </span>
                                {m.result && <p className="font-stat font-700 text-white mt-0.5">{m.result}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Modal crear torneo */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-5 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="panel border-line clip-card w-full max-w-md overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-volt" />
              <div className="p-6">
                <p className="eyebrow text-volt mb-1">Nuevo torneo</p>
                <h3 className="display-giant text-3xl text-white mb-5">Armá tu liga</h3>

                <label className="block eyebrow text-[10px] text-[#6b6b64] mb-1.5">Nombre</label>
                <input
                  value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Prode de amigos" maxLength={40}
                  className="w-full bg-surface border border-line text-white px-4 py-3 outline-none focus:border-volt clip-tag mb-4"
                />

                <label className="block eyebrow text-[10px] text-[#6b6b64] mb-1.5">Descripción (opcional)</label>
                <textarea
                  value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2} maxLength={140} placeholder="Ganador se lleva el asado"
                  className="w-full bg-surface border border-line text-white px-4 py-3 outline-none focus:border-volt clip-tag mb-4 resize-none"
                />

                <button
                  onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                  className="w-full flex items-center justify-between panel-2 clip-tag px-4 py-3 mb-5"
                >
                  <span className="text-left">
                    <span className="block text-sm text-white font-display font-600">
                      {form.isPublic ? "Torneo público" : "Torneo privado"}
                    </span>
                    <span className="block text-xs text-[#6b6b64]">
                      {form.isPublic ? "Aparece en la lista para que cualquiera se sume" : "Solo entra quien tenga el código"}
                    </span>
                  </span>
                  <span className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${form.isPublic ? "bg-volt" : "bg-line"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-ink transition-all ${form.isPublic ? "left-[1.375rem]" : "left-0.5"}`} />
                  </span>
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 panel-2 text-[#8a8a82] font-display font-700 uppercase tracking-wider text-xs clip-btn hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createTorneo} disabled={busy || form.nombre.trim().length < 3}
                    className="flex-1 py-3 bg-volt text-ink font-display font-700 uppercase tracking-wider text-xs clip-btn hover:bg-white disabled:opacity-40 transition-colors"
                  >
                    {busy ? "Creando..." : "Crear torneo"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmLeave}
        title={detail?.torneo?.isOwner ? "¿Eliminar torneo?" : "¿Abandonar torneo?"}
        message={
          detail?.torneo?.isOwner
            ? "Se elimina para todos los participantes. Esta acción no se puede deshacer."
            : "Vas a dejar de ver este torneo y tus pronósticos en él."
        }
        confirmLabel={detail?.torneo?.isOwner ? "Eliminar" : "Abandonar"}
        danger
        onConfirm={leaveOrDelete}
        onCancel={() => setConfirmLeave(false)}
      />
    </div>
  );
};

export default Prode;
