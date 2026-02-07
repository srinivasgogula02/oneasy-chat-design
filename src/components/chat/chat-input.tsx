"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import { Send, Paperclip, Mic, StopCircle } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Message Oneasy..." }: ChatInputProps) {
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
        <div className="w-full max-w-3xl mx-auto px-2 sm:p-4">
            <div className={cn(
                "relative flex flex-col w-full bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 ease-out focus-within:border-[#01334c]/30 focus-within:ring-1 focus-within:ring-[#01334c]/30 focus-within:shadow-[0_0_20px_rgba(1,51,76,0.1)] overflow-hidden",
                disabled && "opacity-50 pointer-events-none grayscale bg-slate-100"
            )}>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-[#01334c] placeholder:text-slate-400 px-4 py-3 min-h-[56px] max-h-[200px] resize-none focus:outline-none text-base"
                    rows={1}
                />

                <div className="flex justify-between items-center px-2 pb-2">
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-slate-400 hover:text-[#01334c] hover:bg-slate-200 rounded-lg transition-colors" title="Attach file">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-[#01334c] hover:bg-slate-200 rounded-lg transition-colors" title="Voice input">
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
                            "p-2 rounded-lg transition-all duration-300 ease-out flex items-center justify-center",
                            value.trim() && !disabled
                                ? "bg-[#01334c] text-white hover:bg-[#024a6e] hover:shadow-lg hover:scale-105 active:scale-95"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {disabled ? <StopCircle className="w-5 h-5 animate-pulse text-slate-500" /> : <Send className="w-4 h-4 ml-0.5" />}
                    </button>
                </div>
            </div>
            <div className="text-center mt-3 text-xs text-slate-400">
                AI can make mistakes. Please check important info.
            </div>
        </div>
    );
}
