import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------
   authUi — piezas compartidas de Login/Register.
   Mantiene el lenguaje visual del sitio (ink/volt/clip-*) y suma:
   inputs con ícono y focus ring, toggle de contraseña, botón con
   spinner, alerts y un layout responsive con fondo también en mobile.
   ------------------------------------------------------------------ */

const ICONS = {
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
        </>
    ),
    mail: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
        </>
    ),
    lock: (
        <>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
    ),
    eye: (
        <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    "eye-off": (
        <>
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.2M6.6 6.6C3.8 8.5 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.7-1.3" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
    ),
};

export const Icon = ({ name, className = "w-[18px] h-[18px]" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        {ICONS[name]}
    </svg>
);

/** Input con ícono, focus ring volt y slot a la derecha (ej: ojo). */
export const Field = ({ label, icon, right, ...props }) => (
    <div>
        <label className="eyebrow text-[#8a8a82] block mb-2">{label}</label>
        <div className="group flex items-center bg-surface border border-line clip-tag transition-all duration-200 focus-within:border-volt/70 focus-within:shadow-[0_0_18px_-6px_rgba(212,255,0,.45)]">
            <span className="pl-4 text-[#5a5a52] group-focus-within:text-volt transition-colors shrink-0">
                <Icon name={icon} />
            </span>
            <input
                className="w-full min-w-0 bg-transparent px-3 py-3 text-[15px] text-white placeholder-[#5a5a52] outline-none"
                {...props}
            />
            {right}
        </div>
    </div>
);

/** Campo contraseña con botón para mostrar/ocultar. */
export const PasswordField = ({ label = "Contraseña", ...props }) => {
    const [show, setShow] = useState(false);
    return (
        <Field
            label={label}
            icon="lock"
            type={show ? "text" : "password"}
            right={
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex={-1}
                    className="px-3.5 self-stretch text-[#5a5a52] hover:text-white transition-colors shrink-0"
                >
                    <Icon name={show ? "eye-off" : "eye"} />
                </button>
            }
            {...props}
        />
    );
};

export const SubmitButton = ({ loading, loadingText, children }) => (
    <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-volt text-ink font-display font-700 uppercase tracking-wider clip-btn hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2.5"
    >
        {loading && (
            <span className="w-4 h-4 rounded-full border-2 border-ink/30 border-t-ink animate-spin" />
        )}
        {loading ? loadingText : children}
    </button>
);

export const Alert = ({ type = "error", children }) => (
    <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        role="alert"
        className={`flex items-start gap-2.5 px-4 py-3 text-sm clip-tag border ${
            type === "error"
                ? "border-coral/40 bg-coral/10 text-coral"
                : "border-volt/40 bg-volt/10 text-volt"
        }`}
    >
        <span className="font-bold">{type === "error" ? "!" : "✓"}</span>
        <span>{children}</span>
    </motion.div>
);

const ACCENT = {
    volt: {
        text: "text-volt",
        orb: "bg-volt/10",
    },
    gold: {
        text: "text-gold",
        orb: "bg-gold/10",
    },
};

/**
 * Layout de dos columnas: panel de marca (desktop) + zona de formulario
 * con fondo trabajado también en mobile y card glass para el contenido.
 */
export const AuthLayout = ({
    accent = "volt",
    brand, // { img, imgClass, eyebrow, line1, line2, ghost, overlay }
    children,
}) => {
    const a = ACCENT[accent] ?? ACCENT.volt;
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-ink text-[#ededea]">
            {/* Panel de marca (solo desktop) */}
            <div className="relative hidden lg:block overflow-hidden grain border-r border-line">
                <div className={`absolute inset-0 ${brand.overlay ?? "bg-pitch-grid"} opacity-50`} />
                <div className={`absolute -bottom-10 -right-10 w-[34rem] h-[34rem] rounded-full ${a.orb} blur-[120px]`} />
                {brand.img && (
                    <img
                        src={brand.img}
                        alt=""
                        className={
                            brand.imgClass ??
                            "absolute bottom-0 right-0 h-[85%] object-contain opacity-90 drop-shadow-[0_30px_60px_rgba(0,0,0,.7)]"
                        }
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                )}
                <div className="pointer-events-none absolute -bottom-6 left-0 leading-none">
                    <span className="display-giant block text-[16vw] outline-text opacity-[0.08]">
                        {brand.ghost}
                    </span>
                </div>
                <div className="relative z-10 p-12 h-full flex flex-col justify-between">
                    <Link to="/" className="font-mega text-3xl uppercase tracking-[0.12em] w-fit">
                        <span className="text-white">Li</span>
                        <span className="text-volt">ga</span>
                    </Link>
                    <div>
                        <p className={`eyebrow ${a.text} mb-3`}>{brand.eyebrow}</p>
                        <h2 className="display-giant text-6xl text-white leading-[0.85]">
                            {brand.line1}
                            <br />
                            <span className={`italic-skew ${a.text}`}>{brand.line2}</span>
                        </h2>
                    </div>
                </div>
            </div>

            {/* Zona de formulario (fondo trabajado también en mobile) */}
            <div className="relative flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14 overflow-hidden">
                <div className="absolute inset-0 bg-pitch-grid opacity-30" />
                <div className={`absolute -top-28 -right-28 w-96 h-96 rounded-full ${a.orb} blur-[110px]`} />
                <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-coral/5 blur-[110px]" />
                <div className="pointer-events-none absolute -bottom-4 right-0 leading-none lg:hidden">
                    <span className="display-giant block text-[34vw] outline-text opacity-[0.06]">
                        LIGA
                    </span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-md"
                >
                    {/* Logo arriba (solo mobile/tablet) */}
                    <Link
                        to="/"
                        className="lg:hidden inline-block font-mega text-2xl uppercase tracking-[0.12em] mb-6"
                    >
                        <span className="text-white">Li</span>
                        <span className="text-volt">ga</span>
                    </Link>

                    <div className="glass-strong clip-card p-6 sm:p-9">{children}</div>
                </motion.div>
            </div>
        </div>
    );
};
