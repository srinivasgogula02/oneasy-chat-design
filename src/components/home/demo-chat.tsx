"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CircleUserRound, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_SCRIPT = [
    { role: "assistant", content: "Hi! I'm here to help you choose the perfect legal structure for your business. First, are you starting a profit-focused business or a non-profit/charity?", delay: 500 },
    { role: "user", content: "It's a profit-focused tech startup.", delay: 1500 },
    { role: "assistant", content: "Got it. And will you be raising venture capital tailored funding, or are you bootstrapping?", delay: 1000 },
    { role: "user", content: "We plan to raise VC funding in the next 6 months.", delay: 1500 },
    { role: "assistant", content: "Analyzing 12 entity types based on 'Tech Startup' + 'VC Funding'...", delay: 500, type: "thinking" },
    { role: "assistant", content: "I've analyzed your needs. A **Delaware C-Corp** is your best match (98% Match Score) because VCs specifically require this structure for investment.", delay: 1500 },
    { role: "card", content: "Recommendation: Delaware C-Corp", subtext: "Match Score: 98% • Best for VC Funding", delay: 1000 }
];

export function DemoChat() {
    const [messages, setMessages] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const processScript = async () => {
            if (currentIndex >= DEMO_SCRIPT.length) return;

            const scriptItem = DEMO_SCRIPT[currentIndex];

            // Wait for the specified delay before starting this step
            await new Promise(resolve => setTimeout(resolve, scriptItem.delay));

            if (!isMounted) return;

            if (scriptItem.role === "user") {
                setMessages(prev => [...prev, scriptItem]);
                setCurrentIndex(prev => prev + 1);
            } else {
                setIsTyping(true);
                // Simulate thinking/typing time based on content length
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (!isMounted) return;

                setIsTyping(false);
                setMessages(prev => [...prev, scriptItem]);
                setCurrentIndex(prev => prev + 1);
            }
        };

        processScript();

        return () => { isMounted = false; };
    }, [currentIndex]);

    return (
        <div className="w-full max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] relative">
            {/* Header */}
            <div className="h-14 border-b border-border bg-muted/30 flex items-center px-6 justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="font-medium text-sm text-foreground/80">OnEasy Demo</div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-background to-muted/10">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className={cn(
                                "flex w-full",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === "card" ? (
                                <div className="w-full max-w-sm bg-background border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
                                    <div className="h-10 w-10 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{msg.content}</h4>
                                        <p className="text-xs text-muted-foreground">{msg.subtext}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className={cn(
                                    "flex items-start gap-3 max-w-[80%]",
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                    )}>
                                        {msg.role === "user" ? <CircleUserRound className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-indigo-500" />}
                                    </div>
                                    <div className={cn(
                                        "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted text-foreground rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none text-foreground/50 text-xs font-medium">
                                OnEasy is typing...
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area (Static) */}
            <div className="p-4 border-t border-border bg-background">
                <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3 opacity-50 cursor-not-allowed">
                    <div className="flex-1 text-sm text-muted-foreground">Type a message...</div>
                    <div className="w-8 h-8 bg-primary/20 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
