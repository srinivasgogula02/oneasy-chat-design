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
    onSuggestionClick?: (suggestion: string) => void;
}

const suggestions = [
    "Difference between LLC and C-Corp?",
    "Best state to incorporate for SaaS?",
    "Do I need a registered agent?",
    "Pros and cons of Sole Proprietorship",
];

export function MessageList({ messages, isTyping, onSuggestionClick }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isTyping) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        } else if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];

            if (lastMessage.role === "assistant") {
                // Find the index of the corresponding user message (usually the one right before)
                const userMessageIndex = messages.length - 2;
                if (userMessageIndex >= 0) {
                    const userMessageEl = document.getElementById(`message-${userMessageIndex}`);
                    if (userMessageEl) {
                        // Scroll to the user message so context + answer are visible
                        userMessageEl.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            } else {
                // For user messages (just sent), scroll to bottom
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, isTyping]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <Scale className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Oneasy Legal Advisor</h2>
                        <p className="text-sm text-white/50">Ask anything about legal entities or choose a suggestion below.</p>
                    </div>
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
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10",
                            msg.role === "assistant" ? "bg-emerald-500/10 text-emerald-500" : "bg-white/10 text-white"
                        )}>
                            {msg.role === "assistant" ? <Scale className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 space-y-2 overflow-hidden">
                            <div className="font-medium text-sm text-white/50">
                                {msg.role === "assistant" ? "AI Assistant" : "You"}
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none text-white/90 leading-7 tracking-wide">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) {
                                            const match = /language-(\w+)/.exec(className || "");
                                            return !inline && match ? (
                                                <div className="relative rounded-md overflow-hidden my-4 border border-white/10">
                                                    <div className="bg-white/5 px-4 py-2 text-xs flex justify-between items-center text-white/50 border-b border-white/10">
                                                        <span>{match[1]}</span>
                                                        <button className="hover:text-white transition-colors" onClick={() => navigator.clipboard.writeText(String(children))}>
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
                                                <code className={cn("bg-white/10 px-1 py-0.5 rounded text-sm", className)} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        // Basic styling overrides
                                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-4 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-4 space-y-1">{children}</ol>,
                                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>,
                                        blockquote: ({ children }) => <blockquote className="border-l-2 border-white/20 pl-4 italic my-4 text-white/70">{children}</blockquote>,
                                        a: ({ children, href }) => <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                        table: ({ children }) => <div className="overflow-x-auto my-4 border border-white/10 rounded-lg"><table className="min-w-full divide-y divide-white/10">{children}</table></div>,
                                        thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
                                        th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-medium text-white/50 uppercase tracking-wider">{children}</th>,
                                        tbody: ({ children }) => <tbody className="divide-y divide-white/10">{children}</tbody>,
                                        tr: ({ children }) => <tr>{children}</tr>,
                                        td: ({ children }) => <td className="px-3 py-2 text-sm text-white/70 whitespace-nowrap">{children}</td>,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </motion.div>
                ))
            )}

            {isTyping && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 max-w-3xl mx-auto w-full"
                >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10 bg-emerald-500/10 text-emerald-500">
                        <Scale className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="font-medium text-sm text-white/50 flex items-center gap-2">
                            Oneasy AI
                            <span className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-white/30 animate-pulse">Analyzing...</span>
                        </div>
                        <div className="h-4 bg-gradient-to-r from-white/10 to-transparent rounded w-1/4 animate-pulse"></div>
                    </div>
                </motion.div>
            )}

            {messages.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-3xl mx-auto w-full mt-8">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => onSuggestionClick?.(suggestion)}
                            className="p-3 text-sm text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all flex items-center gap-2 group"
                        >
                            <Sparkles className="w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors" />
                            <span className="text-white/70 group-hover:text-white">{suggestion}</span>
                        </button>
                    ))}
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}
