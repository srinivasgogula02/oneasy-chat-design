/**
 * Agentic Actions - Server-side chat processing with autonomous agent
 * Replaces deterministic state machine with ReAct pattern orchestrator
 */
"use server";

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

// ========== LEGAL ENTITY SUGGESTOR V2 ==========
// AI-driven agent with Chain-of-Thought reasoning

import {
    processLegalAgentMessage,
    formatRecommendation,
    initializeLegalAgentState,
    updateAgentState,
    type AgentState as V2AgentState,
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

        // Process with AI agent
        const llmResponse = await processLegalAgentMessage(
            messages,
            state.profile
        );

        // Update state
        const updatedState = updateAgentState(state, sanitizedMessage, llmResponse);
        agentSessions.set(sessionId, updatedState);

        // Format response
        let response = llmResponse.next_action === 'ask_question'
            ? (llmResponse.question || 'How can I help you?')
            : formatRecommendation(llmResponse.recommendation);

        // If recommendation is made, append a follow-up prompt
        if (llmResponse.next_action === 'recommend') {
            response += '\n\n💬 **Have questions?** Feel free to ask me anything about this recommendation, alternatives, or compliance requirements!';
        }

        console.log('[V2 Action] Final Response:', response);

        return {
            response,
            updated_profile: updatedState.profile,
            isComplete: false, // Always keep conversation open for follow-up questions
            thoughtProcess: llmResponse.thought_process,
            recommendation: updatedState.finalRecommendation,
            suitability_analysis: llmResponse.suitability_analysis, // Pass AI scores to frontend
        };

    } catch (error: unknown) {
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
