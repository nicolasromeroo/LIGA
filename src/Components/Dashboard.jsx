import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import LiveTicker from "../Components/LiveTicker.jsx";
import { AuthContext } from "../Contexts/AuthContext.jsx";
import { newsApi, playersApi, sportdbApi } from "../api";

/* ===================== Datos estáticos (secciones fijas de la landing) ===================== */
const PILLARS = [
  {
    n: "01",
    to: "/live",
    kicker: "Tiempo real",
    title: "EN VIVO",
    desc: "Seguí cada partido minuto a minuto con resultados y eventos en directo.",
    img: "/img/dashboard/vivo.png",
    accent: "coral",
  },
  {
    n: "02",
    to: "/sobres",
    kicker: "Ultimate Team",
    title: "SOBRES",
    desc: "Abrí sobres, conseguí cartas legendarias y construí tu colección definitiva.",
    img: "/img/dashboard/cartas-liga.png",
    accent: "gold",
  },
  {
    n: "03",
    to: "/pvp",
    kicker: "Competitivo",
    title: "5 VS 5",
    desc: "Armá tu equipo y enfrentá a otros jugadores online por la cima del ranking.",
    img: "/img/dashboard/5vs5.png",
    accent: "volt",
  },
];

/* ===================== Helpers ===================== */
const Marquee = ({ items, reverse }) => {
  const row = [...items, ...items];
  return (
    <div className="flex overflow-hidden select-none">
      <div
        className="flex shrink-0 items-center"
        style={{
          animation: `${reverse ? "marquee-rev" : "marquee"} 22s linear infinite`,
        }}
      >
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-6 pr-6">
            <span className="display-giant text-2xl md:text-3xl text-ink italic-skew">
              {t}
            </span>
            <span className="w-2 h-2 rotate-45 bg-ink" />
          </span>
        ))}
      </div>
    </div>
  );
};

const accentMap = {
  volt: {
    text: "text-volt",
    bg: "bg-volt",
    border: "group-hover:border-volt/60",
    shadow: "group-hover:shadow-[0_0_50px_-12px_rgba(212,255,0,.5)]",
  },
  coral: {
    text: "text-coral",
    bg: "bg-coral",
    border: "group-hover:border-coral/60",
    shadow: "group-hover:shadow-[0_0_50px_-12px_rgba(255,46,99,.5)]",
  },
  gold: {
    text: "text-gold",
    bg: "bg-gold",
    border: "group-hover:border-gold/60",
    shadow: "group-hover:shadow-[0_0_50px_-12px_rgba(255,210,74,.5)]",
  },
};

/* ===================== Dashboard ===================== */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [featured, setFeatured] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [latestNews, setLatestNews] = useState([]);

  // Trae datos reales para las secciones que antes eran mock (jugadores
  // destacados, próximos partidos, últimas noticias). Cada fetch es
  // independiente: si una falla, las demás secciones igual muestran datos.
  useEffect(() => {
    let alive = true;

    playersApi
      .all()
      .then((players) => {
        if (!alive) return;
        setFeatured(
          [...players].sort((a, b) => (b.power ?? 0) - (a.power ?? 0)).slice(0, 8),
        );
      })
      .catch((err) => console.error("No se pudieron cargar los jugadores destacados:", err.message));

    sportdbApi
      .matches()
      .then((matches) => {
        if (!alive) return;
        setUpcoming(
          matches
            .filter((m) => m.status === "scheduled")
            .sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0))
            .slice(0, 3),
        );
      })
      .catch((err) => console.error("No se pudieron cargar los próximos partidos:", err.message));

    newsApi
      .all()
      .then((items) => {
        if (!alive) return;
        setLatestNews(items.slice(0, 3));
      })
      .catch((err) => console.error("No se pudieron cargar las noticias:", err.message));

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="bg-ink text-[#ededea] overflow-x-hidden">
      <div className="pt-16">
        <LiveTicker />
      </div>

      {/* ============== HERO ============== */}
      <section className="relative min-h-[92vh] grain overflow-hidden">
        {/* GIF del Mundial a pantalla completa (fondo de toda la sección,
            promo temporal — quitar esta capa al terminar el torneo) */}
        <div className="absolute inset-0">
          <img
            src="/img/dashboard/mundial-promo.gif"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-45"
          />
          {/* Degradados: oscuro a la izquierda (texto) y abajo, gif más visible a la derecha */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />
        </div>

        {/* Fondos */}
        <div className="absolute inset-0 bg-pitch-grid opacity-50" />
        <div className="absolute -right-40 top-1/4 w-[42rem] h-[42rem] rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute left-0 bottom-0 w-[28rem] h-[28rem] rounded-full bg-coral/10 blur-[120px]" />

        {/* Palabra fantasma gigante */}
        <div className="pointer-events-none absolute -bottom-6 md:-bottom-10 left-0 right-0 leading-none">
          <span className="display-giant block text-[26vw] outline-text opacity-[0.07]">
            LIGA
          </span>
        </div>

        {/* Slash volt diagonal */}
        <div className="absolute right-0 top-0 h-full w-1/2 bg-stripes opacity-60 [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-20 md:pt-24 grid lg:grid-cols-12 gap-8 items-center min-h-[92vh]">
          {/* Texto */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <span className="bg-volt text-ink eyebrow px-3 py-1.5 clip-tag">
                Temporada 2026
              </span>
              <span className="eyebrow text-volt/70">Ultimate Liga</span>
            </motion.div>

            <h1 className="display-giant text-[clamp(3.4rem,11vw,9rem)] text-white">
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="block"
              >
                Dominá
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="block"
              >
                <span className="text-volt italic-skew">el juego</span>
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-6 max-w-md text-base md:text-lg text-[#a3a39c] leading-relaxed"
            >
              Resultados en vivo, sobres estilo Ultimate Team y partidas 5vs5
              online. Todo el fútbol, en un solo lugar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <Link
                to="/pvp"
                className="group relative bg-volt text-ink font-mega uppercase tracking-wide text-lg px-9 py-4 clip-btn hover:bg-white transition-colors"
              >
                Jugar 5vs5
              </Link>
              <Link
                to="/live"
                className="group flex items-center gap-2.5 hairline px-8 py-4 clip-btn text-white font-display font-600 uppercase tracking-widest text-sm hover:border-volt/60 hover:text-volt transition-colors"
              >
                <span className="live-dot" /> Ver en vivo
              </Link>
            </motion.div>

            {/* Stats inline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex gap-10"
            >
              {[
                { n: "24", l: "Equipos" },
                { n: "150+", l: "Jugadores" },
                { n: "1M+", l: "En premios" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-mega text-4xl md:text-5xl text-white leading-none">
                    {s.n}
                  </div>
                  <div className="eyebrow text-[#6b6b64] mt-1">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Jugador (Messi campeón) sobre el fondo del Mundial */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative h-[360px] lg:h-[640px] hidden sm:block"
          >
            <div className="absolute inset-0 grid place-items-center">
              <div className="font-mega text-[9rem] lg:text-[15rem] text-white/20 uppercase tracking-[0.1rem] leading-none select-none opacity-90 drop-shadow-[0_0_80px_rgba(255,255,255,0.15)]">
                GOAT
              </div>
            </div>
            <img
              src="/img/dashboard/messi-campeon.png"
              alt="Jugador destacado"
              className="relative z-10 w-full h-full object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,.7)]"
            />
            {/* Tag flotante → promo Mundial (antes: 99 Overall) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute z-20 top-10 right-2 lg:right-6"
            >
              <Link
                to="/mundial"
                className="group block panel clip-notch px-4 py-3 backdrop-blur hover:border-gold/60 hover:shadow-[0_0_30px_-6px_rgba(255,210,74,.6)] transition-all duration-300"
              >
                <div className="flex items-center gap-1.5">
                  <span className="live-dot" />
                  <span className="eyebrow text-white">En juego</span>
                </div>
                <div className="font-mega text-2xl text-gold leading-none mt-1.5">
                  🏆 Mundial
                </div>
                <div className="eyebrow text-[#8a8a82] mt-1 group-hover:text-gold transition-colors">
                  Seguilo en vivo →
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-[#6b6b64]">
          <span className="eyebrow">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="w-px h-8 bg-gradient-to-b from-volt to-transparent"
          />
        </div>
      </section>

      {/* ============== BANDA CINÉTICA ============== */}
      <div className="bg-volt py-3 -rotate-1 scale-105 my-2 shadow-[0_0_40px_rgba(212,255,0,.3)]">
        <Marquee
          items={[
            "Ultimate Team",
            "5 vs 5 Online",
            "Sobres",
            "En Vivo",
            "Ranking Global",
            "Tu Equipo",
          ]}
        />
      </div>

      {/* ============== PILARES ============== */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="eyebrow text-volt mb-3">Lo que te espera</p>
            <h2 className="display-giant text-5xl md:text-7xl text-white">
              Tres formas
              <br />
              <span className="outline-volt">de jugar</span>
            </h2>
          </div>
          <p className="max-w-xs text-[#8a8a82] text-sm">
            Una plataforma, todas las experiencias del fútbol competitivo
            moderno.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PILLARS.map((p, i) => {
            const a = accentMap[p.accent];
            return (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  to={p.to}
                  className={`group relative block panel clip-card overflow-hidden h-[440px] transition-all duration-500 ${a.border} ${a.shadow}`}
                >
                  {/* Imagen */}
                  <div className="absolute inset-0">
                    <img
                      src={p.img}
                      alt={p.title}
                      className="w-full h-full object-cover object-top opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
                  </div>
                  {/* Contenido */}
                  <div className="relative z-10 h-full flex flex-col p-7">
                    <div className="flex items-start justify-between">
                      <span className="index-num">{p.n}</span>
                      <span className={`eyebrow ${a.text}`}>{p.kicker}</span>
                    </div>
                    <div className="mt-auto">
                      <h3 className="display-giant text-5xl text-white transition-colors">
                        {p.title}
                      </h3>
                      <p className="mt-3 text-sm text-[#a3a39c] leading-relaxed">
                        {p.desc}
                      </p>
                      <div
                        className={`mt-5 inline-flex items-center gap-2 font-display font-600 uppercase tracking-widest text-xs ${a.text}`}
                      >
                        Entrar
                        <span className="group-hover:translate-x-1.5 transition-transform">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`absolute bottom-0 left-0 h-1 w-0 ${a.bg} group-hover:w-full transition-all duration-500`}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============== JUGADORES DESTACADOS ============== */}
      {featured.length > 0 && (
        <section className="relative py-20 border-y border-line bg-ink-2">
          <div className="absolute inset-0 bg-stripes opacity-30" />
          <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <p className="eyebrow text-volt mb-3">El plantel</p>
                <h2 className="display-giant text-5xl md:text-7xl text-white">
                  Jugadores
                  <br />
                  <span className="text-volt italic-skew">destacados</span>
                </h2>
              </div>
              <Link
                to="/players"
                className="hairline clip-btn px-6 py-3 text-sm font-display font-600 uppercase tracking-widest text-white hover:border-volt/60 hover:text-volt transition-colors"
              >
                Ver todos
              </Link>
            </div>

            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={1.15}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              loop={featured.length > 4}
              grabCursor
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true, el: ".fp-pag" }}
              className="!pb-2"
            >
              {featured.map((pl) => (
                <SwiperSlide key={pl.id}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="group relative panel clip-card overflow-hidden h-[460px]"
                  >
                    {/* Glow rareza */}
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-volt/10 to-transparent" />
                    {/* OVR + pos */}
                    <div className="absolute z-20 top-5 left-5 leading-none">
                      <div className="font-mega text-5xl text-volt drop-shadow">
                        {pl.power}
                      </div>
                      <div className="eyebrow text-white/80 mt-1">
                        {pl.position}
                      </div>
                      <div className="mt-2 w-8 h-px bg-volt" />
                    </div>
                    {/* Imagen */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent z-10" />
                      <img
                        src={pl.image}
                        alt={pl.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    {/* Info */}
                    <div className="absolute z-20 bottom-0 inset-x-0 p-5">
                      <h3 className="display-giant text-3xl text-white leading-none">
                        {pl.name}
                      </h3>
                      <p className="text-xs text-[#8a8a82] mt-1.5 uppercase tracking-wider">
                        {pl.team || pl.club} · {pl.nationality}
                      </p>
                      <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-2 opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500">
                        {[
                          ["RIT", pl.stats.speed],
                          ["TIR", pl.stats.attack],
                          ["PAS", pl.stats.pass],
                          ["REG", pl.stats.dribble],
                          ["DEF", pl.stats.defense],
                          ["VIS", pl.stats.vision],
                        ].map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-center justify-between border-b border-line pb-1"
                          >
                            <span className="eyebrow text-[#6b6b64]">{k}</span>
                            <span className="font-stat font-700 text-volt tabular-nums">
                              {v ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="fp-pag flex justify-center gap-2 mt-8" />
          </div>
        </section>
      )}

      {/* ============== SOBRES / PUNTOS ============== */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* CTA grande sobres */}
          <div className="relative panel clip-card overflow-hidden p-9 grain">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gold/15 blur-3xl" />
            <p className="eyebrow text-gold mb-3">Ultimate Team</p>
            <h2 className="display-giant text-5xl md:text-6xl text-white">
              Abrí tu
              <br />
              <span className="text-gradient-gold">próximo sobre</span>
            </h2>
            <p className="mt-4 max-w-sm text-[#a3a39c] text-sm">
              Canjeá tus puntos por sobres y desbloqueá cartas comunes, épicas y
              legendarias.
            </p>
            <Link
              to="/sobres"
              className="mt-7 inline-block bg-gold text-ink font-mega uppercase tracking-wide px-8 py-3.5 clip-btn hover:bg-white transition-colors"
            >
              Abrir sobres
            </Link>
          </div>

          {/* Saldo + paquetes */}
          <div className="grid gap-4">
            {user ? (
              <div className="panel clip-notch p-6 flex items-center justify-between">
                <div>
                  <p className="eyebrow text-[#6b6b64]">Tus puntos</p>
                  <div className="font-mega text-5xl text-gold leading-none mt-1">
                    {(user.pts ?? user.points ?? 0).toLocaleString("es-AR")}
                  </div>
                </div>
                <span className="text-5xl">⚡</span>
              </div>
            ) : (
              <Link
                to="/register"
                className="panel clip-notch p-6 flex items-center justify-between hover:border-gold/50 transition-colors"
              >
                <div>
                  <p className="eyebrow text-[#6b6b64]">¿Todavía no jugás?</p>
                  <div className="font-display text-lg font-700 text-white mt-1">
                    Creá tu cuenta y sumá puntos
                  </div>
                </div>
                <span className="text-5xl">⚡</span>
              </Link>
            )}
            {[
              {
                t: "Sobre Oro",
                c: "100",
                d: "Mayor chance de cartas épicas",
              },
              {
                t: "Sobre Élite",
                c: "500",
                d: "Posibilidad de legendarias",
              },
            ].map((p) => (
              <Link
                key={p.t}
                to="/sobres"
                className="group panel clip-tag p-5 flex items-center justify-between hover:border-gold/50 transition-colors"
              >
                <div>
                  <h3 className="font-display font-600 text-lg text-white">
                    {p.t}
                  </h3>
                  <p className="text-xs text-[#8a8a82]">{p.d}</p>
                </div>
                <div className="text-right">
                  <div className="font-stat font-700 text-gold">{p.c}</div>
                  <div className="eyebrow text-[#6b6b64]">pts</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============== NOTICIAS + PARTIDOS ============== */}
      <section className="relative border-t border-line bg-ink-2 py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-3 gap-6">
          {/* Noticias */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-7">
              <h2 className="display-giant text-3xl md:text-4xl text-white">
                Últimas <span className="text-volt">noticias</span>
              </h2>
              <Link
                to="/news"
                className="eyebrow text-volt hover:text-white transition-colors"
              >
                Ver todas →
              </Link>
            </div>
            {latestNews.length > 0 ? (
              <div className="space-y-px panel clip-card overflow-hidden">
                {latestNews.map((n, i) => (
                  <Link
                    to="/news"
                    key={n.id ?? i}
                    className="group flex items-center gap-5 p-5 bg-surface hover:bg-surface-2 transition-colors"
                  >
                    <span className="index-num shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="eyebrow text-volt">{n.category || "Novedad"}</span>
                      </div>
                      <h3 className="font-display font-600 text-lg text-white group-hover:text-volt transition-colors truncate">
                        {n.title}
                      </h3>
                      <p className="text-sm text-[#8a8a82] truncate">{n.description}</p>
                    </div>
                    <span className="text-[#6b6b64] group-hover:text-volt group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="panel clip-card p-8 text-center text-sm text-[#6b6b64]">
                Todavía no hay noticias publicadas.
              </div>
            )}
          </div>

          {/* Próximos partidos */}
          <div>
            <div className="flex items-center justify-between mb-7">
              <h2 className="display-giant text-3xl md:text-4xl text-white">
                Próximos
              </h2>
              <Link
                to="/live"
                className="eyebrow text-volt hover:text-white transition-colors"
              >
                Agenda →
              </Link>
            </div>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((m) => (
                  <div
                    key={m.id}
                    className="panel clip-tag p-4 hover:border-volt/40 transition-colors"
                  >
                    <div className="eyebrow text-[#6b6b64] mb-2">{m.league}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-600 text-white truncate">
                        {m.home}
                      </span>
                      <span className="font-stat text-volt text-sm px-2 shrink-0">
                        {m.time || "-"}
                      </span>
                      <span className="font-display font-600 text-white truncate text-right">
                        {m.away}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel clip-tag p-6 text-center text-sm text-[#6b6b64]">
                Sin partidos programados por ahora.
              </div>
            )}
            <Link
              to="/pvp"
              className="mt-4 block text-center bg-coral text-white font-mega uppercase tracking-wide py-3.5 clip-btn hover:bg-white hover:text-ink transition-colors"
            >
              Desafío rápido
            </Link>
          </div>
        </div>
      </section>

      {/* ============== CTA FINAL ============== */}
      <section className="relative grain overflow-hidden">
        <div className="absolute inset-0 bg-volt" />
        <div className="absolute inset-0 bg-stripes opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-20 text-center">
          <h2 className="display-giant text-[clamp(2.8rem,9vw,7rem)] text-ink">
            ¿Listo para
            <br />
            <span className="italic-skew">competir?</span>
          </h2>
          <Link
            to="/register"
            className="mt-8 inline-block bg-ink text-volt font-mega uppercase tracking-wide text-xl px-12 py-5 clip-btn hover:bg-white hover:text-ink transition-colors"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
