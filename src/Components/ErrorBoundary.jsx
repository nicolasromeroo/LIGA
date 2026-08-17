import { Component } from "react";

// React 19 todavía requiere un class component para capturar errores de
// render de sus hijos (no hay equivalente en hooks).
class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Error de render capturado por ErrorBoundary:", error, info);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="relative min-h-screen overflow-hidden bg-ink pb-bottom-nav text-[#ededea] grain grid place-items-center">
                <div className="absolute inset-0 bg-pitch-grid opacity-40" />
                <div className="relative z-10 mx-auto max-w-lg px-6 text-center">
                    <p className="eyebrow text-coral">Error inesperado</p>
                    <h1 className="display-giant mt-4 text-[clamp(2.6rem,8vw,4.5rem)] text-white">
                        Algo se rompió
                    </h1>
                    <p className="mt-4 text-sm text-[#a3a39c] sm:text-base">
                        Ocurrió un error al mostrar esta pantalla. Podés intentar volver
                        a cargarla.
                    </p>
                    <button
                        onClick={() => window.location.assign("/")}
                        className="clip-btn shine relative mt-9 bg-volt px-10 py-4 font-display text-sm font-700 uppercase tracking-[0.2em] text-ink transition-all hover:bg-white"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
