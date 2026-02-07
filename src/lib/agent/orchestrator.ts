/**
 * Agent Orchestrator
 * Manages the ReAct loop and coordinates agent execution
 */

import pRetry from 'p-retry';
import {
    AgentState,
    AgentResponse,
    FinalRecommendation,
} from './types';
import {
    initializeAgentState,
    addMessage,
    setNextAction,
    incrementIteration,
    shouldTerminate,
} from './state';
import { think, act, observe, reflect } from './core';
import { logger } from './logger';

/**
 * Main orchestrator class for the agent
 */
export class AgentOrchestrator {
    private maxIterations: number;
    private confidenceThreshold: number;

    constructor(
        maxIterations: number = 10,
        confidenceThreshold: number = 0.75
    ) {
        this.maxIterations = maxIterations;
        this.confidenceThreshold = confidenceThreshold;
    }

    /**
     * Process a single user message through the agent
     */
    async processMessage(
        userInput: string,
        currentState?: AgentState
    ): Promise<AgentResponse> {
        let state = currentState || initializeAgentState();

        // Add user message to history
        state = addMessage(state, 'user', userInput);

        try {
            // Execute one iteration of the ReAct loop
            const result = await this.executeIteration(state);

            return {
                message: result.message,
                state: result.state,
            };
        } catch (error: any) {
            logger.error(state.sessionId, {
                error: error.message,
                stack: error.stack,
            });

            return {
                message: "I encountered an error. Let me try to help you differently.",
                state,
            };
        }
    }

    /**
     * Execute one iteration of the ReAct loop
     */
    private async executeIteration(state: AgentState): Promise<AgentResponse> {
        const sessionId = state.sessionId;

        // Increment iteration counter
        state = incrementIteration(state);

        // THINK: Analyze and decide next action
        const thought = await this.withRetry(() => think(state), sessionId);

        // Check if we should terminate
        if (
            thought.action === 'make_recommendation' ||
            shouldTerminate(state, this.confidenceThreshold, this.maxIterations)
        ) {
            return await this.finalizeRecommendation(state);
        }

        // ACT: Execute the planned action
        const action = await act(state, thought);

        // OBSERVE: Process the result
        const observation = await this.withRetry(
            () => observe(state, action),
            sessionId
        );

        // REFLECT: Assess progress
        const reflection = await reflect(state);

        // Update state based on reflection
        if (!reflection.shouldContinue) {
            return await this.finalizeRecommendation(state);
        }

        // Extract message from observation
        const message =
            typeof observation.data === 'string'
                ? observation.data
                : 'How can I help you further?';

        state = addMessage(state, 'assistant', message);
        state = setNextAction(state, 'question');

        return {
            message,
            state,
            debugInfo: {
                thought,
                action,
                observation,
            },
        };
    }

    /**
     * Finalize and return recommendation
     */
    private async finalizeRecommendation(
        state: AgentState
    ): Promise<AgentResponse> {
        const action = { type: 'recommend' as const, parameters: {} };
        const observation = await observe(state, action);
        const recommendation = observation.data as FinalRecommendation;

        logger.recommendation(state.sessionId, recommendation);

        const message = await this.formatRecommendation(recommendation);
        state = addMessage(state, 'assistant', message);
        state = setNextAction(state, 'complete');

        return {
            message,
            state,
        };
    }

    /**
     * Format final recommendation as a user-friendly message
     */
    private async formatRecommendation(
        rec: FinalRecommendation
    ): Promise<string> {
        const confidencePercent = (rec.confidence * 100).toFixed(0);

        let message = `🎯 **Recommended: ${rec.entity}** (${confidencePercent}% confidence)\n\n`;

        if (rec.reasoning.length > 0) {
            message += `**Why this fits you:**\n`;
            rec.reasoning.slice(0, 3).forEach(reason => {
                message += `- ${reason}\n`;
            });
            message += '\n';
        }

        if (rec.alternatives.length > 0) {
            message += `**Close alternatives:**\n`;
            rec.alternatives.forEach(alt => {
                message += `- ${alt.entity}: ${(alt.confidence * 100).toFixed(0)}% - ${alt.reason}\n`;
            });
            message += '\n';
        }

        if (rec.caveats) {
            message += `**Note:**\n`;
            rec.caveats.forEach(caveat => {
                message += `- ${caveat}\n`;
            });
        }

        return message;
    }

    /**
     * Execute function with retry logic
     */
    private async withRetry<T>(
        fn: () => Promise<T>,
        sessionId: string
    ): Promise<T> {
        return pRetry(fn, {
            retries: 3,
            factor: 2,
            minTimeout: 1000,
            onFailedAttempt: (error) => {
                logger.error(sessionId, {
                    message: 'Retry attempt failed',
                    attempt: error.attemptNumber,
                    retriesLeft: error.retriesLeft,
                });
            },
        });
    }
}

/**
 * Create a new orchestrator instance
 */
export function createOrchestrator(
    maxIterations: number = 10,
    confidenceThreshold: number = 0.75
): AgentOrchestrator {
    return new AgentOrchestrator(maxIterations, confidenceThreshold);
}
