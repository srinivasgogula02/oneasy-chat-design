"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { EvaluationPanel } from "./evaluation-panel";
import { processLegalAgentV2Message } from "@/app/actions"; // V2 Agent
import { AgentState, INITIAL_SCORES } from "@/lib/legal-agent/types";
import { INITIAL_PROFILE } from "@/lib/legal-agent-v2/types";
import { mapV2ProfileToLegacyAnswers, calculateScoresFromV2Profile } from "@/lib/legal-agent-v2/mapper";
import { BarChart3, X, MessageSquare } from "lucide-react";
import { nanoid } from "nanoid";


interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ProChatProps {
    userId?: string;
}

export function ProChat({ userId }: ProChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [agentState, setAgentState] = useState<AgentState | null>(null);
    const [showPanel, setShowPanel] = useState(false); // Mobile panel toggle
    // Use authenticated User ID as session ID if available, otherwise generate random ID
    const [sessionId] = useState(userId || nanoid());
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    const [, start] = useTransition();

    const handleSendMessage = async (content: string) => {
        // Add user message immediately
        const userMessage: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        start(async () => {
            try {
                // Use V2 AI-driven agent
                const result = await processLegalAgentV2Message(content, sessionId);

                // Convert V2 state to legacy format for UI compatibility
                // We use type assertion here because result comes from server action which might return error object
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const resultData = result as any;
                const profileInUse = resultData.updated_profile || resultData.profile || INITIAL_PROFILE;

                // 1. Map V2 profile to legacy answers for "Your Profile" section
                const dynamicAnswers = mapV2ProfileToLegacyAnswers(profileInUse);

                // 2. Use Direct AI Scoring for "Entity Analysis" chart
                // We map the numeric scores from the AI response to the chart
                let scores = { ...INITIAL_SCORES };

                if (result.suitability_analysis) {
                    const analysis = result.suitability_analysis as Record<string, { score: number }>;
                    scores = {
                        "Private Limited Company": analysis["Private Limited Company"]?.score || 0,
                        "LLP": analysis["LLP"]?.score || 0,
                        "OPC": analysis["One Person Company (OPC)"]?.score || 0, // Map "One Person Company (OPC)" to "OPC"
                        "Partnership Firm": analysis["Partnership Firm"]?.score || 0,
                        "Sole Proprietorship": analysis["Sole Proprietorship"]?.score || 0,
                        "Public Limited Company": 0,
                        "Section 8 Company": analysis["Section 8 Company"]?.score || 0,
                        "Trust": analysis["Trust"]?.score || 0,
                        "Society": analysis["Society"]?.score || 0
                    };
                } else {
                    // Fallback to calculator if for some reason analysis is missing (shouldn't happen)
                    scores = calculateScoresFromV2Profile(profileInUse);
                }

                const legacyState: AgentState = {
                    currentQuestionId: result.isComplete ? 'COMPLETE' : 'AGENTIC',
                    scores,
                    answers: dynamicAnswers, // Populated from V2 profile
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                    isComplete: result.isComplete || false,
                    isBlocked: false,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    recommendedEntity: result.recommendation?.entity as any,
                    confidenceScore: result.recommendation?.confidence,
                };
                setAgentState(legacyState);

                const aiMessage: Message = { role: "assistant", content: result.response };
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
        // Completion state - show follow-up options instead of just restart
        displaySuggestions = [
            "Why did you recommend this?",
            "What are the alternatives?",
            "Tell me about compliance requirements",
            "Start a new consultation",
        ];
    }
    // No fallback to QUESTIONS for AGENTIC state as it is dynamic

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
                            <button
                                onClick={handleLogout}
                                className="text-xs text-slate-500 hover:text-red-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
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
                            disabled={isTyping || agentState?.isBlocked}
                            placeholder={
                                isTyping
                                    ? "Thinking..."
                                    : agentState?.recommendedEntity
                                        ? "Ask follow-up questions or start a new consultation..."
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
