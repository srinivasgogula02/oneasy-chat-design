"use client";

import { useState, useTransition } from "react";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { getGroqResponse } from "@/app/actions";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ProChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const [, startTransition] = useTransition();

    const handleSendMessage = async (content: string) => {
        // Add user message immediately
        const userMessage: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        startTransition(async () => {
            try {
                const response = await getGroqResponse(content);
                const aiMessage: Message = { role: "assistant", content: response };
                setMessages((prev) => [...prev, aiMessage]);
            } catch (error) {
                console.error("Failed to get response", error);
                // Optional: Add error message to chat
            } finally {
                setIsTyping(false);
            }
        });
    };

    return (
        <div className="flex h-screen w-full bg-[#09090b] text-white overflow-hidden font-sans selection:bg-emerald-500/30">
            {/* Ambient Background */}
            <div className="ambient-bg" />

            <div className="flex h-screen w-full relative z-10">

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col h-full relative">
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center p-4 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
                        <span className="font-medium">Oneasy AI</span>
                    </div>

                    {/* Model Selector / Header (Optional) */}
                    <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#09090b]/50 backdrop-blur-xl z-10 shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                            <span className="text-sm font-medium text-white/90">Oneasy AI</span>
                            <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/50">Legal Expert</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <MessageList
                        messages={messages}
                        isTyping={isTyping}
                        onSuggestionClick={handleSendMessage}
                    />

                    {/* Input Area */}
                    <div className="p-4 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent pb-6">
                        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
                    </div>
                </div>
            </div>
        </div>
    );
}
