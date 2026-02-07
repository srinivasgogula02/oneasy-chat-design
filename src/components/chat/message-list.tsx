/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Copy, User, Scale, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface MessageListProps {
    messages: Message[];
    isTyping?: boolean;
    suggestions?: string[];
    onSuggestionClick?: (suggestion: string) => void;
}

export function MessageList({ messages, isTyping, suggestions, onSuggestionClick }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isTyping) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        } else if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];

            if (lastMessage.role === "assistant") {
                const userMessageIndex = messages.length - 2;
                if (userMessageIndex >= 0) {
                    const userMessageEl = document.getElementById(`message-${userMessageIndex}`);
                    if (userMessageEl) {
                        userMessageEl.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            } else {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, isTyping]);

    return (
        <div className="flex-1 overflow-y-auto px-3 sm:p-4 py-4 space-y-4 sm:space-y-6">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    {/* Welcome Section */}
                    <div className="space-y-4 mb-8">
                        <div className="w-16 h-16 bg-[#01334c]/5 rounded-2xl flex items-center justify-center mx-auto border border-[#01334c]/10">
                            <Scale className="w-8 h-8 text-[#01334c]" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-[#01334c] mb-2">Oneasy Legal Advisor</h2>
                            <p className="text-sm text-slate-500 max-w-md">
                                I'll help you find the perfect legal entity for your venture. Let's start!
                            </p>
                        </div>
                    </div>

                    {/* Suggestion Buttons - Prominent and Centered */}
                    {suggestions && suggestions.length > 0 && (
                        <div className="w-full max-w-md space-y-3">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">Choose one to begin</p>
                            {suggestions.map((suggestion, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => onSuggestionClick?.(suggestion)}
                                    className="w-full p-4 text-left bg-white hover:bg-[#01334c]/5 border border-slate-200 hover:border-[#01334c]/30 rounded-xl transition-all flex items-center gap-3 group shadow-sm hover:shadow"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-[#01334c]/10 flex items-center justify-center transition-colors">
                                        <Sparkles className="w-5 h-5 text-slate-400 group-hover:text-[#01334c] transition-colors" />
                                    </div>
                                    <span className="text-slate-700 group-hover:text-[#01334c] font-medium">{suggestion}</span>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        id={`message-${index}`}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className={cn(
                            "group flex gap-4 max-w-3xl mx-auto w-full",
                            msg.role === "assistant" ? "" : "bg-transparent"
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 shadow-sm",
                            msg.role === "assistant" ? "bg-[#01334c]/10 text-[#01334c]" : "bg-slate-100 text-slate-600"
                        )}>
                            {msg.role === "assistant" ? <Scale className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 space-y-2 overflow-hidden">
                            <div className="font-medium text-sm text-slate-500">
                                {msg.role === "assistant" ? "Oneasy AI" : "You"}
                            </div>
                            <div className="prose prose-sm max-w-none text-[#01334c] leading-7 tracking-wide">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) {
                                            const match = /language-(\w+)/.exec(className || "");
                                            return !inline && match ? (
                                                <div className="relative rounded-md overflow-hidden my-4 border border-slate-200 shadow-sm">
                                                    <div className="bg-slate-50 px-4 py-2 text-xs flex justify-between items-center text-slate-500 border-b border-slate-200">
                                                        <span>{match[1]}</span>
                                                        <button className="hover:text-[#01334c] transition-colors" onClick={() => navigator.clipboard.writeText(String(children))}>
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus as any}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        className="!bg-[#09090b] !m-0 !p-4 !overflow-x-auto"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, "")}
                                                    </SyntaxHighlighter>
                                                </div>
                                            ) : (
                                                <code className={cn("bg-slate-100 px-1 py-0.5 rounded text-sm text-[#01334c] font-mono", className)} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        p: ({ children }) => <p className="mb-4 last:mb-0 text-slate-800">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-4 space-y-1 text-slate-800">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-4 space-y-1 text-slate-800">{children}</ol>,
                                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-[#01334c]">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0 text-[#01334c]">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0 text-[#01334c]">{children}</h3>,
                                        blockquote: ({ children }) => <blockquote className="border-l-2 border-[#01334c]/20 pl-4 italic my-4 text-slate-600">{children}</blockquote>,
                                        a: ({ children, href }) => <a href={href} className="text-[#01334c] hover:underline font-medium" target="_blank" rel="noopener noreferrer">{children}</a>,
                                        table: ({ children }) => <div className="overflow-x-auto my-4 border border-slate-200 rounded-lg shadow-sm"><table className="min-w-full divide-y divide-slate-200">{children}</table></div>,
                                        thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
                                        th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{children}</th>,
                                        tbody: ({ children }) => <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>,
                                        tr: ({ children }) => <tr>{children}</tr>,
                                        td: ({ children }) => <td className="px-3 py-2 text-sm text-slate-700 whitespace-nowrap">{children}</td>,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </motion.div>
                ))
            )}

            {/* In-chat Suggestions / Options */}
            {messages.length > 0 && suggestions && suggestions.length > 0 && !isTyping && (
                <div className="flex gap-2 overflow-x-auto pb-2 max-w-3xl mx-auto w-full pl-0 sm:pl-12 scrollbar-hide">
                    {suggestions.map((suggestion, index) => (
                        <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onSuggestionClick?.(suggestion)}
                            className="shrink-0 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#01334c]/30 text-slate-600 hover:text-[#01334c] px-3 sm:px-4 py-2 rounded-full text-sm transition-all shadow-sm hover:shadow whitespace-nowrap"
                        >
                            {suggestion}
                        </motion.button>
                    ))}
                </div>
            )}

            {isTyping && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 max-w-3xl mx-auto w-full"
                >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 bg-[#01334c]/10 text-[#01334c]">
                        <Scale className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="font-medium text-sm text-slate-500 flex items-center gap-2">
                            Oneasy AI
                            <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 animate-pulse">Analyzing...</span>
                        </div>
                        <div className="h-4 bg-gradient-to-r from-slate-200 to-transparent rounded w-1/4 animate-pulse"></div>
                    </div>
                </motion.div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}
