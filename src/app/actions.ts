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

    console.log('[DEBUG] toLegacyState - Gathered factors count:', agentState.gatheredFactors.length);
    console.log('[DEBUG] toLegacyState - Top scores:', scores);

    // **FIX: Build answers object from gathered factors**
    // Map factors to simulated question IDs so UI can track progress
    const answers: Record<string, string> = {};

    agentState.gatheredFactors.forEach((factor) => {
        // Map factor types to question-like keys
        if (factor.type === 'other' && factor.value === 'business') {
            answers['Q1_business_type'] = 'for-profit';
        } else if (factor.type === 'other' && factor.value === 'charity') {
            answers['Q1_business_type'] = 'non-profit';
        } else if (factor.type === 'founders') {
            answers['Q2_founders'] = factor.value;
        } else if (factor.type === 'nri') {
            answers['Q3_nri'] = factor.value;
        } else if (factor.type === 'investment') {
            answers['Q4_funding'] = factor.value;
        } else if (factor.type === 'risk') {
            answers['Q5_liability'] = factor.value;
        } else if (factor.type === 'expansion') {
            answers['Q6_expansion'] = factor.value;
        } else if (factor.type === 'directors') {
            answers['Q7_structure'] = factor.value;
        } else {
            // Generic fallback for other factors
            answers[`factor_${factor.type}`] = factor.value;
        }
    });

    return {
        currentQuestionId: agentState.nextAction === 'complete' ? 'COMPLETE' : 'AGENTIC',
        scores,
        answers, // Now properly populated!
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

    if (legacyState?.history) {
        agenticState = initializeAgentState();
        agenticState.conversationHistory = legacyState.history.map((m: any) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(),
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

// ========== LEGAL ENTITY SUGGESTOR V2 ==========
// AI-driven agent with Chain-of-Thought reasoning

import {
    processLegalAgentMessage,
    formatRecommendation,
    initializeLegalAgentState,
    updateAgentState,
    type AgentState as V2AgentState,
    type UserProfile,
    type Message as V2Message,
} from '@/lib/legal-agent-v2';

// In-memory state storage (would use Redis/DB in production)
const agentSessions = new Map<string, V2AgentState>();

/**
 * Process message with Legal Entity Suggestor V2 Agent
 * Uses LLM-driven reasoning instead of deterministic scoring
 */
export async function processLegalAgentV2Message(
    message: string,
    sessionId: string
) {
    try {
        // Input validation
        const validation = validateInput(message);
        if (!validation.valid) {
            return {
                response: validation.error || "Invalid input",
                error: true,
            };
        }

        const sanitizedMessage = sanitizeInput(message);

        // Initialize or retrieve session state
        let state = agentSessions.get(sessionId);
        if (!state) {
            state = initializeLegalAgentState(sessionId);
            agentSessions.set(sessionId, state);
        }

        // Prepare messages for LLM
        const messages: V2Message[] = [
            ...state.conversationHistory,
            { role: 'user', content: sanitizedMessage },
        ];

        console.log(`[V2 Action] Processing message for session ${sessionId}`);
        console.log('[V2 Action] User Input:', sanitizedMessage);
        console.log('[V2 Action] Current Profile:', JSON.stringify(state.profile, null, 2));

        // Process with AI agent
        const llmResponse = await processLegalAgentMessage(
            messages,
            state.profile
        );

        // Update state
        const updatedState = updateAgentState(state, sanitizedMessage, llmResponse);
        agentSessions.set(sessionId, updatedState);

        // Format response
        // Format response
        let response = llmResponse.next_action === 'ask_question'
            ? (llmResponse.question || 'How can I help you?')
            : formatRecommendation(llmResponse.recommendation);

        // If recommendation is made, append a follow-up prompt
        if (llmResponse.next_action === 'recommend') {
            response += '\n\n💬 **Have questions?** Feel free to ask me anything about this recommendation, alternatives, or compliance requirements!';
        }

        console.log('[V2 Action] Final Response:', response);
        console.log('[V2 Action] Updated Profile:', JSON.stringify(updatedState.profile, null, 2));

        return {
            response,
            profile: updatedState.profile,
            isComplete: false, // Always keep conversation open for follow-up questions
            thoughtProcess: llmResponse.thought_process,
            recommendation: updatedState.finalRecommendation,
        };

    } catch (error: any) {
        console.error('[V2 Agent Error] Detailed Trace:', error);
        return {
            response: "I encountered an error. Let me try to help you differently. Could you tell me more about your business?",
            error: true,
        };
    }
}

/**
 * Reset V2 agent session
 */
export async function resetLegalAgentV2Session(sessionId: string) {
    agentSessions.delete(sessionId);
    return {
        success: true,
        newState: initializeLegalAgentState(sessionId),
    };
}

/**
 * Get V2 agent session state
 */
export async function getLegalAgentV2State(sessionId: string) {
    const state = agentSessions.get(sessionId);
    return state || null;
}

