"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";

const chatSequence = [
    { role: "user", text: "Hi, I want to start a software company with my friend. We're both Indians. What should we register as?" },
    { role: "agent", text: "Great! A few quick questions to give you the right answer. First — do you plan to raise funding from investors (angels or VCs) in the next 2 years?" },
    { role: "user", text: "Maybe yes, we're open to it if we get the right opportunity." },
    { role: "agent", text: "Got it. And what's your expected revenue in Year 1? Roughly is fine — under ₹20L, ₹20L–₹1Cr, or above ₹1Cr?" },
    { role: "user", text: "Probably ₹30–40 Lakhs in the first year." },
    { role: "agent", text: "Perfect. One last one — will either of you have any foreign co-founders or foreign investors from day one?" },
    { role: "user", text: "No, both Indian. But maybe a US investor later." },
    { role: "agent", text: "✦ Recommendation: **Private Limited Company** — This is the right structure for you. It's the only entity type that allows equity-based funding from angel investors and VCs. With 2 Indian founders, you can incorporate easily. Estimated setup cost: ₹8,000–₹12,000. Annual compliance: ₹25,000–₹40,000/year. Want me to connect you with OnEasy's CA team to register right now?" },
    { role: "user", text: "Yes! And this was completely free?" },
    { role: "agent", text: "100% free. Always. 😊 The recommendation is on us. If you'd like us to handle the actual registration, that starts at ₹7,999 — all-inclusive." },
];

export function PhoneChatDemo() {
    const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < chatSequence.length) {
            const timer = setTimeout(() => {
                setMessages((prev) => [...prev, chatSequence[currentIndex]]);
                setCurrentIndex((prev) => prev + 1);
            }, chatSequence[currentIndex].role === "user" ? 1500 : 3500); // Agents take longer to "type"
            return () => clearTimeout(timer);
        } else {
            // Loop the animation after a long pause
            const resetTimer = setTimeout(() => {
                setMessages([]);
                setCurrentIndex(0);
            }, 10000);
            return () => clearTimeout(resetTimer);
        }
    }, [currentIndex]);

    return (
        <div className="relative mx-auto w-full max-w-[320px] aspect-[9/19] bg-[#0E0E0E] rounded-[40px] border-[8px] border-[#1A1A1A] shadow-2xl overflow-hidden animate-float">
            {/* Phone Header */}
            <div className="absolute top-0 inset-x-0 h-14 bg-[#111111]/90 backdrop-blur-md z-10 border-b border-white/5 flex items-center justify-center">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#080808] rounded-full" /> {/* Notch */}
                <div className="flex items-center gap-2 mt-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-white/90">Virtual CA Agent</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="absolute inset-0 pt-16 pb-6 px-4 overflow-y-auto scrollbar-hide flex flex-col justify-end bg-[#050505]">
                <div className="flex flex-col gap-3 justify-end min-h-full pb-4">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={clsx(
                                "max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed",
                                msg.role === "user"
                                    ? "bg-white/10 text-white self-end rounded-tr-sm"
                                    : "bg-[#111111] border border-white/10 text-white/90 self-start rounded-tl-sm shadow-[0_4px_20px_rgba(232,25,44,0.05)]"
                            )}
                        >
                            {/* Simple Markdown highlighting for bold text */}
                            {msg.text.split("**").map((part, i) =>
                                i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : <span key={i}>{part}</span>
                            )}
                        </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {currentIndex < chatSequence.length && chatSequence[currentIndex].role === "agent" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#111111] border border-white/10 self-start rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1"
                        >
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Fade at top to obscure scrolling messages */}
            <div className="absolute top-14 left-0 right-0 h-10 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none" />
        </div>
    );
}
