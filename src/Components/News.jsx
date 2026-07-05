import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { newsApi } from "../api";

/* Imágenes de respaldo (fútbol) cuando la nota no trae imagen. */
const FALLBACKS = [
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
];
const imgOf = (item, i = 0) => item?.image || FALLBACKS[i % FALLBACKS.length];

/* Acento por categoría. */
const CAT_HEX = {
  Novedad: "#d4ff00",
  Evento: "#ffd24a",
  Update: "#22d3ee",
  Mercado: "#ff2e63",
};
const catHex = (c) => CAT_HEX[c] || "#d4ff00";

/* Tiempo relativo tipo portal ("Hace 2 h"). */
const timeAgo = (date) => {
  if (!date) return "Hoy";
  const d = new Date(date);
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return "Ahora";
  const m = Math.floor(s / 60);
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `Hace ${days} d`;
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
};

/* Minutos de lectura estimados. */
const readMins = (item) => Math.max(1, Math.round((item?.description?.length || 120) / 180));

const CategoryTag = ({ category }) => {
  const hex = catHex(category);
  return (
    <span
      className="inline-flex items-center gap-1.5 eyebrow text-[10px] px-2.5 py-1 panel-2 clip-tag"
      style={{ color: hex }}
    >
      <span className="h-1.5 w-1.5" style={{ background: hex }} />
      {category || "General"}
    </span>
  );
};

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCat, setActiveCat] = useState("Todo");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await newsApi.all();
        setNews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("No se pudieron cargar las noticias.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const orderedNews = useMemo(
    () =>
      [...news].sort((a, b) => {
        const byFeatured = Number(b.isFeatured || false) - Number(a.isFeatured || false);
        if (byFeatured !== 0) return byFeatured;
        const byPriority = Number(b.priority || 0) - Number(a.priority || 0);
        if (byPriority !== 0) return byPriority;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }),
    [news],
  );

  const categories = useMemo(() => {
    const set = new Set(orderedNews.map((n) => n.category).filter(Boolean));
    return ["Todo", ...set];
  }, [orderedNews]);

  const filtered = useMemo(
    () => (activeCat === "Todo" ? orderedNews : orderedNews.filter((n) => n.category === activeCat)),
    [orderedNews, activeCat],
  );

  const hero = filtered[0];
  const feed = filtered.slice(1);
  const topRead = filtered.slice(0, 5); // "Lo más leído" incluye la nota de tapa
  const tickerItems = orderedNews.slice(0, 6);

  return (
    <div className="relative min-h-screen bg-ink text-[#ededea] pt-24 pb-24 overflow-hidden grain">
      <div className="absolute inset-0 bg-pitch-grid opacity-30" />
      <div className="absolute -top-32 right-1/4 w-[42rem] h-[42rem] rounded-full bg-volt/[.06] blur-[130px]" />

      {/* Ticker último momento */}
      {tickerItems.length > 0 && (
        <div className="relative z-10 border-y border-line bg-ink-2/80 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center">
            <div className="flex items-center gap-2 shrink-0 bg-live px-4 py-2.5 clip-tag">
              <span className="live-dot" />
              <span className="eyebrow text-[10px] text-white">Último momento</span>
            </div>
            <div className="relative flex-1 overflow-hidden">
              <div className="flex whitespace-nowrap anim-marquee">
                {[...tickerItems, ...tickerItems].map((it, i) => (
                  <span key={i} className="inline-flex items-center gap-3 px-6 py-2.5 text-sm text-[#c9c9c2]">
                    <span className="h-1 w-1 rounded-full bg-volt" />
                    {it.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 mt-8">
        {/* Header */}
        <header className="mb-8 border-b border-line pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px w-10 bg-volt/60" />
                <p className="eyebrow text-volt">Fútbol y actualidad</p>
              </div>
              <h1 className="display-giant text-[clamp(2.75rem,8vw,5.5rem)] text-white">
                Liga <span className="text-gradient-volt italic-skew">News</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="eyebrow text-[#6b6b64] text-[10px]">
                {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <p className="font-stat font-700 text-lg text-white tabular-nums">
                Edición diaria
              </p>
            </div>
          </div>

          {/* Filtros de categoría */}
          {categories.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = activeCat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={`eyebrow text-[10px] px-3.5 py-2 clip-tag transition-colors ${
                      active ? "bg-volt text-ink" : "panel-2 text-[#8a8a82] hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* Estado de carga */}
        {loading && (
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="skeleton h-[460px] clip-card" />
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24 clip-card" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="panel clip-card p-8 text-center">
            <p className="font-stat font-700 text-live">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="panel clip-card p-12 text-center">
            <p className="eyebrow text-[#6b6b64] mb-2">Sin resultados</p>
            <p className="text-[#a3a39c]">No hay noticias en esta categoría por ahora.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            {/* Portada + Lo más leído */}
            <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
              {/* Portada principal */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="group relative panel border-line clip-card overflow-hidden cursor-pointer"
                style={{ boxShadow: "0 30px 80px -40px rgba(212,255,0,.25)" }}
              >
                <div className="absolute inset-x-0 top-0 h-[3px] z-30 bg-volt" />
                <div className="relative h-[420px] md:h-[480px] overflow-hidden">
                  <img
                    src={imgOf(hero)}
                    alt={hero?.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACKS[0]; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
                  <div className="absolute inset-0 bg-stripes opacity-20 mix-blend-overlay" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <CategoryTag category={hero?.category} />
                    <span className="eyebrow text-[10px] text-[#a3a39c]">{timeAgo(hero?.createdAt)}</span>
                  </div>
                  <h2 className="display-giant text-[clamp(1.9rem,4vw,3.5rem)] text-white max-w-3xl leading-[0.92]">
                    {hero?.title || "Sin título"}
                  </h2>
                  <p className="mt-4 max-w-2xl text-[#c9c9c2] leading-relaxed line-clamp-2">
                    {hero?.description}
                  </p>
                  <div className="mt-5 flex items-center gap-4 text-[#7d7d76]">
                    <span className="eyebrow text-[10px]">Redacción Liga</span>
                    <span className="h-1 w-1 rounded-full bg-line" />
                    <span className="eyebrow text-[10px]">{readMins(hero)} min de lectura</span>
                  </div>
                </div>
              </motion.article>

              {/* Lo más leído */}
              <div className="panel border-line clip-card p-6">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-line">
                  <span className="live-dot" />
                  <h3 className="eyebrow text-volt">Lo más leído</h3>
                </div>
                <ol className="space-y-4">
                  {topRead.map((item, i) => (
                    <li key={item.id || i}>
                      <motion.a
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="group flex gap-4 cursor-pointer"
                      >
                        <span className="font-mega text-2xl leading-none text-transparent w-8 shrink-0"
                          style={{ WebkitTextStroke: `1.5px ${i === 0 ? "#d4ff00" : "#26262c"}` }}>
                          {i + 1}
                        </span>
                        <div className={`flex-1 pb-4 ${i === topRead.length - 1 ? "" : "border-b border-line"}`}>
                          <h4 className="font-display font-700 text-[15px] leading-snug text-white group-hover:text-volt transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="eyebrow text-[9px]" style={{ color: catHex(item.category) }}>
                              {item.category || "General"}
                            </span>
                            <span className="h-0.5 w-0.5 rounded-full bg-line" />
                            <span className="eyebrow text-[9px] text-[#6b6b64]">{timeAgo(item.createdAt)}</span>
                          </div>
                        </div>
                      </motion.a>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* Feed de notas */}
            {feed.length > 0 && (
              <section className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="display-giant text-2xl text-white">Más noticias</h3>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {feed.map((item, index) => (
                    <motion.article
                      key={item.id || item.title || index}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ delay: (index % 3) * 0.06, duration: 0.45 }}
                      whileHover={{ y: -8 }}
                      className="group panel border-line clip-card overflow-hidden cursor-pointer"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={imgOf(item, index + 1)}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACKS[(index + 1) % FALLBACKS.length]; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <CategoryTag category={item.category} />
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-700 text-lg leading-tight text-white transition-colors group-hover:text-volt line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[#a3a39c] line-clamp-3">
                          {item.description}
                        </p>
                        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                          <span className="eyebrow text-[9px] text-[#6b6b64]">{timeAgo(item.createdAt)}</span>
                          <span className="eyebrow text-[9px] text-[#6b6b64]">{readMins(item)} min</span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default News;
