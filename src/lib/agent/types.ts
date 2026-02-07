/**
 * Core type definitions for the Agentic AI System
 */

import { EntityType } from '../legal-agent/types';

// ========== Agent State Types ==========

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface BusinessFactor {
    type: 'founders' | 'investment' | 'revenue' | 'risk' | 'nri' | 'expansion' | 'directors' | 'other';
    value: string;
    impact: number; // -1 to 1
    confidence: number; // 0 to 1
    source: string; // Which question/interaction revealed this
}

export interface EntityHypothesis {
    entity: EntityType;
    confidence: number; // 0 to 1 (Bayesian posterior)
    supportingFactors: string[];
    contradictingFactors: string[];
    missingInformation: string[];
}

export interface AgentState {
    sessionId: string;
    conversationHistory: Message[];
    gatheredFactors: BusinessFactor[];
    currentHypotheses: EntityHypothesis[];
    nextAction: 'question' | 'clarify' | 'recommend' | 'reflect' | 'complete';
    iterationCount: number;
    startTime: Date;
    lastUpdateTime: Date;
}

// ========== Agent Loop Types ==========

export interface Thought {
    reasoning: string;
    action: 'ask_question' | 'clarify_answer' | 'use_tool' | 'make_recommendation' | 'reflect';
    confidence: number;
    priority: number;
}

export interface Action {
    type: 'generate_question' | 'update_scores' | 'validate_constraints' | 'analyze_gap' | 'recommend';
    parameters: Record<string, any>;
    toolName?: string;
}

export interface Observation {
    success: boolean;
    data: any;
    impact: string;
    updatedFactors?: BusinessFactor[];
}

export interface Reflection {
    progressAssessment: string;
    confidenceLevel: number;
    shouldContinue: boolean;
    strategicAdjustments?: string[];
}

// ========== Knowledge Base Types ==========

export interface EntityRule {
    entity: EntityType;
    requiredFactors: string[];
    prohibitedFactors: string[];
    scoringWeights: Record<string, number>;
    hardConstraints: Constraint[];
}

export interface Constraint {
    type: 'hard_gate' | 'soft_preference';
    condition: string;
    effect: string;
    priority: number;
}

export interface InformationGap {
    category: string;
    question: string;
    importance: number;
    relatedEntities: EntityType[];
}

// ========== Agent Response Types ==========

export interface AgentResponse {
    message: string;
    state: AgentState;
    debugInfo?: {
        thought?: Thought;
        action?: Action;
        observation?: Observation;
    };
}

export interface FinalRecommendation {
    entity: EntityType;
    confidence: number;
    reasoning: string[];
    alternatives: Array<{
        entity: EntityType;
        confidence: number;
        reason: string;
    }>;
    caveats?: string[];
}

// ========== Logging Types ==========

export interface AgentLogEvent {
    sessionId: string;
    timestamp: Date;
    event: 'thought' | 'action' | 'observation' | 'reflection' | 'error' | 'recommendation';
    data: any;
    metadata?: {
        cost?: number;
        latency?: number;
        modelUsed?: string;
    };
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
