import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Explorar",
    links: [
      { label: "Inicio", to: "/" },
      { label: "Prode", to: "/prode" },
      { label: "Noticias", to: "/news" },
      { label: "En vivo", to: "/live" },
    ],
  },
  {
    title: "Club",
    links: [
      { label: "Colección", to: "/players" },
      { label: "Mi equipo", to: "/myPlayers" },
      { label: "Sobres", to: "/sobres" },
      { label: "Panel", to: "/panel" },
    ],
  },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "X", href: "https://x.com" },
  { label: "TikTok", href: "https://tiktok.com" },
];

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mt-8 border-t border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(212,255,0,0.14),_transparent_35%),linear-gradient(180deg,_#05070d_0%,_#0b1018_100%)] px-4 pb-24 pt-10 text-[#dfe3ea] sm:px-6 lg:px-8 lg:pb-10"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-volt/25 bg-volt/10 px-3 py-1.5 text-sm text-[#d4ff00]">
              <span className="h-2.5 w-2.5 rounded-full bg-volt shadow-[0_0_10px_rgba(212,255,0,0.8)]" />
              LIGA · Futbol digital
            </div>
            <div>
              <h3 className="text-3xl font-700 uppercase tracking-[0.22em] text-white sm:text-4xl">
                Tu experiencia <span className="text-volt">de fútbol</span>, en
                un solo lugar.
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#9aa0a9] sm:text-base">
                Prode, colección, equipo y noticias en una plataforma diseñada
                para sentirse más seria, viva y profesional que una simple app
                de fantasy.
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-700 uppercase tracking-[0.28em] text-[#7c838d]">
              Navegación
            </h4>
            <div className="space-y-2">
              {footerSections.flatMap((section) =>
                section.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block text-sm text-[#dfe3ea] transition hover:text-volt"
                  >
                    {link.label}
                  </Link>
                )),
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-700 uppercase tracking-[0.28em] text-[#7c838d]">
              Seguinos
            </h4>
            <div className="space-y-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm text-[#dfe3ea] transition hover:text-volt"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-600 text-white">Contacto</p>
              <p className="mt-1 text-sm text-[#9aa0a9]">soporte@liga.app</p>
              <p className="text-sm text-[#9aa0a9]">Buenos Aires · Argentina</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-[#7c838d] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LIGA. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-3">
            <span className="transition hover:text-volt">Términos</span>
            <span className="transition hover:text-volt">Privacidad</span>
            <span className="transition hover:text-volt">Soporte</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
