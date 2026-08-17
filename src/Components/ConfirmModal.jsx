import { motion, AnimatePresence } from "framer-motion";

// Reemplaza confirm() nativo del navegador: mismo look que el resto de los
// modales de la app (ej. "Crear torneo" en Prode.jsx) en vez de un diálogo
// gris del sistema operativo.
const ConfirmModal = ({
    open,
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    danger = false,
    onConfirm,
    onCancel,
}) => (
    <AnimatePresence>
        {open && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] grid place-items-center p-5 bg-black/70 backdrop-blur-sm"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.92, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="panel border-line clip-card relative w-full max-w-sm overflow-hidden"
                >
                    <div
                        className={`absolute inset-x-0 top-0 h-[3px] ${danger ? "bg-coral" : "bg-volt"}`}
                    />
                    <div className="p-6">
                        <h3 className="display-giant text-2xl text-white mb-2">{title}</h3>
                        {message && (
                            <p className="text-sm text-[#a3a39c] mb-6">{message}</p>
                        )}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 panel-2 text-[#8a8a82] font-display font-700 uppercase tracking-wider text-xs clip-btn hover:text-white transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 py-3 font-display font-700 uppercase tracking-wider text-xs clip-btn transition-colors ${
                                    danger
                                        ? "bg-coral text-white hover:bg-white hover:text-coral"
                                        : "bg-volt text-ink hover:bg-white"
                                }`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default ConfirmModal;
