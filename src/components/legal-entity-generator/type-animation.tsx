"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function TypeAnimation({ strings }: { strings: string[] }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIndex((current) => (current + 1) % strings.length);
        }, 2500); // Change phrase every 2.5 seconds

        return () => clearInterval(intervalId);
    }, [strings.length]);

    return (
        <div className="inline">
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="inline-block"
                >
                    {strings[index]}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}
