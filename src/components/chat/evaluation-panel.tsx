"use client";

import { AgentState, EntityType } from "@/lib/legal-agent/types";
import { QUESTIONS } from "@/lib/legal-agent/data";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, CheckCircle2, Sparkles, Building2 } from "lucide-react";

interface EvaluationPanelProps {
    agentState: AgentState | null;
}

const ENTITY_ICONS: Record<string, string> = {
    "Private Limited Company": "🏢",
    "LLP": "🤝",
    "OPC": "👤",
    "Partnership Firm": "👥",
    "Sole Proprietorship": "🧑‍💼",
    "Public Limited Company": "🏛️",
    "Section 8 Company": "💚",
    "Trust": "🏦",
    "Society": "🌍",
};

export function EvaluationPanel({ agentState }: EvaluationPanelProps) {
    if (!agentState) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-white/40 p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <Brain className="w-16 h-16 mx-auto mb-4 text-white/20" />
                    <h3 className="text-lg font-medium text-white/50 mb-2">AI Evaluation Panel</h3>
                    <p className="text-sm text-white/30">Start chatting to see live analysis</p>
                </motion.div>
            </div>
        );
    }

    // Calculate progress
    const totalQuestions = 12; // Approximate total for business path
    const answeredCount = Object.keys(agentState.answers).length;
    const progressPercent = Math.min((answeredCount / totalQuestions) * 100, 100);

    // Get sorted scores
    const sortedScores = Object.entries(agentState.scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5

    const topEntity = sortedScores[0];
    const maxScore = topEntity ? topEntity[1] : 0;

    // Get answered questions
    const answeredQuestions = Object.entries(agentState.answers).map(([qId, optionId]) => {
        const question = QUESTIONS[qId];
        const option = question?.options.find(o => o.id === optionId);
        return {
            questionId: qId,
            questionText: question?.text || qId,
            answerText: option?.text || optionId,
        };
    });

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-[#0f0f12] to-[#09090b] p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
                    <p className="text-xs text-white/40">Real-time evaluation</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-white/50 mb-2">
                    <span>Progress</span>
                    <span>{answeredCount} questions answered</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Entity Scores - Live Leaderboard */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-medium text-white/70">Entity Scores</h3>
                </div>
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {sortedScores.map(([entity, score], index) => (
                            <motion.div
                                key={entity}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative p-3 rounded-lg ${index === 0
                                        ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
                                        : "bg-white/[0.02]"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{ENTITY_ICONS[entity] || "📋"}</span>
                                        <span className={`text-sm ${index === 0 ? "text-white font-medium" : "text-white/60"}`}>
                                            {entity}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-mono ${index === 0 ? "text-emerald-400" : "text-white/40"}`}>
                                        {score}
                                    </span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${index === 0 ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-white/20"}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: maxScore > 0 ? `${(score / maxScore) * 100}%` : "0%" }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    />
                                </div>
                                {index === 0 && score > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                                    >
                                        <span className="text-[10px]">👑</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Answers Summary */}
            {answeredQuestions.length > 0 && (
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-medium text-white/70">Your Profile</h3>
                    </div>
                    <div className="space-y-2">
                        <AnimatePresence>
                            {answeredQuestions.slice(-5).map((ans, index) => (
                                <motion.div
                                    key={ans.questionId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-3 bg-white/[0.02] rounded-lg border border-white/5"
                                >
                                    <p className="text-xs text-white/40 mb-1 truncate">{ans.questionText}</p>
                                    <p className="text-sm text-white/80 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        {ans.answerText}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Final Recommendation Teaser */}
            {agentState.isComplete && agentState.recommendedEntity && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl border border-emerald-500/30"
                >
                    <div className="flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-emerald-400" />
                        <div>
                            <p className="text-xs text-emerald-300/70">Recommended Entity</p>
                            <p className="text-lg font-semibold text-white">{agentState.recommendedEntity}</p>
                        </div>
                    </div>
                    {agentState.confidenceScore && (
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${agentState.confidenceScore}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <span className="text-sm font-mono text-emerald-400">{agentState.confidenceScore}%</span>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
