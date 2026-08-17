import api from "./client";
import {
  normalizePlayer,
  normalizeCard,
  normalizeUser,
  normalizeFixture,
} from "./normalize";

// ---------------- Auth ----------------
export const authApi = {
  async login({ email, password }) {
    const { data } = await api.post("/auth/login", { email, password });
    return { token: data.access_token, user: normalizeUser(data.user) };
  },
  // El rol lo asigna el servidor (siempre USER): no se envía desde el cliente.
  async register({ name, email, password }) {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    return { token: data.access_token, user: normalizeUser(data.user) };
  },
  async me() {
    const { data } = await api.get("/auth/me");
    return normalizeUser(data);
  },
};

// ---------------- Players (catálogo) ----------------
export const playersApi = {
  async all() {
    const { data } = await api.get("/player/all");
    return (data || []).map(normalizePlayer);
  },
  // Alta de jugador (admin). Recibe el form del AdminPanel (stats anidadas).
  async add(form) {
    const s = form.stats || {};
    const rating = Number(s.rating) || 0;
    const overall =
      Math.round(
        ((Number(s.attack) || 0) +
          (Number(s.defense) || 0) +
          (Number(s.speed) || 0) +
          (Number(s.pass) || 0) +
          rating) /
          5,
      ) || rating;
    const payload = {
      name: form.name,
      team: form.team,
      club: form.club || form.team,
      position: form.position,
      nationality: form.nationality,
      rarity: form.rarity || "common",
      image: form.image,
      rating,
      overall,
      vision: Number(s.vision) || 0,
      dribble: Number(s.dribble) || 0,
      pass: Number(s.pass) || 0,
      attack: Number(s.attack) || 0,
      defense: Number(s.defense) || 0,
      speed: Number(s.speed) || 0,
    };
    const { data } = await api.post("/player/add-to-game", payload);
    return data;
  },
  // Sube la imagen y devuelve la ruta pública (ej: /players/x.png).
  async uploadImage(file) {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post("/player/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.path;
  },
  async remove(id) {
    const { data } = await api.delete(`/player/delete/${id}`);
    return data;
  },
};

// ---------------- Cards (colección del usuario) ----------------
export const cardsApi = {
  async mine() {
    const { data } = await api.get("/cards/my");
    return (data || []).map(normalizeCard);
  },
};

// ---------------- Packs (sobres) ----------------
export const packsApi = {
  async buy(type) {
    const { data } = await api.post("/packs/buy", { type });
    return {
      cards: (data.cards || []).map(normalizeCard),
      points: data.points,
    };
  },
};

// ---------------- Match (resultados) ----------------
export const matchApi = {
  async live() {
    const { data } = await api.get("/match/live");
    return data || [];
  },
  async upcoming() {
    const { data } = await api.get("/match/upcoming");
    return data || [];
  },
  async history() {
    const { data } = await api.get("/match/history");
    return data || [];
  },
};

// ---------------- SportDB (datos reales de la Liga Argentina vía api-football) ----------------
export const sportdbApi = {
  // Fixture completo de la temporada (pasados + hoy + próximos), normalizado.
  async matches() {
    const { data } = await api.get("/sportapi/fixtures");
    return (data || []).map(normalizeFixture);
  },
  // Solo los partidos en vivo ahora mismo.
  async live() {
    const { data } = await api.get("/sportapi/live");
    return (data || []).map(normalizeFixture);
  },
};

// ---------------- Standings (motor de promedios + campeones) ----------------
export const standingsApi = {
  // Tabla actual + promedio real de las últimas temporadas + zona de descenso.
  async promedios() {
    const { data } = await api.get("/standings/promedios");
    return data || [];
  },
  // Historial de campeones por temporada.
  async champions() {
    const { data } = await api.get("/standings/champions");
    return data || [];
  },
};

// ---------------- Mundial (datos reales vía API pública de FIFA) ----------------
export const mundialApi = {
  // Nombre y fechas del torneo.
  async info() {
    const { data } = await api.get("/mundial/info");
    return data || null;
  },
  // Fixture completo: en vivo (minuto/goles reales) + resultados + próximos.
  async matches() {
    const { data } = await api.get("/mundial/matches");
    return data || [];
  },
  // Tablas de posiciones de la fase de grupos.
  async standings() {
    const { data } = await api.get("/mundial/standings");
    return data || [];
  },
};

// ---------------- News ----------------
export const newsApi = {
  async all() {
    const { data } = await api.get("/news/all");
    return data || [];
  },
  async admin() {
    const { data } = await api.get("/news/admin");
    return data || [];
  },
  async create(payload) {
    const { data } = await api.post("/news", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.patch(`/news/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/news/${id}`);
    return data;
  },
};

// ---------------- Prode ----------------
export const prodeApi = {
  async matches() {
    const { data } = await api.get("/prode/matches");
    return data || [];
  },
  async my() {
    const { data } = await api.get("/prode/my");
    return data || [];
  },
  async predict({ matchId, scoreA, scoreB }) {
    const { data } = await api.post("/prode/predict", {
      matchId,
      scoreA,
      scoreB,
    });
    return data;
  },

  // ---- Torneos ----
  async torneos() {
    const { data } = await api.get("/prode/torneos");
    return data || { mine: [], descubrir: [] };
  },
  async createTorneo({ nombre, descripcion, isPublic }) {
    const { data } = await api.post("/prode/torneos", {
      nombre,
      descripcion,
      isPublic,
    });
    return data;
  },
  async joinByCode(codigo) {
    const { data } = await api.post("/prode/torneos/join", { codigo });
    return data;
  },
  async joinPublic(id) {
    const { data } = await api.post(`/prode/torneos/${id}/join`);
    return data;
  },
  async torneo(id) {
    const { data } = await api.get(`/prode/torneos/${id}`);
    return data;
  },
  async predictTorneo(id, { matchId, scoreA, scoreB }) {
    const { data } = await api.post(`/prode/torneos/${id}/predict`, {
      matchId,
      scoreA,
      scoreB,
    });
    return data;
  },
  async leaveTorneo(id) {
    const { data } = await api.post(`/prode/torneos/${id}/leave`);
    return data;
  },
  async deleteTorneo(id) {
    const { data } = await api.delete(`/prode/torneos/${id}`);
    return data;
  },
};
