import { AgentState, EntityType } from './types';
import { QUESTIONS } from './data';

interface Pivot {
    questionText: string;
    altOptionText: string;
    diff: number;
}

interface AnalysisResult {
    winnerReasoning: string[];
    alternatives: {
        entity: EntityType;
        scoreDiff: number;
        reason: string;
    }[];
}

export function analyzeRecommendation(state: AgentState): AnalysisResult {
    const winner = state.recommendedEntity;
    if (!winner) return { winnerReasoning: [], alternatives: [] };

    // 1. Analyze Winner
    const winnerPositiveImpacts: { text: string; score: number }[] = [];

    Object.entries(state.answers).forEach(([qId, optId]) => {
        const question = QUESTIONS[qId];
        const option = question?.options.find(o => o.id === optId);

        if (option) {
            const impact = option.impacts.find(i => i.entity === winner);
            if (impact && impact.score > 0) {
                winnerPositiveImpacts.push({
                    text: `you chose "${option.text}"`,
                    score: impact.score
                });
            }
        }
    });

    // Sort by score impact desc
    const topReasons = winnerPositiveImpacts
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(r => r.text);


    // 2. Analyze Alternatives (Runner-ups)
    const sortedEntities = (Object.entries(state.scores) as [EntityType, number][])
        .sort((a, b) => b[1] - a[1])
        .filter(([e]) => e !== winner); // Exclude winner

    const runnerUps = sortedEntities.slice(0, 2); // Top 2 runner ups

    const alternatives = runnerUps.map(([altEntity, altScore]) => {
        // Find pivot point: Where did we lose points relative to this entity?
        // OR where did we miss a big gain for this entity?

        let bestPivot: Pivot | null = null;
        let maxImpact = 0;

        Object.entries(state.answers).forEach(([qId, userOptId]) => {
            const question = QUESTIONS[qId];
            if (!question) return;

            // Check if another option would have been better for this altEntity
            question.options.forEach(opt => {
                if (opt.id === userOptId) return; // Skip what user chose

                // Calculate potential gain
                const userImpact = question.options.find(o => o.id === userOptId)?.impacts.find(i => i.entity === altEntity)?.score || 0;
                const altImpact = opt.impacts.find(i => i.entity === altEntity)?.score || 0;

                const gain = altImpact - userImpact;

                if (gain > maxImpact && gain > 15) { // Only significant pivots
                    maxImpact = gain;
                    bestPivot = {
                        questionText: question.text,
                        altOptionText: opt.text,
                        diff: gain
                    };
                }
            });
        });

        const winnerScore = state.scores[winner] || 0;

        return {
            entity: altEntity,
            scoreDiff: winnerScore - altScore,
            reason: bestPivot
                ? `If you had chosen "${bestPivot.altOptionText}" for "${bestPivot.questionText}", ${altEntity} would have been a stronger match.`
                : `It was a close match, but ${winner} scored slightly higher based on your combined preferences.`
        };
    });

    return {
        winnerReasoning: topReasons,
        alternatives
    };
}
