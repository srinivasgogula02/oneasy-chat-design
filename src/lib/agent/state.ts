/**
 * Agent State Management
 * Handles state initialization, updates, and persistence
 */

import { nanoid } from 'nanoid';
import { AgentState, Message, BusinessFactor, EntityHypothesis } from './types';
import { EntityType, INITIAL_SCORES } from '../legal-agent/types';

/**
 * Initialize a new agent state for a session
 */
export function initializeAgentState(): AgentState {
    const sessionId = nanoid();
    const now = new Date();

    return {
        sessionId,
        conversationHistory: [],
        gatheredFactors: [],
        currentHypotheses: initializeHypotheses(),
        nextAction: 'question',
        iterationCount: 0,
        startTime: now,
        lastUpdateTime: now,
    };
}

/**
 * Initialize hypotheses for all entities with uniform prior
 */
function initializeHypotheses(): EntityHypothesis[] {
    const entities: EntityType[] = [
        'Private Limited Company',
        'LLP',
        'OPC',
        'Partnership Firm',
        'Sole Proprietorship',
        'Public Limited Company',
        'Section 8 Company',
        'Trust',
        'Society',
    ];

    // Uniform prior: 1/N for each entity
    const uniformPrior = 1 / entities.length;

    return entities.map(entity => ({
        entity,
        confidence: uniformPrior,
        supportingFactors: [],
        contradictingFactors: [],
        missingInformation: [],
    }));
}

/**
 * Add a message to conversation history
 */
export function addMessage(
    state: AgentState,
    role: Message['role'],
    content: string
): AgentState {
    return {
        ...state,
        conversationHistory: [
            ...state.conversationHistory,
            {
                role,
                content,
                timestamp: new Date(),
            },
        ],
        lastUpdateTime: new Date(),
    };
}

/**
 * Add a gathered business factor
 */
export function addFactor(
    state: AgentState,
    factor: BusinessFactor
): AgentState {
    return {
        ...state,
        gatheredFactors: [...state.gatheredFactors, factor],
        lastUpdateTime: new Date(),
    };
}

/**
 * Update entity hypotheses with new confidence scores
 */
export function updateHypotheses(
    state: AgentState,
    updatedHypotheses: EntityHypothesis[]
): AgentState {
    return {
        ...state,
        currentHypotheses: updatedHypotheses,
        lastUpdateTime: new Date(),
    };
}

/**
 * Update next action
 */
export function setNextAction(
    state: AgentState,
    action: AgentState['nextAction']
): AgentState {
    return {
        ...state,
        nextAction: action,
        lastUpdateTime: new Date(),
    };
}

/**
 * Increment iteration count
 */
export function incrementIteration(state: AgentState): AgentState {
    return {
        ...state,
        iterationCount: state.iterationCount + 1,
        lastUpdateTime: new Date(),
    };
}

/**
 * Get top N hypotheses by confidence
 */
export function getTopHypotheses(
    state: AgentState,
    n: number = 3
): EntityHypothesis[] {
    return [...state.currentHypotheses]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, n);
}

/**
 * Check if agent should terminate (high confidence reached)
 */
export function shouldTerminate(
    state: AgentState,
    confidenceThreshold: number = 0.75,
    maxIterations: number = 10
): boolean {
    const topHypothesis = getTopHypotheses(state, 1)[0];

    return (
        topHypothesis.confidence >= confidenceThreshold ||
        state.iterationCount >= maxIterations
    );
}

/**
 * Serialize state for storage (future: database persistence)
 */
export function serializeState(state: AgentState): string {
    return JSON.stringify(state);
}

/**
 * Deserialize state from storage
 */
export function deserializeState(serialized: string): AgentState {
    const parsed = JSON.parse(serialized);

    // Convert date strings back to Date objects
    return {
        ...parsed,
        startTime: new Date(parsed.startTime),
        lastUpdateTime: new Date(parsed.lastUpdateTime),
        conversationHistory: parsed.conversationHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
        })),
    };
}
