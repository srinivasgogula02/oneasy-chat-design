"use client";

import { useState, useTransition } from "react";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { EvaluationPanel } from "./evaluation-panel";
import { processMessage } from "@/app/actions";
import { AgentState } from "@/lib/legal-agent/types";
import { QUESTIONS } from "@/lib/legal-agent/data";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ProChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [agentState, setAgentState] = useState<AgentState | null>(null);

    const [, start] = useTransition();

    const handleSendMessage = async (content: string) => {
        // Add user message immediately
        const userMessage: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        start(async () => {
            try {
                const { response, newState } = await processMessage(content, agentState);
                setAgentState(newState);

                const aiMessage: Message = { role: "assistant", content: response };
                setMessages((prev) => [...prev, aiMessage]);
            } catch (error) {
                console.error("Failed to get response", error);
                setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
            } finally {
                setIsTyping(false);
            }
        });
    };

    // Determine suggestions to display
    let displaySuggestions: string[] = [];

    if (!agentState) {
        // Initial state suggestions
        displaySuggestions = [
            "I want to start a business",
            "I want to start a non-profit/NGO",
        ];
    } else {
        // Current question options
        const currentQ = QUESTIONS[agentState.currentQuestionId];
        if (currentQ?.options) {
            displaySuggestions = currentQ.options.map(o => o.text);
        }
    }

    return (
        <div className="flex h-screen w-full bg-[#09090b] text-white overflow-hidden font-sans selection:bg-emerald-500/30">
            {/* Ambient Background */}
            <div className="ambient-bg" />

            <div className="flex h-screen w-full relative z-10">
                {/* Left Half - Chat Area */}
                <div className="w-1/2 flex flex-col h-full relative border-r border-white/5">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#09090b]/50 backdrop-blur-xl z-10">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                            <span className="text-sm font-medium text-white/90">Oneasy AI</span>
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Legal Advisor</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <MessageList
                        messages={messages}
                        isTyping={isTyping}
                        suggestions={displaySuggestions}
                        onSuggestionClick={handleSendMessage}
                    />

                    {/* Input Area */}
                    <div className="p-4 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent pb-6">
                        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
                    </div>
                </div>

                {/* Right Half - Evaluation Panel */}
                <div className="w-1/2 h-full border-l border-white/5">
                    <EvaluationPanel agentState={agentState} />
                </div>
            </div>
        </div>
    );
}
