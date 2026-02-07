/**
 * Agent Guardrails
 * Safety mechanisms to prevent runaway execution, excessive costs, and dangerous behavior
 */

import { AgentState } from './types';
import { logger } from './logger';

/**
 * Guardrail configuration
 */
export interface GuardrailConfig {
    maxIterations: number;
    maxTokensPerSession: number;
    maxCostPerSession: number; // in USD
    requireHumanApprovalThreshold: number; // confidence threshold
    maxToolCallsPerIteration: number;
    timeoutMs: number;
}

/**
 * Default production guardrails
 */
export const DEFAULT_GUARDRAILS: GuardrailConfig = {
    maxIterations: 10,
    maxTokensPerSession: 10000,
    maxCostPerSession: 0.50, // $0.50 per session
    requireHumanApprovalThreshold: 0.60, // Require approval if confidence < 60%
    maxToolCallsPerIteration: 5,
    timeoutMs: 30000, // 30 seconds
};

/**
 * Session metrics for tracking
 */
export interface SessionMetrics {
    iterations: number;
    tokensUsed: number;
    costAccumulated: number;
    toolCallsMade: number;
    startTime: Date;
    llmCalls: number;
}

/**
 * Guardrail violation types
 */
export type GuardrailViolation =
    | 'max_iterations'
    | 'max_tokens'
    | 'max_cost'
    | 'max_tools'
    | 'timeout'
    | 'low_confidence';

/**
 * Check if any guardrails are violated
 */
export function checkGuardrails(
    state: AgentState,
    metrics: SessionMetrics,
    config: GuardrailConfig = DEFAULT_GUARDRAILS
): { violated: boolean; type?: GuardrailViolation; message?: string } {
    // Check iteration limit
    if (state.iterationCount >= config.maxIterations) {
        return {
            violated: true,
            type: 'max_iterations',
            message: `Maximum iterations (${config.maxIterations}) reached`,
        };
    }

    // Check token limit
    if (metrics.tokensUsed >= config.maxTokensPerSession) {
        return {
            violated: true,
            type: 'max_tokens',
            message: `Token limit (${config.maxTokensPerSession}) exceeded`,
        };
    }

    // Check cost limit
    if (metrics.costAccumulated >= config.maxCostPerSession) {
        return {
            violated: true,
            type: 'max_cost',
            message: `Cost limit ($${config.maxCostPerSession}) exceeded`,
        };
    }

    // Check timeout
    const elapsedMs = Date.now() - metrics.startTime.getTime();
    if (elapsedMs >= config.timeoutMs) {
        return {
            violated: true,
            type: 'timeout',
            message: `Session timeout (${config.timeoutMs}ms) reached`,
        };
    }

    return { violated: false };
}

/**
 * Check if human approval is required
 */
export function requiresHumanApproval(
    state: AgentState,
    config: GuardrailConfig = DEFAULT_GUARDRAILS
): { required: boolean; reason?: string } {
    const topHypothesis = state.currentHypotheses
        .sort((a, b) => b.confidence - a.confidence)[0];

    if (!topHypothesis) {
        return { required: true, reason: 'No hypotheses available' };
    }

    // Low confidence check
    if (topHypothesis.confidence < config.requireHumanApprovalThreshold) {
        return {
            required: true,
            reason: `Low confidence (${(topHypothesis.confidence * 100).toFixed(1)}% < ${config.requireHumanApprovalThreshold * 100}%)`,
        };
    }

    // Check for constraint violations
    if (topHypothesis.contradictingFactors.length > 0) {
        return {
            required: true,
            reason: `Contradicting factors detected: ${topHypothesis.contradictingFactors.join(', ')}`,
        };
    }

    return { required: false };
}

/**
 * Create safe termination response
 */
export function createSafeTermination(
    violation: GuardrailViolation,
    message: string,
    state: AgentState
): string {
    const topHypothesis = state.currentHypotheses
        .sort((a, b) => b.confidence - a.confidence)[0];

    logger.error(state.sessionId, {
        event: 'guardrail_violation',
        type: violation,
        message,
    });

    switch (violation) {
        case 'max_iterations':
            return `I've reached my analysis limit. Based on what we've discussed, **${topHypothesis.entity}** seems most suitable (${(topHypothesis.confidence * 100).toFixed(0)}% confidence). However, I recommend consulting with a legal expert for confirmation.`;

        case 'max_cost':
        case 'max_tokens':
            return `I need to wrap up our conversation due to resource limits. Preliminary recommendation: **${topHypothesis.entity}**. Please consult a professional for final advice.`;

        case 'timeout':
            return `Our session timed out. Based on current information: **${topHypothesis.entity}** appears most suitable. Consider restarting for a more thorough analysis.`;

        case 'low_confidence':
            return `I don't have enough information to make a confident recommendation. The top candidates are: ${state.currentHypotheses.slice(0, 3).map(h => h.entity).join(', ')}. I suggest consulting with a legal professional.`;

        default:
            return `An error occurred. Please consult a legal expert for entity selection.`;
    }
}

/**
 * Initialize session metrics
 */
export function initializeMetrics(): SessionMetrics {
    return {
        iterations: 0,
        tokensUsed: 0,
        costAccumulated: 0,
        toolCallsMade: 0,
        startTime: new Date(),
        llmCalls: 0,
    };
}

/**
 * Update metrics after LLM call
 */
export function updateMetrics(
    metrics: SessionMetrics,
    tokensUsed: number,
    cost: number
): SessionMetrics {
    return {
        ...metrics,
        tokensUsed: metrics.tokensUsed + tokensUsed,
        costAccumulated: metrics.costAccumulated + cost,
        llmCalls: metrics.llmCalls + 1,
    };
}

/**
 * Estimate cost from tokens (rough approximation)
 */
export function estimateCost(tokens: number, model: string = 'llama-3.3-70b'): number {
    // Groq pricing (approximate, as of 2024)
    const costPerMillionTokens = {
        'llama-3.3-70b-versatile': 0.59, // Input
        'gpt-4o': 2.50, // OpenAI
        'gpt-4o-mini': 0.15,
    };

    const rate = costPerMillionTokens[model as keyof typeof costPerMillionTokens] || 0.59;
    return (tokens / 1_000_000) * rate;
}
