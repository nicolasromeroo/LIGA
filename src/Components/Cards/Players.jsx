import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cardsApi } from "../../api";
import { AuthContext } from "../../Contexts/AuthContext";
import { PLAYER_PLACEHOLDER } from "../../api/normalize";

const rarityRing = {
  Común: "border-line",
  Raro: "border-cyan/50",
  Épico: "border-purple-500/60",
  Legendario: "border-gold/70",
};
const rarityTag = {
  Común: "text-slate-300",
  Raro: "text-cyan",
  Épico: "text-purple-400",
  Legendario: "text-gold",
};

const FILTERS = ["Todos", "Común", "Raro", "Épico", "Legendario"];

const Players = () => {
  const { user } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Todos");

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await cardsApi.mine();
        setCards(data);
      } catch (err) {
        console.error("Error al traer la colección:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCards();
    else setLoading(false);
  }, [user]);

  const groupedByPlayer = useMemo(() => {
    const grouped = cards.reduce((acc, card) => {
      const key = card.playerId;
      if (!acc[key]) acc[key] = { ...card, cantidad: 1 };
      else acc[key].cantidad += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => (b.power || 0) - (a.power || 0),
    );
  }, [cards]);

  const visibleCards = useMemo(() => {
    if (activeFilter === "Todos") return groupedByPlayer;
    return groupedByPlayer.filter((player) => player.rarity === activeFilter);
  }, [activeFilter, groupedByPlayer]);

  const stats = useMemo(() => {
    const unique = groupedByPlayer.length;
    const total = cards.length;
    const legendary = groupedByPlayer.filter(
      (p) => p.rarity === "Legendario",
    ).length;
    const epic = groupedByPlayer.filter((p) => p.rarity === "Épico").length;
    return { unique, total, legendary, epic };
  }, [cards.length, groupedByPlayer]);

  return (
    <div className="relative min-h-screen bg-ink text-[#ededea] pt-28 pb-24 px-5 sm:px-8 overflow-hidden grain">
      <div className="absolute inset-0 bg-pitch-grid opacity-40" />
      <div className="absolute -top-32 right-1/4 w-[40rem] h-[40rem] rounded-full bg-volt/10 blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="eyebrow text-volt mb-3"
            >
              Tu colección
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="display-giant text-[clamp(3rem,8vw,6rem)] text-white"
            >
              Mi <span className="text-volt italic-skew">colección</span>
            </motion.h1>
            <p className="mt-3 max-w-2xl text-[#a3a39c]">
              Acá vas a ver las cartas que realmente tenés, cuántas repetidas
              tenés y qué te sirve para armar tu mejor equipo.
            </p>
          </div>

          {!loading && user && (
            <div className="flex gap-3 flex-wrap">
              <div className="panel clip-tag px-5 py-3">
                <span className="font-mega text-3xl text-volt">
                  {stats.unique}
                </span>
                <span className="eyebrow text-[#6b6b64] ml-2">únicos</span>
              </div>
              <div className="panel clip-tag px-5 py-3">
                <span className="font-mega text-3xl text-volt">
                  {stats.total}
                </span>
                <span className="eyebrow text-[#6b6b64] ml-2">cartas</span>
              </div>
            </div>
          )}
        </div>

        {!user ? (
          <div className="panel clip-card p-8 text-center">
            <h2 className="text-2xl font-display font-700 text-white">
              Iniciá sesión para ver tu colección
            </h2>
            <p className="mt-3 text-[#a3a39c]">
              Tu colección te ayudará a seguir tus cartas, ver tus duplicados y
              armar equipos con mejor criterio.
            </p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Link
                to="/login"
                className="bg-volt text-ink font-display font-700 uppercase tracking-wider text-sm clip-btn px-6 py-3 hover:bg-white transition-colors"
              >
                Ingresar
              </Link>
              <Link
                to="/sobres"
                className="bg-gold text-ink font-display font-700 uppercase tracking-wider text-sm clip-btn px-6 py-3 hover:bg-white transition-colors"
              >
                Abrir sobres
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="grid place-items-center py-32">
            <motion.div
              className="w-10 h-10 border-2 border-volt/30 border-t-volt rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
          </div>
        ) : groupedByPlayer.length === 0 ? (
          <div className="text-center py-24 panel clip-card p-8">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-display font-700 text-white">
              Todavía no tenés cartas en tu colección
            </h2>
            <p className="mt-3 text-[#a3a39c]">
              Abrí un sobre y empezá a construir tu plantel.
            </p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Link
                to="/sobres"
                className="bg-volt text-ink font-display font-700 uppercase tracking-wider text-sm clip-btn px-6 py-3 hover:bg-white transition-colors"
              >
                Abrir sobre
              </Link>
              <Link
                to="/myPlayers"
                className="bg-[#11151d] text-white border border-line px-6 py-3 rounded-full hover:border-volt/40 transition-colors"
              >
                Ver mi equipo
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === filter
                      ? "bg-volt text-ink"
                      : "bg-[#11151d] text-[#8a8a82] hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {visibleCards.map((player, index) => {
                const ring = rarityRing[player.rarity] || rarityRing["Común"];
                const tag = rarityTag[player.rarity] || rarityTag["Común"];
                return (
                  <motion.div
                    key={player._id}
                    className={`group relative panel ${ring} clip-card overflow-hidden`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index % 10) * 0.04, duration: 0.4 }}
                    whileHover={{ y: -8 }}
                  >
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-volt/8 to-transparent z-0" />

                    <div className="absolute z-20 top-4 left-4 leading-none">
                      <div className="font-mega text-4xl text-volt drop-shadow">
                        {player.stats?.generalValue}
                      </div>
                      <div className="eyebrow text-white/80 mt-1">
                        {player.position}
                      </div>
                      <div className="mt-1.5 w-7 h-px bg-volt" />
                    </div>

                    <div className="absolute z-20 top-4 right-4 flex flex-col items-end gap-1.5">
                      <span
                        className={`panel-2 clip-tag px-2 py-0.5 text-[10px] font-stat font-700 uppercase ${tag}`}
                      >
                        {player.rarity}
                      </span>
                      {player.cantidad > 1 && (
                        <span className="bg-volt text-ink clip-tag px-2 py-0.5 text-[11px] font-stat font-700">
                          x{player.cantidad}
                        </span>
                      )}
                    </div>

                    <div className="relative h-56 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent z-10" />
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-full h-full object-contain object-bottom scale-95 group-hover:scale-100 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PLAYER_PLACEHOLDER;
                        }}
                      />
                    </div>

                    <div className="relative z-20 px-4 pb-4 -mt-4">
                      <h3 className="display-giant text-2xl text-white leading-none truncate group-hover:text-volt transition-colors">
                        {player.name}
                      </h3>
                      <p className="text-[11px] text-[#8a8a82] uppercase tracking-wider mt-1.5">
                        {player.team} · {player.nationality}
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                          { l: "ATA", v: player.stats?.attack },
                          { l: "DEF", v: player.stats?.defense },
                          { l: "VEL", v: player.stats?.speed },
                        ].map((s) => (
                          <div key={s.l}>
                            <div className="flex items-baseline justify-between mb-1">
                              <span className="eyebrow text-[#6b6b64]">
                                {s.l}
                              </span>
                              <span className="font-stat font-700 text-xs text-white tabular-nums">
                                {s.v}
                              </span>
                            </div>
                            <div className="h-1 bg-line overflow-hidden">
                              <motion.div
                                className="h-full bg-volt"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${s.v}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Players;
