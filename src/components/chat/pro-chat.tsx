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
                setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I hit a small bump. Could you say that again?" }]);
            } finally {
                setIsTyping(false);
            }
        });
    };

    // Reset chat handler
    const handleReset = () => {
        setMessages([]);
        setAgentState(null);
        setIsTyping(false);
    };

    // Determine suggestions to display
    let displaySuggestions: string[] = [];

    if (!agentState) {
        // Initial state suggestions
        displaySuggestions = [
            "I want to start a business",
            "I want to start a non-profit/NGO",
        ];
    } else if (agentState.isComplete) {
        // Completion state - show restart option
        displaySuggestions = ["Start a new consultation"];
    } else {
        // Current question options
        const currentQ = QUESTIONS[agentState.currentQuestionId];
        if (currentQ?.options) {
            displaySuggestions = currentQ.options.map(o => o.text);
        }
    }

    // Welcome message for empty chat
    const welcomeMessage: Message | null = messages.length === 0 ? {
        role: "assistant",
        content: "👋 Hi there! I'm **Oneasy**, your AI legal advisor. I'll help you find the perfect legal structure for your venture.\n\nAre you starting a **business** or a **non-profit/NGO**?"
    } : null;

    return (
        <div className="flex h-screen w-full bg-white text-[#01334c] overflow-hidden font-sans selection:bg-[#01334c]/10">
            {/* Ambient Background */}
            <div className="ambient-bg" />

            <div className="flex h-screen w-full relative z-10">
                {/* Left Half - Chat Area */}
                <div className="w-1/2 flex flex-col h-full relative border-r border-slate-200/60">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl z-10">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                            <span className="text-sm font-medium text-[#01334c]">Oneasy AI</span>
                            <span className="text-xs bg-[#01334c]/10 text-[#01334c] px-1.5 py-0.5 rounded font-medium">Legal Advisor</span>
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={handleReset}
                                className="text-xs text-slate-500 hover:text-[#01334c] hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                New Chat
                            </button>
                        )}
                    </div>

                    {/* Messages */}
                    <MessageList
                        messages={welcomeMessage ? [welcomeMessage, ...messages] : messages}
                        isTyping={isTyping}
                        suggestions={displaySuggestions}
                        onSuggestionClick={(text) => {
                            if (text === "Start a new consultation") {
                                handleReset();
                            } else {
                                handleSendMessage(text);
                            }
                        }}
                    />

                    {/* Input Area */}
                    <div className="p-4 bg-gradient-to-t from-white via-white to-transparent pb-6">
                        <ChatInput
                            onSend={handleSendMessage}
                            disabled={isTyping || agentState?.isComplete}
                            placeholder={
                                agentState?.isComplete
                                    ? "Consultation complete! Click 'Start a new consultation' above"
                                    : isTyping
                                        ? "Thinking..."
                                        : "Message Oneasy..."
                            }
                        />
                    </div>
                </div>

                {/* Right Half - Evaluation Panel */}
                <div className="w-1/2 h-full border-l border-slate-200/60">
                    <EvaluationPanel agentState={agentState} />
                </div>
            </div>
        </div>
    );
}
