import { motion } from "framer-motion";

// Envoltorio compartido para que cada página tenga la misma transición de
// entrada/salida al navegar (AnimatePresence en MainRoutes detecta el
// mount/unmount de este motion.div vía el key de <Routes location>).
const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

export default PageTransition;
