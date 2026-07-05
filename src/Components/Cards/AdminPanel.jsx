import { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { playersApi, newsApi } from "../../api";
import { toImageUrl, PLAYER_PLACEHOLDER } from "../../api/normalize";

const EMPTY = {
  name: "",
  team: "",
  position: "",
  nationality: "",
  rarity: "common",
  image: "",
  stats: {
    rating: 75,
    vision: 50,
    dribble: 50,
    pass: 50,
    attack: 50,
    defense: 50,
    speed: 50,
  },
};

const EMPTY_NEWS = {
  id: null,
  title: "",
  description: "",
  category: "Novedad",
  image: "",
  displayMode: "card",
  isPublished: true,
  isFeatured: false,
  priority: 0,
};

const RARITIES = [
  {
    value: "common",
    label: "Común",
    chip: "bg-slate-500",
    ring: "ring-slate-500/50",
  },
  {
    value: "rare",
    label: "Raro",
    chip: "bg-cyan-500",
    ring: "ring-cyan-400/60",
  },
  {
    value: "epic",
    label: "Épico",
    chip: "bg-purple-500",
    ring: "ring-purple-400/60",
  },
  {
    value: "legendary",
    label: "Legendario",
    chip: "bg-yellow-500",
    ring: "ring-yellow-400/70",
  },
];

const POSITIONS = ["POR", "DEF", "LAT", "MED", "MCO", "EXT", "DEL"];

const STAT_FIELDS = [
  { name: "rating", label: "Valoración" },
  { name: "attack", label: "Ataque" },
  { name: "defense", label: "Defensa" },
  { name: "speed", label: "Velocidad" },
  { name: "pass", label: "Pase" },
  { name: "dribble", label: "Regate" },
  { name: "vision", label: "Visión" },
];

const DISPLAY_MODES = [
  { value: "hero-large", label: "Portada grande" },
  { value: "hero-small", label: "Portada chica" },
  { value: "card", label: "Card estándar" },
  { value: "compact", label: "Compacta" },
];

const overallOf = (s) =>
  Math.round(
    ((Number(s.attack) || 0) +
      (Number(s.defense) || 0) +
      (Number(s.speed) || 0) +
      (Number(s.pass) || 0) +
      (Number(s.rating) || 0)) /
      5,
  );

/* ---------- Carta de previsualización (estilo FUT) ---------- */
const PreviewCard = ({ form, previewUrl }) => {
  const rarity = RARITIES.find((r) => r.value === form.rarity) || RARITIES[0];
  const img =
    previewUrl || (form.image ? toImageUrl(form.image) : PLAYER_PLACEHOLDER);
  const ovr = overallOf(form.stats) || form.stats.rating;
  return (
    <div
      className={`relative w-full max-w-[260px] mx-auto rounded-2xl overflow-hidden ring-2 ${rarity.ring} bg-gradient-to-br from-[#0e1626] to-[#05070d] shine`}
    >
      <div className="absolute z-20 top-3 left-3 text-center leading-none">
        <div className="font-stat font-700 text-3xl text-gold drop-shadow">
          {ovr || "—"}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-volt">
          {form.position || "POS"}
        </div>
      </div>
      <div
        className={`absolute z-20 top-3 right-3 ${rarity.chip} text-[10px] font-700 uppercase px-2 py-0.5 rounded-full`}
      >
        {rarity.label}
      </div>
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-transparent z-10" />
        <img
          src={img}
          alt={form.name || "Jugador"}
          className="w-full h-full object-contain object-center scale-95"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLAYER_PLACEHOLDER;
          }}
        />
      </div>
      <div className="relative z-10 px-4 pb-4 -mt-3">
        <h3 className="font-display font-700 text-white text-lg truncate">
          {form.name || "Nombre del jugador"}
        </h3>
        <p className="text-[11px] text-slate-400 truncate">
          {form.team || "Equipo"} · {form.nationality || "País"}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { l: "ATA", v: form.stats.attack },
            { l: "DEF", v: form.stats.defense },
            { l: "VEL", v: form.stats.speed },
            { l: "PAS", v: form.stats.pass },
            { l: "REG", v: form.stats.dribble },
            { l: "VIS", v: form.stats.vision },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-stat font-700 text-sm text-white tabular-nums">
                {s.v}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [form, setForm] = useState(EMPTY);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [newsForm, setNewsForm] = useState(EMPTY_NEWS);
  const [newsList, setNewsList] = useState([]);
  const [newsSaving, setNewsSaving] = useState(false);
  const fileInput = useRef(null);

  const loadCatalog = async () => {
    try {
      setCatalog(await playersApi.all());
    } catch (err) {
      console.error("Error al cargar el plantel:", err.message);
    }
  };
  const loadNews = async () => {
    try {
      setNewsList(await newsApi.admin());
    } catch (err) {
      console.error("Error al cargar noticias:", err.message);
    }
  };

  useEffect(() => {
    loadCatalog();
    loadNews();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.stats) {
      setForm((f) => ({ ...f, stats: { ...f.stats, [name]: Number(value) } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleNewsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewsForm((f) => ({
      ...f,
      [name]:
        type === "checkbox"
          ? checked
          : name === "priority"
            ? Number(value)
            : value,
    }));
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const path = await playersApi.uploadImage(file);
      setForm((f) => ({ ...f, image: path }));
      toast.success("📸 Imagen subida");
    } catch (err) {
      console.error(err);
      toast.error("Error al subir la imagen");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setForm((f) => ({ ...f, image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.team || !form.position || !form.nationality) {
      toast.error("Completá los campos obligatorios");
      return;
    }
    setSaving(true);
    try {
      await playersApi.add(form);
      toast.success("⚽ Jugador agregado al sistema");
      setForm(EMPTY);
      setPreviewUrl(null);
      loadCatalog();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error al crear jugador");
    } finally {
      setSaving(false);
    }
  };

  const removePlayer = async (id) => {
    if (!confirm("¿Eliminar este jugador del sistema?")) return;
    try {
      await playersApi.remove(id);
      setCatalog((c) => c.filter((p) => p.id !== id));
      toast.success("Jugador eliminado");
    } catch (err) {
      toast.error(err.response?.data?.message || "No se pudo eliminar");
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.description) {
      toast.error("Completá título y descripción");
      return;
    }
    setNewsSaving(true);
    try {
      const payload = {
        title: newsForm.title,
        description: newsForm.description,
        category: newsForm.category,
        image: newsForm.image,
        displayMode: newsForm.displayMode,
        priority: Number(newsForm.priority || 0),
        isPublished: Boolean(newsForm.isPublished),
        isFeatured: Boolean(newsForm.isFeatured),
      };
      if (newsForm.id) {
        await newsApi.update(newsForm.id, payload);
        toast.success("📰 Noticia actualizada");
      } else {
        await newsApi.create(payload);
        toast.success("📰 Noticia creada");
      }
      setNewsForm(EMPTY_NEWS);
      loadNews();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "No se pudo guardar la noticia",
      );
    } finally {
      setNewsSaving(false);
    }
  };

  const editNews = (item) => {
    setNewsForm({ ...EMPTY_NEWS, ...item });
  };

  const removeNews = async (id) => {
    if (!confirm("¿Eliminar esta noticia?")) return;
    try {
      await newsApi.remove(id);
      setNewsList((items) => items.filter((item) => item.id !== id));
      toast.success("Noticia eliminada");
    } catch (err) {
      toast.error(err.response?.data?.message || "No se pudo eliminar");
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 bg-surface border border-line text-white placeholder-[#5a5a52] outline-none focus:border-volt/60 transition-colors clip-tag";

  return (
    <div className="relative min-h-screen bg-ink text-[#ededea] pt-28 pb-20 px-5 sm:px-8 overflow-hidden grain">
      <div className="absolute inset-0 bg-pitch-grid opacity-30" />
      <Toaster position="top-right" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10 pb-6 border-b border-line">
          <div>
            <p className="eyebrow text-gold mb-2">Backstage</p>
            <h1 className="display-giant text-5xl md:text-6xl text-white">
              Panel <span className="text-gold italic-skew">admin</span>
            </h1>
            <p className="text-sm text-[#8a8a82] mt-2">
              Agregá jugadores al sistema con su imagen y estadísticas.
            </p>
          </div>
          <span className="panel-2 clip-tag px-4 py-1.5 eyebrow text-gold">
            {catalog.length} jugadores
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-[1.4fr_1fr] gap-8"
        >
          {/* Columna formulario */}
          <div className="panel clip-card p-6 md:p-8 space-y-8">
            {/* Dropzone imagen */}
            <div>
              <h3 className="eyebrow text-volt pb-2 border-b border-line mb-4">
                Imagen del jugador
              </h3>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all p-6 grid place-items-center text-center min-h-[180px] ${
                  dragging
                    ? "border-volt bg-volt/10"
                    : "border-line hover:border-volt/50 bg-surface/50"
                }`}
              >
                {previewUrl || form.image ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={previewUrl || toImageUrl(form.image)}
                      alt="preview"
                      className="h-28 object-contain drop-shadow"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-volt">
                        {uploading ? "Subiendo..." : "✓ Imagen lista"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                        className="text-xs text-coral hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-4xl">🖼️</div>
                    <p className="text-sm text-white font-medium">
                      Arrastrá la imagen acá
                    </p>
                    <p className="text-xs text-[#8a8a82]">
                      o hacé clic para buscarla · PNG/JPG hasta 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Info básica */}
            <div>
              <h3 className="eyebrow text-volt pb-2 border-b border-line mb-4">
                Información básica
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="eyebrow text-[#8a8a82] block">
                    Nombre <span className="text-coral">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Lionel Messi"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="eyebrow text-[#8a8a82] block">
                    Equipo <span className="text-coral">*</span>
                  </label>
                  <input
                    name="team"
                    value={form.team}
                    onChange={handleChange}
                    placeholder="Inter Miami"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="eyebrow text-[#8a8a82] block">
                    Nacionalidad <span className="text-coral">*</span>
                  </label>
                  <input
                    name="nationality"
                    value={form.nationality}
                    onChange={handleChange}
                    placeholder="Argentina"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="eyebrow text-[#8a8a82] block">
                    Posición <span className="text-coral">*</span>
                  </label>
                  <select
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    <option value="">Seleccioná…</option>
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rareza */}
              <div className="mt-4 space-y-2">
                <label className="eyebrow text-[#8a8a82] block">Rareza</label>
                <div className="flex flex-wrap gap-2">
                  {RARITIES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, rarity: r.value }))
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-display font-600 transition-all ${
                        form.rarity === r.value
                          ? `${r.chip} text-black`
                          : "bg-surface border border-line text-[#8a8a82] hover:text-white"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-line mb-4">
                <h3 className="eyebrow text-volt">Estadísticas</h3>
                <span className="text-xs text-[#8a8a82]">
                  Overall:{" "}
                  <span className="font-stat font-700 text-gold">
                    {overallOf(form.stats)}
                  </span>
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {STAT_FIELDS.map(({ name, label }) => (
                  <div key={name} className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="eyebrow text-[#8a8a82]">{label}</label>
                      <span className="font-stat font-700 text-volt tabular-nums">
                        {form.stats[name]}
                      </span>
                    </div>
                    <input
                      type="range"
                      name={name}
                      min="0"
                      max="100"
                      value={form.stats[name]}
                      onChange={handleChange}
                      className="w-full h-1.5 bg-line appearance-none cursor-pointer accent-[#d4ff00]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => {
                  setForm(EMPTY);
                  setPreviewUrl(null);
                }}
                className="px-5 py-2.5 text-sm font-display font-600 uppercase tracking-wider text-[#8a8a82] hover:text-white transition-colors"
              >
                Limpiar
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-7 py-2.5 bg-volt text-ink font-display font-700 uppercase tracking-wider text-sm clip-btn hover:bg-white disabled:opacity-50 transition-colors"
              >
                {saving ? "Guardando…" : "Guardar jugador"}
              </button>
            </div>
          </div>

          {/* Columna preview en vivo */}
          <div className="lg:sticky lg:top-28 self-start">
            <p className="eyebrow text-[#6b6b64] mb-3 text-center">
              Vista previa
            </p>
            <PreviewCard form={form} previewUrl={previewUrl} />
          </div>
        </form>

        {/* Gestión de noticias */}
        <div className="mt-16 border-t border-line pt-10">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
            <div>
              <h2 className="display-giant text-3xl text-white">
                Gestión de noticias
              </h2>
              <p className="text-sm text-[#8a8a82] mt-2">
                Elegí qué noticia sale grande, cuál aparece chica y qué estado
                tiene.
              </p>
            </div>
            <span className="panel-2 clip-tag px-4 py-1.5 eyebrow text-gold">
              {newsList.length} artículos
            </span>
          </div>

          <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
            <form
              onSubmit={handleNewsSubmit}
              className="panel clip-card p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="eyebrow text-[#8a8a82] block">Título</label>
                <input
                  name="title"
                  value={newsForm.title}
                  onChange={handleNewsChange}
                  placeholder="Titular principal"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="eyebrow text-[#8a8a82] block">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={newsForm.description}
                  onChange={handleNewsChange}
                  rows="4"
                  placeholder="Texto corto para la portada"
                  className={`${inputCls} resize-y`}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="eyebrow text-[#8a8a82] block">
                    Categoría
                  </label>
                  <input
                    name="category"
                    value={newsForm.category}
                    onChange={handleNewsChange}
                    placeholder="Novedad"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="eyebrow text-[#8a8a82] block">Imagen</label>
                  <input
                    name="image"
                    value={newsForm.image}
                    onChange={handleNewsChange}
                    placeholder="URL de imagen"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="eyebrow text-[#8a8a82] block">
                    Modo de visualización
                  </label>
                  <select
                    name="displayMode"
                    value={newsForm.displayMode}
                    onChange={handleNewsChange}
                    className={inputCls}
                  >
                    {DISPLAY_MODES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="eyebrow text-[#8a8a82] block">
                    Prioridad
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={newsForm.priority}
                    onChange={handleNewsChange}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-[#8a8a82]">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={Boolean(newsForm.isFeatured)}
                    onChange={handleNewsChange}
                    className="accent-[#d4ff00]"
                  />
                  Destacada
                </label>
                <label className="flex items-center gap-2 text-sm text-[#8a8a82]">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={Boolean(newsForm.isPublished)}
                    onChange={handleNewsChange}
                    className="accent-[#d4ff00]"
                  />
                  Publicada
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setNewsForm(EMPTY_NEWS)}
                  className="px-4 py-2 text-sm text-[#8a8a82] hover:text-white transition-colors"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={newsSaving}
                  className="px-5 py-2.5 bg-volt text-ink font-display font-700 uppercase tracking-wider text-sm clip-btn hover:bg-white disabled:opacity-50 transition-colors"
                >
                  {newsSaving
                    ? "Guardando…"
                    : newsForm.id
                      ? "Actualizar noticia"
                      : "Crear noticia"}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {newsList.length === 0 ? (
                <div className="panel clip-card p-6 text-[#8a8a82]">
                  Todavía no hay noticias. Creá la primera desde acá.
                </div>
              ) : (
                newsList.map((item) => (
                  <div
                    key={item.id}
                    className="panel clip-card p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display font-700 text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-[#8a8a82] mt-1">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => editNews(item)}
                          className="text-sm text-volt hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeNews(item.id)}
                          className="text-sm text-coral hover:underline"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-[#8a8a82]">
                      <span className="rounded-full border border-line px-2 py-1">
                        {item.category}
                      </span>
                      <span className="rounded-full border border-line px-2 py-1">
                        {DISPLAY_MODES.find(
                          (mode) => mode.value === item.displayMode,
                        )?.label || item.displayMode}
                      </span>
                      {item.isFeatured && (
                        <span className="rounded-full border border-volt/30 bg-volt/10 px-2 py-1 text-volt">
                          Destacada
                        </span>
                      )}
                      {!item.isPublished && (
                        <span className="rounded-full border border-coral/30 bg-coral/10 px-2 py-1 text-coral">
                          Borrador
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Catálogo de jugadores */}
        <div className="mt-16 border-t border-line pt-10">
          <h2 className="display-giant text-3xl text-white mb-6">
            Plantel del sistema
          </h2>
          {catalog.length === 0 ? (
            <p className="text-[#8a8a82]">
              Todavía no hay jugadores. Agregá el primero arriba.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {catalog.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative panel clip-card overflow-hidden"
                  >
                    <button
                      onClick={() => removePlayer(p.id)}
                      className="absolute z-30 top-2 right-2 w-7 h-7 grid place-items-center rounded-full bg-coral/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                    <div className="absolute z-20 top-2 left-2 font-mega text-2xl text-volt drop-shadow">
                      {p.stats?.generalValue}
                    </div>
                    <div className="relative h-36 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent z-10" />
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-contain object-bottom"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PLAYER_PLACEHOLDER;
                        }}
                      />
                    </div>
                    <div className="relative z-20 px-3 pb-3 -mt-3">
                      <h3 className="font-display font-600 text-white truncate">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-[#8a8a82] truncate">
                        {p.team} · {p.position}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
