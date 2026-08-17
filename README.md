# LIGA

Frontend de una plataforma de fútbol argentino estilo
[Promiedos](https://www.promiedos.com.ar/): resultados en vivo, tabla de
posiciones con un motor propio de promedios/descensos, historial de
campeones, noticias, un prode con torneos, cartas coleccionables con sobres
estilo Ultimate Team, y salas PvP 1v1 (5 cartas por lado) en tiempo real.
Consume la API de [LIGA-Server](../LIGA-Server).

## Stack

- **React 19** + **Vite 7**
- **Tailwind CSS v4** — sistema de diseño propio ("Pitch Brutalism": tipos
  Anton/Oswald/Inter/Rajdhani, paleta ink/volt/coral/gold, formas angulares
  con `clip-path`)
- **framer-motion** para animaciones y transiciones de página
- **react-router-dom** (rutas + guards)
- **socket.io-client** para las salas PvP en tiempo real
- **react-hot-toast**, **swiper**, **howler**

## Rutas

| Ruta | Página | Notas |
|---|---|---|
| `/` | Dashboard | destacados, próximos partidos y noticias reales |
| `/live` | Resultados en vivo | Liga Profesional Argentina, polling 30s |
| `/tabla` | Tabla de posiciones | posición actual + motor de promedios real |
| `/campeones` | Historial de campeones | por temporada |
| `/mundial` | Mundial 2026 | fixture, grupos, llave eliminatoria |
| `/news` | Noticias | |
| `/prode` | Prode | torneos privados/públicos, pronósticos |
| `/players` | Colección | cartas propias |
| `/myPlayers` | Mi equipo | formación 11 |
| `/sobres` | Sobres | apertura de packs |
| `/pvp` | Arena PvP | sala privada 1v1, 5 cartas por lado |
| `/panel` | Admin | detrás de `RequireAdmin`, solo `role: admin` |
| `/login`, `/register` | Auth | |

## Cómo correr esto

```bash
npm install
cp .env.example .env   # ajustá VITE_API_URL si el backend no corre en :3000
npm run dev
```

Necesita [LIGA-Server](../LIGA-Server) corriendo (con `CORS_ORIGINS`
incluyendo el origen de este dev server, típicamente
`http://localhost:5173`).

```bash
npm run build     # build de producción a dist/
npm run lint
npm run preview   # sirve el build de dist/ localmente
```

## Variables de entorno

Ver [`.env.example`](.env.example). La única variable usada es
`VITE_API_URL` (URL del backend; también se reutiliza para el socket de
PvP). Sin definirla, cae en `http://localhost:3000` — sirve para desarrollo
local, pero en cualquier build de producción hay que definirla
explícitamente antes de `npm run build` (Vite embebe las env vars en el
bundle en build-time, no en runtime).

## Notas de estado

- `/live` y `/tabla` dependen de que el backend tenga acceso real a
  api-football para la temporada configurada — con una key de plan free,
  ver la limitación documentada en el README de LIGA-Server (la temporada
  en curso no está disponible en ese plan). La UI maneja el estado vacío
  explícitamente (skeleton + mensaje), no rompe ni muestra datos falsos.
- El "PvP 1v1 5 cartas" no es un modo de 5 jugadores por bando — son 2
  usuarios, cada uno con un equipo de 5 cartas.
