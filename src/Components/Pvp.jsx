import {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayerCard from "./Cards/PlayerCard.jsx";
import { PLAYER_PLACEHOLDER } from "../api/normalize";
import { createSocket } from "../api/socket.js";
import { cardsApi } from "../api";
import { AuthContext } from "../Contexts/AuthContext.jsx";

/* ============================================================
   PVP · ARENA 5V5 — presentación
   ============================================================ */

const PHASES = [
  { id: "disconnected", label: "Lobby" },
  { id: "waiting", label: "Sala" },
  { id: "selecting", label: "Alineación" },
  { id: "battling", label: "Combate" },
  { id: "finished", label: "Resultado" },
];

/* Disposición 1-2-1-1 sobre el campo para los 5 titulares */
const FIELD_SLOTS = [
  { role: "DEL", top: "14%", left: "50%" },
  { role: "MED", top: "38%", left: "24%" },
  { role: "MED", top: "38%", left: "76%" },
  { role: "DEF", top: "62%", left: "50%" },
  { role: "POR", top: "85%", left: "50%" },
];

const power = (p) => p?.stats?.generalValue ?? p?.power ?? 0;

/* ---------- Tracker de fases (HUD superior) ---------- */
const PhaseTracker = ({ status }) => {
  const current = PHASES.findIndex((p) => p.id === status);
  return (
    <div className="no-scrollbar flex items-center gap-0 overflow-x-auto">
      {PHASES.map((phase, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={phase.id} className="flex items-center">
            {i > 0 && (
              <div
                className={`h-px w-6 sm:w-10 ${done || active ? "bg-volt/60" : "bg-line"}`}
              />
            )}
            <div
              className={`clip-tag flex items-center gap-2 px-3 py-1.5 ${
                active
                  ? "bg-volt text-ink"
                  : done
                    ? "bg-volt/15 text-volt"
                    : "bg-surface text-[#6b6b64]"
              }`}
            >
              <span className="font-stat text-xs font-700">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="eyebrow !tracking-[0.2em] text-[10px]">
                {phase.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Shell del modo (a nivel de módulo para no remontar hijos) ---------- */
const ArenaShell = ({ status, username, error, children }) => (
  <div className="relative min-h-screen overflow-hidden bg-ink pb-bottom-nav text-[#ededea] grain">
    {/* Backdrop de estadio */}
    <div className="absolute inset-0 bg-pitch-grid opacity-40" />
    <div className="absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-volt/[0.07] blur-[130px]" />
    <div className="absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-coral/[0.06] blur-[110px]" />
    {/* Marca de agua gigante */}
    <div className="pointer-events-none absolute top-24 right-[-2rem] hidden select-none lg:block">
      <span className="display-giant outline-text text-[11rem] opacity-40">
        5V5
      </span>
    </div>

    <div className="relative z-10 mx-auto max-w-7xl px-5 pt-28 sm:px-8">
      {/* Cabecera del modo */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="eyebrow mb-3 flex items-center gap-3 text-volt"
          >
            <span className="live-dot" /> Modo competitivo
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="display-giant text-[clamp(3rem,9vw,6.5rem)] text-white"
          >
            Arena <span className="text-volt italic-skew">5v5</span>
          </motion.h1>
          <p className="mt-4 max-w-xl text-sm text-[#a3a39c] sm:text-base">
            Creá una sala, elegí a tus 5 titulares y enfrentá a otro entrenador
            en tiempo real. El equipo con más poder se lleva los puntos.
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="panel clip-tag px-5 py-3 text-right">
            <div className="eyebrow text-[10px] text-[#6b6b64]">Entrenador</div>
            <div className="font-display text-lg font-700 text-white">
              {username}
            </div>
          </div>
          <PhaseTracker status={status} />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <div className="clip-tag inline-flex items-center gap-3 border border-coral/40 bg-coral/10 px-5 py-2.5 text-sm text-coral">
              <span className="live-dot" /> {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pb-16">{children}</div>
    </div>
  </div>
);

/* ---------- Columna de equipo (pantalla de combate) ---------- */
const BattleColumn = ({ title, team, accent, align, hidden }) => (
  <div className={`flex-1 ${align === "right" ? "text-right" : ""}`}>
    <div
      className={`mb-4 flex items-center gap-3 ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      <span className={`h-6 w-1.5 ${accent === "coral" ? "bg-coral" : "bg-volt"}`} />
      <h3 className="font-display text-lg font-700 uppercase tracking-wider text-white">
        {title}
      </h3>
    </div>
    <div className="space-y-2">
      {(hidden ? [...Array(5)] : team).map((p, i) => (
        <motion.div
          key={p?._id || i}
          initial={{ opacity: 0, x: align === "right" ? 24 : -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.09 }}
          className={`glass flex items-center gap-3 rounded-none border-l-2 p-2.5 ${
            align === "right" ? "flex-row-reverse border-l-0 border-r-2" : ""
          } ${accent === "coral" ? "border-coral/50" : "border-volt/50"}`}
        >
          {hidden ? (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center bg-surface-2 font-stat text-lg font-700 text-[#4a4a44]">
                ?
              </span>
              <div className={align === "right" ? "text-right" : ""}>
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton mt-1.5 h-2 w-14 rounded" />
              </div>
            </>
          ) : (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center bg-surface-2 font-stat text-lg font-700 text-gold">
                {power(p) || "—"}
              </span>
              <div className={align === "right" ? "text-right" : ""}>
                <p className="text-sm font-medium leading-tight text-white">
                  {p.name}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-[#6b6b64]">
                  {p.position}
                </p>
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  </div>
);

/* ============================================================
   Componente principal
   ============================================================ */

const Pvp = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const username = user?.name || user?.email || "Jugador";

  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState(""); // id interno de la sala (private-XXXX)
  const [roomCode, setRoomCode] = useState(""); // código a compartir
  const [joinId, setJoinId] = useState("");
  const [status, setStatus] = useState("disconnected");
  // 'disconnected', 'waiting', 'selecting', 'battling', 'finished'
  const [opponentTeam, setOpponentTeam] = useState([]);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  // 'waiting-rival' (confirmé, falta el rival) | 'resolving' (ambos listos)
  const [battlePhase, setBattlePhase] = useState("waiting-rival");
  // true entre que confirmo mi equipo y que termina/cae la partida: evita que
  // un roomUpdated con status "selecting" me devuelva a la pantalla de armado.
  const confirmedRef = useRef(false);

  // De { socketId: [cartas resueltas] } (payload de gameStarted/gameFinished)
  // se queda con las cartas del rival: la única entrada que no es la propia.
  const resolveOpponent = useCallback((teams) => {
    const socket = socketRef.current;
    if (!socket || !teams) return [];
    const entry = Object.entries(teams).find(([socketId]) => socketId !== socket.id);
    return entry ? entry[1] : [];
  }, []);

  // Crea (una vez) el socket autenticado y registra los listeners del juego.
  const ensureSocket = useCallback(() => {
    if (socketRef.current) return socketRef.current;
    const socket = createSocket({ name: username, userId: user?.id });
    socketRef.current = socket;

    socket.on("roomUpdated", (room) => {
      setRoomId(room.id);
      setRoomCode(room.roomCode || "");
      if (room.status === "waiting") {
        confirmedRef.current = false;
        setStatus("waiting");
      }
      if (room.status === "selecting" && !confirmedRef.current) {
        setStatus("selecting");
      }
    });
    socket.on("selectionPhase", () => {
      if (!confirmedRef.current) setStatus("selecting");
    });
    socket.on("gameStarted", (payload) => {
      setError("");
      setBattlePhase("resolving");
      setStatus("battling");
      setOpponentTeam(resolveOpponent(payload?.teams));
    });
    socket.on("gameFinished", (payload) => {
      confirmedRef.current = false;
      setResult({ winner: payload.winner, score: payload.score });
      if (payload?.teams) setOpponentTeam(resolveOpponent(payload.teams));
      setStatus("finished");
      refreshUser?.();
    });
    socket.on("playerLeft", () => {
      confirmedRef.current = false;
      setError("Tu rival se desconectó de la sala. Compartí el código para que entre otro jugador.");
    });
    socket.on("connect_error", () => {
      setError("No se pudo conectar al servidor de salas.");
    });
    socket.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        setError("Se perdió la conexión con el servidor. Revisá tu conexión y volvé a crear la sala.");
      }
    });

    return socket;
  }, [username, user?.id, refreshUser, resolveOpponent]);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const handleSubmitTeam = () => {
    if (selectedPlayers.length !== 5) return;
    const socket = socketRef.current;
    if (!socket) return;
    setError("");
    confirmedRef.current = true;
    socket.emit(
      "selectPlayers",
      {
        roomId,
        selectedPlayers: selectedPlayers.map((p) => String(p.id)),
      },
      (res) => {
        // Si el server rechaza la selección, volvemos a la fase de alineación
        // en vez de quedar "escaneando" para siempre.
        if (res?.status !== "ok") {
          confirmedRef.current = false;
          setError(res?.message || "No se pudo confirmar el equipo. Probá de nuevo.");
          setStatus("selecting");
        }
      },
    );
    setBattlePhase("waiting-rival");
    setStatus("battling");
  };

  const loadMyPlayers = async () => {
    setLoading(true);
    try {
      const data = await cardsApi.mine();
      setPlayers(data);
      return data;
    } catch (err) {
      console.error("Error al cargar jugadores:", err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    setError("");
    setLoading(true);
    try {
      const socket = ensureSocket();
      socket.emit("createPrivateRoom", { pointsInGame: 100 }, (res) => {
        if (res?.status === "ok") {
          setRoomId(res.room.id);
          setRoomCode(res.room.roomCode);
          setStatus("waiting");
        }
      });
      await loadMyPlayers();
    } catch (error) {
      console.error("Error en createRoom:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!joinId) return;
    setError("");
    const socket = ensureSocket();
    socket.emit(
      "joinPrivateRoom",
      { roomCode: joinId.toUpperCase() },
      (res) => {
        if (res?.status === "ok") {
          setRoomId(res.room.id);
          setRoomCode(res.room.roomCode);
          setStatus("selecting");
        } else {
          setError(res?.message || "No se pudo unir a la sala");
        }
      },
    );
    await loadMyPlayers();
  };

  const selectPlayer = useCallback((player) => {
    if (!player || !player._id) return;
    setSelectedPlayers((prev) => {
      const isSelected = prev.some((p) => p?._id === player._id);
      if (isSelected) return prev.filter((p) => p?._id !== player._id);
      if (prev.length >= 5) return prev;
      return [...prev, player];
    });
  }, []);

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => window.location.reload();

  const squadPower = useMemo(
    () => selectedPlayers.reduce((acc, p) => acc + power(p), 0),
    [selectedPlayers],
  );

  /* ================= Lobby ================= */

  const renderLobby = () => (
    <div className="space-y-10">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Crear sala */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="group panel clip-card relative overflow-hidden p-7 transition-colors hover:border-volt/50 md:p-9"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,255,0,0.08),transparent_55%)]" />
          <div className="absolute -right-6 -top-8 select-none">
            <span className="index-num">01</span>
          </div>
          <div className="relative">
            <p className="eyebrow text-volt">Anfitrión</p>
            <h3 className="mt-3 font-mega text-4xl uppercase text-white md:text-5xl">
              Crear sala
            </h3>
            <p className="mt-4 max-w-sm text-sm text-[#a3a39c]">
              Generá una sala privada y compartí el código con tu rival. Cuando
              entre, ambos eligen sus 5 titulares.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-[#6b6b64]">
              <span className="clip-tag bg-surface-2 px-3 py-1.5 font-stat font-700 text-gold">
                100 PTS
              </span>
              <span className="uppercase tracking-wider">en juego</span>
            </div>
            <button
              onClick={createRoom}
              disabled={loading}
              className="clip-btn shine relative mt-8 w-full bg-volt py-4 font-display text-sm font-700 uppercase tracking-[0.2em] text-ink transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-12"
            >
              {loading ? "Creando sala..." : "Crear sala privada"}
            </button>
          </div>
        </motion.div>

        {/* Unirse a sala */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="group panel clip-card relative overflow-hidden p-7 transition-colors hover:border-coral/50 md:p-9"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,46,99,0.07),transparent_55%)]" />
          <div className="absolute -right-6 -top-8 select-none">
            <span className="index-num">02</span>
          </div>
          <div className="relative">
            <p className="eyebrow text-coral">Retador</p>
            <h3 className="mt-3 font-mega text-4xl uppercase text-white md:text-5xl">
              Unirse
            </h3>
            <p className="mt-4 max-w-sm text-sm text-[#a3a39c]">
              ¿Te desafiaron? Ingresá el código de la sala y entrá directo a
              elegir tu alineación.
            </p>
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              placeholder="CÓDIGO"
              maxLength={12}
              className="clip-tag mt-6 w-full border border-line bg-ink-2 px-4 py-3.5 text-center font-stat text-xl font-700 uppercase tracking-[0.45em] text-white outline-none transition placeholder:text-[#3a3a36] focus:border-coral/60"
            />
            <button
              onClick={joinRoom}
              disabled={!joinId}
              className="clip-btn mt-4 w-full border border-coral/50 py-4 font-display text-sm font-700 uppercase tracking-[0.2em] text-coral transition hover:bg-coral hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:px-12"
            >
              Entrar a la arena
            </button>
          </div>
        </motion.div>
      </div>

      {/* Cómo funciona */}
      <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
        {[
          {
            n: "A",
            t: "Compartí el código",
            d: "Creá la sala y pasale el código a tu rival para abrir el duelo.",
          },
          {
            n: "B",
            t: "Elegí tus 5 titulares",
            d: "Seleccioná las mejores cartas de tu colección para el combate.",
          },
          {
            n: "C",
            t: "Ganá los puntos",
            d: "El equipo con más poder total se queda con los puntos en juego.",
          },
        ].map((step) => (
          <div key={step.n} className="bg-ink-2 p-6">
            <span className="font-mega text-3xl text-volt/60">{step.n}</span>
            <h4 className="mt-3 font-display font-700 uppercase tracking-wide text-white">
              {step.t}
            </h4>
            <p className="mt-2 text-sm text-[#8a8a82]">{step.d}</p>
          </div>
        ))}
      </div>
    </div>
  );

  /* ================= Esperando rival ================= */

  const renderWaiting = () => (
    <div className="mx-auto max-w-2xl">
      <div className="panel clip-card relative overflow-hidden p-8 text-center md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,255,0,0.08),transparent_55%)]" />
        <div className="relative">
          {/* Radar */}
          <div className="relative mx-auto mb-8 h-28 w-28">
            <span className="absolute inset-0 rounded-full border border-volt/15" />
            <span className="absolute inset-3 rounded-full border border-volt/25" />
            <span className="absolute inset-6 rounded-full border border-volt/35" />
            <motion.span
              className="absolute inset-0 rounded-full border-t-2 border-volt"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
            />
            <motion.span
              className="absolute inset-0 rounded-full bg-volt/10"
              animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            />
            <div className="absolute inset-0 grid place-items-center font-mega text-2xl text-volt">
              VS
            </div>
          </div>

          <p className="eyebrow flex items-center justify-center gap-2 text-volt">
            <span className="live-dot" /> Sala abierta
          </p>
          <h2 className="mt-3 font-mega text-4xl uppercase text-white md:text-5xl">
            Buscando rival
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-[#a3a39c]">
            Compartí este código con tu oponente. Apenas entre, comienza la
            selección de titulares.
          </p>

          {/* Código de sala, letra por letra */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {(roomCode || "·····").split("").map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="clip-tag grid h-14 w-11 place-items-center border border-volt/30 bg-ink-2 font-stat text-2xl font-700 text-volt sm:h-16 sm:w-13 sm:text-3xl"
              >
                {ch}
              </motion.span>
            ))}
          </div>

          <button
            onClick={copyCode}
            className={`clip-btn mt-7 px-10 py-3.5 font-display text-sm font-700 uppercase tracking-[0.2em] transition-all ${
              copied
                ? "bg-volt text-ink"
                : "border border-volt/40 text-volt hover:bg-volt/10"
            }`}
          >
            {copied ? "✓ Código copiado" : "Copiar código"}
          </button>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-[#6b6b64]">
            Esperando conexión
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full bg-volt"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.25 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ================= Selección de equipo ================= */

  const renderSelecting = () => (
    <div>
      {/* HUD de selección */}
      <div className="panel clip-card mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="eyebrow text-volt">Fase de alineación</p>
          <h2 className="mt-1 font-mega text-3xl uppercase text-white md:text-4xl">
            Elegí tus 5 titulares
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          {/* Indicadores de slots */}
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-8 w-3 skew-x-[-12deg] transition-colors ${
                  i < selectedPlayers.length ? "bg-volt" : "bg-surface-2"
                }`}
              />
            ))}
          </div>
          <div className="text-right">
            <div className="eyebrow text-[10px] text-[#6b6b64]">
              Poder total
            </div>
            <div className="font-stat text-3xl font-700 leading-none text-gold">
              {squadPower}
            </div>
          </div>
          <button
            onClick={handleSubmitTeam}
            disabled={selectedPlayers.length !== 5}
            className={`clip-btn shine relative px-8 py-3.5 font-display text-sm font-700 uppercase tracking-[0.2em] transition-all ${
              selectedPlayers.length === 5
                ? "anim-glow bg-volt text-ink hover:bg-white"
                : "cursor-not-allowed border border-line text-[#5a5a54]"
            }`}
          >
            {selectedPlayers.length === 5
              ? "⚔ Confirmar equipo"
              : `Faltan ${5 - selectedPlayers.length}`}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-24">
          <motion.div
            className="h-10 w-10 rounded-full border-2 border-volt/30 border-t-volt"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          />
        </div>
      ) : players.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          {/* Campo táctico */}
          <div className="panel clip-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow text-volt">Campo táctico</p>
                <h3 className="font-display text-xl font-700 text-white">
                  Tu formación
                </h3>
              </div>
              <span className="clip-tag bg-surface-2 px-3 py-1.5 font-stat text-sm font-700 text-volt">
                {selectedPlayers.length}/5
              </span>
            </div>
            <div className="relative h-[480px] overflow-hidden rounded-sm border border-volt/15 bg-[linear-gradient(180deg,#0d3b22_0%,#0a2d1a_50%,#071f12_100%)]">
              {/* Césped rayado + líneas de cancha */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_47px,rgba(255,255,255,0.035)_47px,rgba(255,255,255,0.035)_96px)]" />
              <div className="absolute inset-x-6 top-5 bottom-5 rounded-sm border border-white/15" />
              <div className="absolute left-6 right-6 top-1/2 h-px bg-white/15" />
              <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
              <div className="absolute left-1/2 top-5 h-10 w-32 -translate-x-1/2 border-x border-b border-white/15" />
              <div className="absolute left-1/2 bottom-5 h-10 w-32 -translate-x-1/2 border-x border-t border-white/15" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,255,0,0.06),transparent_65%)]" />

              {FIELD_SLOTS.map((slot, i) => {
                const p = selectedPlayers[i];
                return (
                  <motion.button
                    key={i}
                    onClick={() => p && selectPlayer(p)}
                    initial={false}
                    animate={p ? { scale: [0.8, 1.08, 1] } : {}}
                    transition={{ duration: 0.35 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ top: slot.top, left: slot.left }}
                    title={p ? "Quitar del equipo" : "Elegí una carta de tu colección"}
                  >
                    {p ? (
                      <div className="group flex w-24 flex-col items-center">
                        <div className="relative">
                          <img
                            src={p.image || PLAYER_PLACEHOLDER}
                            alt={p.name}
                            className="h-16 w-16 rounded-full border-2 border-volt bg-ink object-cover shadow-[0_0_20px_rgba(212,255,0,0.35)]"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = PLAYER_PLACEHOLDER;
                            }}
                          />
                          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-gold font-stat text-[11px] font-700 text-ink">
                            {power(p) || "—"}
                          </span>
                          <span className="absolute -right-1 -bottom-1 hidden h-5 w-5 place-items-center rounded-full bg-coral text-[10px] font-700 text-white group-hover:grid">
                            ✕
                          </span>
                        </div>
                        <span className="clip-tag mt-1.5 max-w-full truncate bg-ink/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          {p.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full border border-dashed border-white/30 bg-ink/40 transition hover:border-volt/60">
                        <span className="font-stat text-[11px] font-700 uppercase tracking-widest text-white/60">
                          {slot.role}
                        </span>
                        <span className="text-[9px] uppercase text-white/30">
                          libre
                        </span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[#6b6b64]">
              Tocá una carta de tu colección para sumarla. Tocá un titular en el
              campo para quitarlo.
            </p>
          </div>

          {/* Colección */}
          <div className="panel clip-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow text-volt">Tu colección</p>
                <h3 className="font-display text-xl font-700 text-white">
                  Cartas disponibles
                </h3>
              </div>
              <span className="text-sm text-[#6b6b64]">
                {players.length} cartas
              </span>
            </div>
            <div className="grid max-h-[520px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
              {players.map((player, index) => (
                <PlayerCard
                  key={`${player._id}-${index}`}
                  player={player}
                  onClick={() => selectPlayer(player)}
                  selected={selectedPlayers.some((p) => p?._id === player?._id)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="panel clip-card py-20 text-center">
          <p className="font-display text-lg text-[#a3a39c]">
            Todavía no tenés cartas para competir.
          </p>
          <a
            href="/sobres"
            className="clip-btn mt-5 inline-block bg-volt px-8 py-3 font-display text-sm font-700 uppercase tracking-[0.2em] text-ink transition hover:bg-white"
          >
            Abrir un sobre →
          </a>
        </div>
      )}
    </div>
  );

  /* ================= Combate ================= */

  const renderBattle = () => (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 text-center">
        <motion.div
          animate={{ opacity: [1, 0.55, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className={`clip-tag inline-flex items-center gap-3 border px-5 py-2 ${
            battlePhase === "resolving"
              ? "border-coral/40 bg-coral/10"
              : "border-volt/40 bg-volt/10"
          }`}
        >
          <span className="live-dot" />
          <span
            className={`font-stat text-sm font-700 uppercase tracking-[0.3em] ${
              battlePhase === "resolving" ? "text-coral" : "text-volt"
            }`}
          >
            {battlePhase === "resolving"
              ? "Combate en curso"
              : "Equipo confirmado"}
          </span>
        </motion.div>
      </div>

      <div className="panel clip-card relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,255,0,0.06),transparent_50%)]" />
        {/* Línea de escaneo */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-volt/70 to-transparent"
          animate={{ top: ["6%", "94%", "6%"] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />

        <div className="relative">
          {/* Marcador superior */}
          <div className="mb-8 flex items-center justify-center gap-6 md:gap-12">
            <div className="text-right">
              <p className="font-display text-sm font-700 uppercase tracking-wider text-white md:text-lg">
                {username}
              </p>
              <p className="font-stat text-3xl font-700 text-volt md:text-4xl">
                {squadPower}
              </p>
            </div>
            <div className="relative">
              <motion.span
                className="absolute inset-0 rounded-full bg-volt/20 blur-xl"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="display-giant relative text-5xl text-white md:text-6xl">
                VS
              </span>
            </div>
            <div>
              <p className="font-display text-sm font-700 uppercase tracking-wider text-white md:text-lg">
                Rival
              </p>
              <p className="font-stat text-3xl font-700 text-coral md:text-4xl">
                ???
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <BattleColumn
              title="Tu equipo"
              team={selectedPlayers}
              accent="volt"
              align="left"
            />
            <div className="hidden w-px self-stretch bg-line md:block" />
            <BattleColumn
              title="Rival"
              team={opponentTeam}
              accent="coral"
              align="right"
              hidden={opponentTeam.length === 0}
            />
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-[#6b6b64]">
            {battlePhase === "resolving"
              ? "Resolviendo combate"
              : "Esperando la confirmación del rival"}
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full bg-volt"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.25 }}
              />
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={reset}
              className="text-xs uppercase tracking-[0.2em] text-[#5a5a54] underline-offset-4 transition hover:text-coral hover:underline"
            >
              Abandonar la sala
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ================= Resultado ================= */

  const renderResult = () => {
    const win = result?.winner === username;
    const draw = result?.winner === "Empate";
    const accent = win ? "volt" : draw ? "gold" : "coral";
    return (
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="panel clip-card relative overflow-hidden p-10 text-center md:p-14"
        >
          <div
            className={`absolute inset-0 ${
              win
                ? "bg-[radial-gradient(circle_at_top,rgba(212,255,0,0.14),transparent_60%)]"
                : draw
                  ? "bg-[radial-gradient(circle_at_top,rgba(255,210,74,0.12),transparent_60%)]"
                  : "bg-[radial-gradient(circle_at_top,rgba(255,46,99,0.1),transparent_60%)]"
            }`}
          />
          <div className="relative">
            <p
              className={`eyebrow ${
                accent === "volt"
                  ? "text-volt"
                  : accent === "gold"
                    ? "text-gold"
                    : "text-coral"
              }`}
            >
              Combate finalizado
            </p>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className={`display-giant mt-4 text-[clamp(3.5rem,12vw,7rem)] ${
                win
                  ? "text-volt"
                  : draw
                    ? "text-gradient-gold"
                    : "outline-text"
              }`}
            >
              {win ? "Victoria" : draw ? "Empate" : "Derrota"}
            </motion.h2>

            <div className="mx-auto mt-6 inline-block">
              <div className="eyebrow text-[10px] text-[#6b6b64]">
                Marcador final
              </div>
              <div className="font-stat mt-1 text-4xl font-700 text-white">
                {result?.score}
              </div>
            </div>

            <p className="mt-5 text-sm text-[#a3a39c]">
              {win
                ? "Los puntos en juego son tuyos. Seguí sumando en la arena."
                : draw
                  ? "Nadie cede. Los puntos vuelven a sus dueños."
                  : "Reforzá tu plantilla y volvé a la arena por la revancha."}
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <button
                onClick={reset}
                className="clip-btn shine relative bg-volt px-10 py-4 font-display text-sm font-700 uppercase tracking-[0.2em] text-ink transition hover:bg-white"
              >
                Jugar de nuevo
              </button>
              <a
                href="/sobres"
                className="clip-btn border border-line px-10 py-4 font-display text-sm font-700 uppercase tracking-[0.2em] text-[#a3a39c] transition hover:border-volt/50 hover:text-volt"
              >
                Mejorar plantilla
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <ArenaShell status={status} username={username} error={error}>
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          {status === "disconnected" && renderLobby()}
          {status === "waiting" && renderWaiting()}
          {status === "selecting" && renderSelecting()}
          {status === "battling" && renderBattle()}
          {status === "finished" && renderResult()}
        </motion.div>
      </AnimatePresence>
    </ArenaShell>
  );
};

export default Pvp;
