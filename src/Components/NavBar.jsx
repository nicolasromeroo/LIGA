import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { AuthContext } from "../Contexts/AuthContext";

const LigaLogo = () => (
  <motion.div
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
    transition={{ type: "spring", stiffness: 400, damping: 22 }}
    className="flex items-center gap-2.5 select-none transition-[filter] duration-300 hover:drop-shadow-[0_0_14px_rgba(212,255,0,.4)]"
  >
    {/* Isotipo vectorial (badge autocontenido: fondo negro + emblema volt). */}
    <img
      //   src="/img/logo/liga-isotipo.svg"
      src="/img/logo/favicon-32.png"
      alt="LIGA"
      width="40"
      height="40"
      className="h-10 w-10 object-contain"
    />
    {/* Wordmark deportivo: Anton inclinado tipo camiseta + líneas de velocidad. */}
    <span className="hidden sm:flex items-center gap-1.5">
      <span className="font-mega text-[1.7rem] leading-none italic-skew tracking-[-0.02em] text-white drop-shadow-[0_0_10px_rgba(212,255,0,.25)]">
        LI<span className="text-gradient-volt">GA</span>
      </span>
      <span className="flex flex-col gap-[3px] -skew-x-12">
        <span className="block h-[3px] w-4 bg-volt" />
        <span className="block h-[3px] w-3.5 bg-volt/55" />
        <span className="block h-[3px] w-3 bg-volt/30" />
      </span>
    </span>
  </motion.div>
);

// Variantes de stagger para el menú móvil
const mobileContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};
const mobileItem = {
  hidden: { opacity: 0, x: -18 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  // Barra de progreso de scroll (suavizada con spring)
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  useEffect(() => {
    const controlNavbar = () => {
      const y = window.scrollY;
      setVisible(y < lastScrollY || y < 80);
      setScrolled(y > 20);
      setLastScrollY(y);
    };
    window.addEventListener("scroll", controlNavbar, { passive: true });
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Inicio", end: true },
    { to: "/live", label: "En Vivo", live: true },
    { to: "/mundial", label: "Mundial", hot: true },
    { to: "/players", label: "Colección" },
    { to: "/news", label: "Noticias" },
    ...(user
      ? [
          { to: "/myPlayers", label: "Mi Equipo" },
          { to: "/sobres", label: "Sobres" },
          { to: "/prode", label: "Prode" },
          { to: "/pvp", label: "5vs5", hot: true },
        ]
      : []),
  ];

  const linkClass = ({ isActive }) =>
    `group relative px-1 py-1 font-display font-600 uppercase tracking-wider text-[13px] transition-colors duration-200 ${
      isActive ? "text-white" : "text-[#8a8a82] hover:text-white"
    }`;

  // Subrayado activo: comparte layoutId para deslizarse entre enlaces, con glow volt
  const underline = (isActive) =>
    isActive && (
      <motion.span
        layoutId="nav-underline"
        className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-volt shadow-[0_0_12px_rgba(212,255,0,.85)]"
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    );

  return (
    <motion.nav
      initial={false}
      animate={{ y: visible ? 0 : "-110%" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong shadow-[0_10px_40px_-12px_rgba(0,0,0,.8)]"
          : "bg-gradient-to-b from-[#05070d] to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NavLink to="/" onClick={() => setOpen(false)}>
          <LigaLogo />
        </NavLink>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {({ isActive }) => (
                <span className="relative flex items-center gap-1.5">
                  {l.live && <span className="live-dot" />}
                  <span
                    className={
                      isActive
                        ? "drop-shadow-[0_0_10px_rgba(212,255,0,.45)]"
                        : ""
                    }
                  >
                    {l.label}
                  </span>
                  {l.hot && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-volt text-ink leading-none clip-tag shadow-[0_0_12px_-2px_rgba(212,255,0,.7)]">
                      hot
                    </span>
                  )}
                  {/* Subrayado que crece desde el centro al hacer hover (sólo inactivos) */}
                  {!isActive && (
                    <span className="pointer-events-none absolute -bottom-1.5 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-volt/70 transition-all duration-300 ease-out group-hover:w-full" />
                  )}
                  {underline(isActive)}
                </span>
              )}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink to="/panel" className={linkClass}>
              {({ isActive }) => (
                <span className="relative flex items-center text-gold drop-shadow-[0_0_8px_rgba(255,210,74,.4)]">
                  Admin
                  {!isActive && (
                    <span className="pointer-events-none absolute -bottom-1.5 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-gold/70 transition-all duration-300 ease-out group-hover:w-full" />
                  )}
                  {underline(isActive)}
                </span>
              )}
            </NavLink>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass shadow-[0_0_0_1px_rgba(212,255,0,.12)] hover:shadow-[0_0_22px_-4px_rgba(212,255,0,.55)] transition-shadow duration-300"
              >
                <motion.span
                  className="text-gold text-sm"
                  animate={{ opacity: [1, 0.55, 1] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ⚡
                </motion.span>
                <span className="font-stat font-700 text-gold tabular-nums">
                  {user.pts ?? 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  pts
                </span>
              </motion.div>
              <button
                onClick={handleLogout}
                className="hidden lg:block text-sm text-slate-400 hover:text-red-400 transition-colors duration-200"
              >
                Salir
              </button>
            </>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <NavLink
                to="/login"
                className="px-4 py-1.5 text-sm font-medium text-slate-200 hover:text-white transition-colors duration-200"
              >
                Ingresar
              </NavLink>
              <NavLink
                to="/register"
                className="group relative overflow-hidden shine px-5 py-2 font-display font-700 uppercase tracking-wider text-[13px] bg-volt text-ink clip-btn transition-all duration-300 hover:shadow-[0_0_24px_-4px_rgba(212,255,0,.7)] hover:-translate-y-0.5"
              >
                <span className="relative z-10">Registrarse</span>
              </NavLink>
            </div>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden grid place-items-center w-10 h-10 rounded-lg glass transition-colors duration-200 hover:border-volt/40 active:scale-95"
            aria-label="Menú"
            aria-expanded={open}
          >
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-5 rounded-full transition-all duration-300 ${open ? "translate-y-2 rotate-45 bg-volt" : "bg-white"}`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full transition-all duration-300 ${open ? "-translate-y-2 -rotate-45 bg-volt" : "bg-white"}`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Barra de progreso de scroll */}
      <motion.div
        style={{ scaleX: progress }}
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-volt via-volt to-cyan-400"
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden glass-strong border-t border-white/5"
          >
            <motion.div
              variants={mobileContainer}
              initial="hidden"
              animate="show"
              className="px-5 py-4 flex flex-col gap-1"
            >
              {links.map((l) => (
                <motion.div key={l.to} variants={mobileItem}>
                  <NavLink
                    to={l.to}
                    end={l.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white/5 text-white pl-4"
                          : "text-slate-300 hover:bg-white/5 hover:pl-4"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-volt shadow-[0_0_10px_rgba(212,255,0,.8)]" />
                        )}
                        {l.live && <span className="live-dot" />}
                        {l.label}
                        {l.hot && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-volt text-ink leading-none clip-tag">
                            hot
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
              {user?.role === "admin" && (
                <motion.div variants={mobileItem}>
                  <NavLink
                    to="/panel"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-gold font-medium hover:bg-white/5 transition-colors"
                  >
                    Admin · Añadir jugador
                  </NavLink>
                </motion.div>
              )}
              <motion.div
                variants={mobileItem}
                className="h-px bg-white/10 my-2"
              />
              {user ? (
                <motion.button
                  variants={mobileItem}
                  onClick={handleLogout}
                  className="text-left px-3 py-2.5 rounded-lg text-red-400 font-medium hover:bg-white/5 transition-colors"
                >
                  Cerrar sesión
                </motion.button>
              ) : (
                <motion.div variants={mobileItem} className="flex gap-2 mt-1">
                  <NavLink
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 rounded-lg glass text-white font-medium hover:border-volt/40 transition-colors"
                  >
                    Ingresar
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 clip-btn bg-volt text-ink font-display font-700 uppercase tracking-wider shine relative overflow-hidden"
                  >
                    <span className="relative z-10">Registrarse</span>
                  </NavLink>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
