
// components/AnimatedOnScroll.jsx
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

const variants = {
    hidden: (direction = "up") => {
        switch (direction) {
            case "left":
                return { opacity: 0, x: -100 };
            case "right":
                return { opacity: 0, x: 100 };
            case "up":
                return { opacity: 0, y: 100 };
            case "down":
                return { opacity: 0, y: -100 };
            case "diagonal":
                return { opacity: 0, x: -100, y: 100 };
            default:
                return { opacity: 0 };
        }
    },
    visible: { opacity: 1, x: 0, y: 0 },
};

export const AnimatedOnScroll = ({
    children,
    delay = 0.2,
    duration = 0.7,
    direction = "up",
    once = true,
}) => {
    const [ref, inView] = useInView({ triggerOnce: once, threshold: 0.2 });
    const [hasBeenVisible, setHasBeenVisible] = useState(false);

    useEffect(() => {
        if (inView && !hasBeenVisible) setHasBeenVisible(true);
    }, [inView]);

    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={direction}
            transition={{ duration, delay }}
        >
            {children}
        </motion.div>
    );
};
