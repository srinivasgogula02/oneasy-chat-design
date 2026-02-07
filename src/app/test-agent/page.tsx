/**
 * Simple test page for agentic chat
 */
"use client";

import { useState } from "react";
import { processAgenticMessage } from "@/app/actions";
import type { AgentState } from "@/lib/agent/types";

export default function AgenticTestPage() {
    const [state, setState] = useState<AgentState | null>(null);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const result = await processAgenticMessage(userMessage, state);

            setState(result.newState);
            setMessages(prev => [...prev, { role: "assistant", content: result.response }]);

            if (result.terminated) {
                alert("Session terminated: " + result.response);
            }

            if (result.requiresApproval) {
                alert("Human approval recommended!");
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { role: "error", content: "Error occurred" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">🤖 Agentic Legal Advisor (Test)</h1>

                {/* Stats */}
                {state && (
                    <div className="mb-4 p-4 bg-gray-800 rounded-lg text-sm">
                        <div><strong>Session:</strong> {state.sessionId.slice(0, 8)}...</div>
                        <div><strong>Iterations:</strong> {state.iterationCount} / 10</div>
                        <div><strong>Factors:</strong> {state.gatheredFactors.length}</div>
                        <div><strong>Next Action:</strong> {state.nextAction}</div>
                        <div className="mt-2">
                            <strong>Top 3 Hypotheses:</strong>
                            <ul className="ml-4">
                                {state.currentHypotheses
                                    .sort((a, b) => b.confidence - a.confidence)
                                    .slice(0, 3)
                                    .map((h, i) => (
                                        <li key={i}>
                                            {h.entity}: {(h.confidence * 100).toFixed(1)}%
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Chat */}
                <div className="bg-gray-800 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                    {messages.length === 0 && (
                        <div className="text-gray-400 text-center mt-20">
                            Ask me anything about legal entity selection...
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`mb-3 p-3 rounded ${msg.role === "user"
                                ? "bg-blue-600 ml-12"
                                : msg.role === "error"
                                    ? "bg-red-600"
                                    : "bg-gray-700 mr-12"
                                }`}
                        >
                            <div className="text-xs text-gray-300 mb-1">
                                {msg.role.toUpperCase()}
                            </div>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    ))}
                    {loading && (
                        <div className="text-gray-400 animate-pulse">Agent thinking...</div>
                    )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-semibold transition"
                    >
                        {loading ? "..." : "Send"}
                    </button>
                </div>

                {/* Reset */}
                <button
                    onClick={() => {
                        setState(null);
                        setMessages([]);
                    }}
                    className="mt-4 text-sm text-gray-400 hover:text-white underline"
                >
                    Reset Session
                </button>
            </div>
        </div>
    );
}
