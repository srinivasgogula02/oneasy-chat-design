/**
 * Agent Tools for Scoring, Analysis, and Validation
 */

import { z } from 'zod';
import { tool } from 'ai';
import { AgentState, BusinessFactor } from '../types';
import { updateConfidenceScores, applyConstraints } from '../scoring';
import { extractFactorsFromAnswer } from '../question-generator';
import { getTopHypotheses } from '../state';

/**
 * Tool: Update Entity Scores
 * Runs Bayesian inference and constraint validation
 */
export const updateScoresTool = tool({
    description: 'Update confidence scores for legal entities based on new information from the user',
    parameters: z.object({
        userAnswer: z.string().describe('The user\'s latest answer'),
        questionContext: z.string().describe('The question that was asked'),
    }),
    execute: async ({ userAnswer, questionContext }, { state }: { state: AgentState }) => {
        // Extract factors from answer
        const newFactors = extractFactorsFromAnswer(userAnswer, questionContext);

        if (newFactors.length === 0) {
            return {
                success: false,
                message: 'No factors extracted from answer',
                factorsFound: 0,
            };
        }

        // Update confidences with Bayesian inference
        let updatedHypotheses = state.currentHypotheses;
        for (const factor of newFactors) {
            updatedHypotheses = updateConfidenceScores(
                { ...state, currentHypotheses: updatedHypotheses },
                factor
            );
        }

        // Apply hard constraints
        updatedHypotheses = applyConstraints(updatedHypotheses, [
            ...state.gatheredFactors,
            ...newFactors,
        ]);

        const topHypotheses = [...updatedHypotheses]
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3);

        return {
            success: true,
            message: 'Scores updated successfully',
            factorsFound: newFactors.length,
            factors: newFactors.map(f => ({ type: f.type, value: f.value, impact: f.impact })),
            topEntities: topHypotheses.map(h => ({
                entity: h.entity,
                confidence: (h.confidence * 100).toFixed(1) + '%',
            })),
            updatedHypotheses, // Return for state update
        };
    },
});

/**
 * Tool: Analyze Information Gaps
 * Identifies what we still need to know
 */
export const analyzeGapsTool = tool({
    description: 'Analyze what information is still missing to make a confident recommendation',
    parameters: z.object({
        currentConfidence: z.number().describe('Current top hypothesis confidence (0-1)'),
    }),
    execute: async ({ currentConfidence }, { state }: { state: AgentState }) => {
        const { identifyInformationGaps } = await import('../question-generator');
        const gaps = identifyInformationGaps(state);

        const topGaps = gaps.slice(0, 3);

        return {
            success: true,
            missingFactors: topGaps.length,
            topGaps: topGaps.map(g => ({
                category: g.category,
                importance: g.importance,
                differentiates: g.relatedEntities,
            })),
            shouldAskMore: currentConfidence < 0.75 && topGaps.length > 0,
            recommendation: currentConfidence >= 0.75
                ? 'Confidence high enough to recommend'
                : `Ask about: ${topGaps[0]?.category}`,
        };
    },
});

/**
 * Tool: Validate Recommendation
 * Checks if current top entity is valid and explains why
 */
export const validateRecommendationTool = tool({
    description: 'Validate that the top recommendation meets all constraints and explain reasoning',
    parameters: z.object({
        entity: z.string().describe('The entity to validate'),
    }),
    execute: async ({ entity }, { state }: { state: AgentState }) => {
        const hypothesis = state.currentHypotheses.find(h => h.entity === entity);

        if (!hypothesis) {
            return {
                success: false,
                message: 'Entity not found in hypotheses',
            };
        }

        const { getEntityRule } = await import('../knowledge');
        const rule = getEntityRule(entity as any);

        // Check if any hard constraints are violated
        const violations: string[] = [];
        for (const constraint of rule.hardConstraints) {
            if (constraint.type === 'hard_gate' && constraint.effect === 'eliminate') {
                // Simple check - in production would use expression evaluator
                const violated = constraint.condition.includes('nri') &&
                    state.gatheredFactors.some(f => f.type === 'nri' && f.impact > 0);

                if (violated) {
                    violations.push(constraint.condition);
                }
            }
        }

        return {
            success: violations.length === 0,
            entity,
            confidence: (hypothesis.confidence * 100).toFixed(1) + '%',
            isValid: violations.length === 0,
            violations,
            supportingFactors: hypothesis.supportingFactors,
            contradictingFactors: hypothesis.contradictingFactors,
            recommendation: violations.length === 0
                ? `${entity} is valid and appropriate`
                : `${entity} violates constraints: ${violations.join(', ')}`,
        };
    },
});

/**
 * Tool: Explain Reasoning
 * Generates explanation for why a specific entity was recommended
 */
export const explainReasoningTool = tool({
    description: 'Generate a detailed explanation of why an entity was recommended',
    parameters: z.object({
        entity: z.string().describe('The entity to explain'),
    }),
    execute: async ({ entity }, { state }: { state: AgentState }) => {
        const hypothesis = state.currentHypotheses.find(h => h.entity === entity);

        if (!hypothesis) {
            return {
                success: false,
                message: 'Entity not found',
            };
        }

        // Analyze which factors contributed most
        const { getEntityRule } = await import('../knowledge');
        const rule = getEntityRule(entity as any);

        const contributingFactors = state.gatheredFactors
            .filter(f => rule.scoringWeights[f.type] && f.impact > 0)
            .sort((a, b) => {
                const weightA = rule.scoringWeights[a.type] || 0;
                const weightB = rule.scoringWeights[b.type] || 0;
                return (b.impact * weightB) - (a.impact * weightA);
            })
            .slice(0, 3);

        return {
            success: true,
            entity,
            confidence: (hypothesis.confidence * 100).toFixed(1) + '%',
            topReasons: contributingFactors.map(f => ({
                factor: f.type,
                value: f.value,
                weight: rule.scoringWeights[f.type],
                impact: f.impact,
            })),
            explanation: `${entity} was recommended because: ${contributingFactors.map(f => f.value).join(', ')}`,
        };
    },
});

/**
 * All available tools
 */
export const agentTools = {
    update_scores: updateScoresTool,
    analyze_gaps: analyzeGapsTool,
    validate_recommendation: validateRecommendationTool,
    explain_reasoning: explainReasoningTool,
};
