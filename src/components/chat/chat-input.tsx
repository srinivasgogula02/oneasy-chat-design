"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import { Send, Paperclip, Mic, StopCircle } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !disabled) {
                onSend(value);
                setValue("");
            }
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4">
            <div className={cn(
                "relative flex flex-col w-full bg-[#18181b]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ease-out focus-within:border-emerald-500/30 focus-within:ring-1 focus-within:ring-emerald-500/30 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden",
                disabled && "opacity-50 pointer-events-none grayscale"
            )}>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Oneasy..."
                    className="w-full bg-transparent text-white placeholder:text-white/30 px-4 py-3 min-h-[56px] max-h-[200px] resize-none focus:outline-none text-base"
                    rows={1}
                />

                <div className="flex justify-between items-center px-2 pb-2">
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Attach file">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Voice input">
                            <Mic className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            if (value.trim() && !disabled) {
                                onSend(value);
                                setValue("");
                            }
                        }}
                        disabled={!value.trim() || disabled}
                        className={cn(
                            "p-2 rounded-lg transition-all duration-300 ease-out",
                            value.trim() && !disabled
                                ? "bg-white text-black hover:bg-emerald-400 hover:text-black hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
                                : "bg-white/5 text-white/20 cursor-not-allowed"
                        )}
                    >
                        <div className="relative">
                            {disabled ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
                        </div>
                    </button>
                </div>
            </div>
            <div className="text-center mt-2 text-xs text-white/30">
                AI can make mistakes. Please check important info.
            </div>
        </div>
    );
}
