"use client";

import { useState, useTransition } from "react";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { EvaluationPanel } from "./evaluation-panel";
import { processMessage } from "@/app/actions";
import { AgentState } from "@/lib/legal-agent/types";
import { QUESTIONS } from "@/lib/legal-agent/data";
import { BarChart3, X, MessageSquare } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ProChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [agentState, setAgentState] = useState<AgentState | null>(null);
    const [showPanel, setShowPanel] = useState(false); // Mobile panel toggle

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
        setShowPanel(false);
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

            {/* Safety Block Alert */}
            {agentState?.isBlocked && (
                <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Safety Alert</h3>
                        <p className="text-slate-600 mb-6">
                            This conversation has been flagged for safety violations. Please restart the chat to continue with a different topic.
                        </p>
                        <button
                            onClick={handleReset}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                        >
                            Restart Chat
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row h-screen w-full relative z-10">
                {/* Chat Area - Full width on mobile, half on desktop */}
                <div className={`w-full lg:w-1/2 flex flex-col h-full relative lg:border-r border-slate-200/60 ${showPanel ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                                <span className="text-sm font-medium text-[#01334c]">Oneasy AI</span>
                                <span className="text-xs bg-[#01334c]/10 text-[#01334c] px-1.5 py-0.5 rounded font-medium hidden sm:inline">Legal Advisor</span>
                            </div>

                            {/* Mobile Progress Circle */}
                            {agentState && !agentState.isComplete && (
                                <div className="lg:hidden flex items-center gap-2">
                                    <div className="relative w-8 h-8">
                                        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                                            <circle
                                                cx="16"
                                                cy="16"
                                                r="12"
                                                stroke="#e2e8f0"
                                                strokeWidth="3"
                                                fill="none"
                                            />
                                            <circle
                                                cx="16"
                                                cy="16"
                                                r="12"
                                                stroke="#01334c"
                                                strokeWidth="3"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={`${Math.min(Object.keys(agentState.answers).length / 6, 1) * 75.4} 75.4`}
                                            />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-[#01334c]">
                                            {Object.keys(agentState.answers).length}/6
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Completed Badge */}
                            {agentState?.isComplete && (
                                <span className="lg:hidden text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                    ✓ Done
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-slate-500 hover:text-[#01334c] hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    New Chat
                                </button>
                            )}
                            {/* Mobile: Show Analysis Button */}
                            {agentState && (
                                <button
                                    onClick={() => setShowPanel(true)}
                                    className="lg:hidden flex items-center gap-1.5 text-xs bg-[#01334c] text-white px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    Analysis
                                </button>
                            )}
                        </div>
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
                    <div className="p-3 sm:p-4 bg-gradient-to-t from-white via-white to-transparent pb-4 sm:pb-6">
                        <ChatInput
                            onSend={handleSendMessage}
                            disabled={isTyping || agentState?.isComplete || agentState?.isBlocked}
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

                {/* Evaluation Panel - Desktop: always visible, Mobile: overlay */}
                <div className={`
                    ${showPanel ? 'flex' : 'hidden'} lg:flex
                    fixed lg:relative inset-0 lg:inset-auto
                    w-full lg:w-1/2 h-full 
                    lg:border-l border-slate-200/60
                    z-50 lg:z-10
                    bg-white
                `}>
                    {/* Mobile: Close Button */}
                    <button
                        onClick={() => setShowPanel(false)}
                        className="lg:hidden absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>

                    {/* Mobile: Back to Chat Button */}
                    <button
                        onClick={() => setShowPanel(false)}
                        className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2.5 bg-[#01334c] text-white rounded-full shadow-lg transition-transform hover:scale-105"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Back to Chat
                    </button>

                    <EvaluationPanel agentState={agentState} />
                </div>
            </div>
        </div>
    );
}
