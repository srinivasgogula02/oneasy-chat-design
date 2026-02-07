/**
 * Agentic Actions - Server-side chat processing with autonomous agent
 * Replaces deterministic state machine with ReAct pattern orchestrator
 */
"use server";

import { createOrchestrator } from "@/lib/agent/orchestrator";
import { initializeAgentState, addMessage, getTopHypotheses } from "@/lib/agent/state";
import type { AgentState as NewAgentState } from "@/lib/agent/types";
import type { AgentState as LegacyState } from "@/lib/legal-agent/types";
import {
    checkGuardrails,
    requiresHumanApproval,
    initializeMetrics,
    DEFAULT_GUARDRAILS,
    type SessionMetrics,
} from "@/lib/agent/guardrails";
import { costTracker } from "@/lib/agent/monitoring";
import { logger } from "@/lib/agent/logger";

// Input validation
const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;

function sanitizeInput(input: string): string {
    return input
        .trim()
        .slice(0, MAX_MESSAGE_LENGTH)
        .replace(/<[^>]*>/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function validateInput(message: string): { valid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Invalid message format' };
    }
    if (message.trim().length < MIN_MESSAGE_LENGTH) {
        return { valid: false, error: 'Message is too short' };
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
        return { valid: false, error: 'Message is too long' };
    }
    return { valid: true };
}

// Session metrics storage (in-memory, would use Redis in production)
const sessionMetrics = new Map<string, SessionMetrics>();

/**
 * Convert new agent state to legacy UI format
 */
function toLegacyState(agentState: NewAgentState): LegacyState {
    const topHypotheses = getTopHypotheses(agentState, 9);

    // Convert hypotheses to scores (0-300 range for UI compatibility)
    const scores: Record<string, number> = {};
    topHypotheses.forEach(h => {
        scores[h.entity] = Math.round(h.confidence * 300);
    });

    return {
        currentQuestionId: agentState.nextAction === 'complete' ? 'COMPLETE' : 'AGENTIC',
        scores,
        answers: {},
        history: agentState.conversationHistory.map(m => ({
            role: m.role,
            content: m.content,
        })),
        isBlocked: false,
        isComplete: agentState.nextAction === 'complete',
    };
}

/**
 * Main message processing with agentic orchestrator
 */
export async function processAgenticMessage(
    message: string,
    currentState: NewAgentState | null
) {
    try {
        // Input validation
        const validation = validateInput(message);
        if (!validation.valid) {
            return {
                response: validation.error || "Invalid input",
                newState: currentState || initializeAgentState(),
            };
        }

        const sanitizedMessage = sanitizeInput(message);

        // Initialize state if needed
        let state = currentState || initializeAgentState();

        // Initialize metrics tracking
        if (!sessionMetrics.has(state.sessionId)) {
            sessionMetrics.set(state.sessionId, initializeMetrics());
            costTracker.initSession(state.sessionId);
        }

        const metrics = sessionMetrics.get(state.sessionId)!;

        // Check guardrails BEFORE processing
        const guardCheck = checkGuardrails(state, metrics, DEFAULT_GUARDRAILS);
        if (guardCheck.violated && guardCheck.type && guardCheck.message) {
            const { createSafeTermination } = await import("@/lib/agent/guardrails");
            const termination = createSafeTermination(guardCheck.type, guardCheck.message, state);

            return {
                response: termination,
                newState: state,
                terminated: true,
            };
        }

        // Create orchestrator
        const orchestrator = createOrchestrator(
            DEFAULT_GUARDRAILS.maxIterations,
            0.75 // confidence threshold
        );

        // Process message through agent
        logger.action(state.sessionId, {
            event: 'user_message',
            message: sanitizedMessage,
        });

        const result = await orchestrator.processMessage(sanitizedMessage, state);

        // Update metrics (rough estimation - in production track actual tokens)
        metrics.iterations++;
        metrics.tokensUsed += sanitizedMessage.length / 4; // Rough token estimate

        // Check if human approval required
        const approval = requiresHumanApproval(result.state);
        if (approval.required && result.state.nextAction === 'complete') {
            return {
                response: result.message + `\n\n⚠️ **Review Recommended**: ${approval.reason}`,
                newState: result.state,
                requiresApproval: true,
            };
        }

        return {
            response: result.message,
            newState: result.state,
        };

    } catch (error: any) {
        logger.error(currentState?.sessionId || 'unknown', {
            event: 'processing_error',
            error: error.message,
        });

        return {
            response: "I encountered an error. Let me try to help you differently. Could you rephrase your question?",
            newState: currentState || initializeAgentState(),
            error: true,
        };
    }
}

/**
 * Legacy compatibility wrapper - converts between old and new state formats
 */
export async function processMessage(
    message: string,
    legacyState: LegacyState | null
) {
    // Convert legacy state to agentic state
    let agenticState: NewAgentState | null = null;

    if (legacyState?.conversationHistory) {
        agenticState = initializeAgentState();
        agenticState.conversationHistory = legacyState.conversationHistory.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));
    }

    // Process with agentic orchestrator  
    const result = await processAgenticMessage(message, agenticState);

    // Convert back to legacy format for UI
    return {
        response: result.response,
        newState: toLegacyState(result.newState),
    };
}

/**
 * Reset session (clear metrics)
 */
export async function resetAgenticSession(sessionId: string) {
    sessionMetrics.delete(sessionId);
    costTracker.clearSession(sessionId);

    return {
        success: true,
        newState: initializeAgentState(),
    };
}

/**
 * Get session statistics
 */
export async function getSessionStats(sessionId: string) {
    const metrics = sessionMetrics.get(sessionId);
    const costs = costTracker.getMetrics(sessionId);

    return {
        metrics,
        costs,
        logs: logger.getSessionLogs(sessionId),
    };
}
