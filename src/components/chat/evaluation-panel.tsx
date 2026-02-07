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

const SHORT_NAMES: Record<string, string> = {
    "Private Limited Company": "Pvt Ltd",
    "Sole Proprietorship": "Sole Prop",
    "Public Limited Company": "Public Ltd",
    "Section 8 Company": "Section 8",
    "Partnership Firm": "Partnership",
    "Trust": "Trust",
    "Society": "Society",
    "LLP": "LLP",
    "OPC": "OPC",
};

export function EvaluationPanel({ agentState }: EvaluationPanelProps) {
    if (!agentState) {
        return (
            <div className="h-full flex flex-col justify-center p-6 bg-slate-50/50">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                        <Brain className="w-8 h-8 text-[#01334c]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#01334c] mb-2">AI Analysis Ready</h3>
                    <p className="text-sm text-slate-500 max-w-[200px] mx-auto">
                        I'm ready to evaluate your business needs across key factors:
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Scalability</p>
                            <p className="text-xs text-slate-400">Future growth potential</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Compliance</p>
                            <p className="text-xs text-slate-400">Legal requirements load</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Liability</p>
                            <p className="text-xs text-slate-400">Personal asset protection</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs font-medium text-[#01334c] animate-pulse bg-[#01334c]/5 py-2 px-4 rounded-full inline-block">
                        Waiting for your input...
                    </p>
                </div>
            </div>
        );
    }

    // Calculate progress
    const totalQuestions = 12; // Approximate total for business path
    const answeredCount = Object.keys(agentState.answers).length;
    const progressPercent = Math.min((answeredCount / totalQuestions) * 100, 100);

    // Get sorted scores - only show entities with positive scores
    const sortedScores = Object.entries(agentState.scores)
        .filter(([, score]) => score > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5

    // Prepare chart data
    const chartData = sortedScores.map(([entity, score]) => ({
        label: SHORT_NAMES[entity] || entity,
        value: score,
    }));

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
        <div className="h-full flex flex-col bg-slate-50 border-l border-slate-200/60 p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#01334c]/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#01334c]" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-[#01334c]">AI Analysis</h2>
                    <p className="text-xs text-slate-500">Real-time evaluation</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>Progress</span>
                    <span>{answeredCount} questions answered</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#01334c] to-cyan-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Entity Scores */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#01334c]" />
                    <h3 className="text-sm font-medium text-slate-600">Entity Analysis</h3>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm space-y-3">
                    {chartData.length > 0 ? (
                        <>
                            {chartData.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm ${i === 0 ? 'text-[#01334c] font-medium' : 'text-slate-600'}`}>
                                            {i === 0 && <span className="mr-1">👑</span>}
                                            {item.label}
                                        </span>
                                        <span className={`text-xs font-mono ${i === 0 ? 'text-[#01334c]' : 'text-slate-400'}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-r from-[#01334c] to-cyan-600' : 'bg-slate-300'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.value / 10) * 100}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.1 }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {/* Leading Entity Badge */}
                            {chartData[0].value > 0 && (
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
                                    <span className="text-xs text-slate-500">Recommended:</span>
                                    <span className="text-sm font-semibold text-[#01334c]">{chartData[0].label}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-8 text-center text-slate-400 text-sm">
                            Chat more to generate analysis...
                        </div>
                    )}
                </div>
            </div>

            {/* Answers Summary */}
            {answeredQuestions.length > 0 && (
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                        <h3 className="text-sm font-medium text-slate-600">Your Profile</h3>
                    </div>
                    <div className="space-y-2">
                        <AnimatePresence>
                            {answeredQuestions.slice(-5).map((ans, index) => (
                                <motion.div
                                    key={ans.questionId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-3 bg-white rounded-lg border border-slate-200/60 shadow-sm"
                                >
                                    <p className="text-xs text-slate-400 mb-1 truncate">{ans.questionText}</p>
                                    <p className="text-sm text-[#01334c] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
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
                    className="mt-6 p-4 bg-gradient-to-br from-[#01334c]/5 to-cyan-500/10 rounded-xl border border-[#01334c]/20"
                >
                    <div className="flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-[#01334c]" />
                        <div>
                            <p className="text-xs text-slate-500">Recommended Entity</p>
                            <p className="text-lg font-semibold text-[#01334c]">{agentState.recommendedEntity}</p>
                        </div>
                    </div>
                    {agentState.confidenceScore && (
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#01334c] to-cyan-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${agentState.confidenceScore}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <span className="text-sm font-mono text-[#01334c]">{agentState.confidenceScore}%</span>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
