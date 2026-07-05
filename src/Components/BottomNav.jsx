import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../Contexts/AuthContext";

/* ===================== Iconos (line, currentColor) ===================== */
const Icon = ({ d, fill }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-[22px] h-[22px]"
    fill={fill ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

const IconHome = () => (
  <Icon
    d={
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </>
    }
  />
);
const IconLive = () => (
  <Icon
    d={
      <>
        <circle cx="12" cy="12" r="2.4" />
        <path d="M7.5 7.5a6 6 0 0 0 0 9M16.5 7.5a6 6 0 0 1 0 9M4.8 4.8a9.5 9.5 0 0 0 0 14.4M19.2 4.8a9.5 9.5 0 0 1 0 14.4" />
      </>
    }
  />
);
const IconPlayers = () => (
  <Icon
    d={
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.4A5.5 5.5 0 0 1 20.5 19" />
      </>
    }
  />
);
const IconTeam = () => (
  <Icon
    d={
      <>
        <path d="M12 3 5 5.5V11c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V5.5L12 3Z" />
        <path d="m9 11.5 2 2 4-4" />
      </>
    }
  />
);
const IconSobres = () => (
  <Icon
    d={
      <>
        <rect x="4" y="4" width="11" height="15" rx="1.5" />
        <path d="M17.5 7 20 8v9.5l-5 2.5" />
        <path d="M7.5 8.5h4M7.5 12h4" />
      </>
    }
  />
);
const IconNews = () => (
  <Icon
    d={
      <>
        <rect x="3.5" y="5" width="14" height="14" rx="1.5" />
        <path d="M17.5 9H20a0 0 0 0 1 0 0v8a2 2 0 0 1-2 2" />
        <path d="M6.5 9h8M6.5 12.5h8M6.5 16h5" />
      </>
    }
  />
);
const IconLogin = () => (
  <Icon
    d={
      <>
        <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
        <path d="M10 8l4 4-4 4M14 12H4" />
      </>
    }
  />
);

/* ===================== BottomNav ===================== */
const BottomNav = () => {
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();

  // Ocultar en pantallas full-screen (auth)
  if (pathname === "/login" || pathname === "/register") return null;

  const tabs = user
    ? [
        { to: "/", label: "Inicio", end: true, Icon: IconHome },
        { to: "/live", label: "En Vivo", Icon: IconLive, live: true },
        { to: "/prode", label: "Prode", Icon: IconNews },
        { to: "/players", label: "Colección", Icon: IconPlayers },
        { to: "/myPlayers", label: "Equipo", Icon: IconTeam },
        { to: "/sobres", label: "Sobres", Icon: IconSobres },
      ]
    : [
        { to: "/", label: "Inicio", end: true, Icon: IconHome },
        { to: "/live", label: "En Vivo", Icon: IconLive, live: true },
        { to: "/players", label: "Colección", Icon: IconPlayers },
        { to: "/news", label: "Noticias", Icon: IconNews },
        { to: "/login", label: "Entrar", Icon: IconLogin },
      ];

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-volt/15 pb-safe shadow-[0_-12px_40px_-12px_rgba(0,0,0,.85)]"
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch justify-around h-16">
        {tabs.map(({ to, label, end, Icon: TabIcon, live }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="group relative flex-1 flex flex-col items-center justify-center gap-1 select-none"
          >
            {({ isActive }) => (
              <>
                {/* Indicador superior deslizante */}
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-active"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute top-0 h-[3px] w-9 rounded-full bg-volt shadow-[0_0_12px_rgba(212,255,0,.85)]"
                  />
                )}

                <motion.span
                  whileTap={{ scale: 0.82 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className={`relative grid place-items-center transition-colors duration-200 ${
                    isActive
                      ? "text-volt drop-shadow-[0_0_10px_rgba(212,255,0,.45)]"
                      : "text-[#7f7f78] group-hover:text-white"
                  }`}
                >
                  <TabIcon />
                  {live && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-coral ring-2 ring-[#0a0a0c]">
                      <span className="absolute inset-0 rounded-full bg-coral animate-ping" />
                    </span>
                  )}
                </motion.span>

                <span
                  className={`text-[10px] font-display font-600 uppercase tracking-wide leading-none transition-colors duration-200 ${
                    isActive
                      ? "text-volt"
                      : "text-[#7f7f78] group-hover:text-white"
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
