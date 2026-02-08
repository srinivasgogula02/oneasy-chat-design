/**
 * Legal Entity Suggestor V2 - Type Definitions
 * AI-driven agent with structured output using Zod schemas
 */

import { z } from 'zod';
import { EntityType } from '../legal-agent/types';

// ========== User Profile Schema ==========

export const UserProfileSchema = z.object({
    intent: z.enum(['business', 'charity', 'unknown']).default('unknown'),
    funding_needs: z.enum(['vc', 'angel', 'bank_loan', 'bootstrap', 'grants', 'unknown']).default('unknown'),
    founder_count: z.number().nullable().default(null),
    liability_preference: z.enum(['limited', 'unlimited', 'unknown']).default('unknown'),
    nri_status: z.boolean().nullable().default(null),
    business_type: z.string().nullable().default(null), // e.g., "fintech", "professional_services", "ecommerce"
    expansion_plans: z.enum(['franchise', 'multi_branch', 'single_location', 'online', 'unknown']).default('unknown'),
    revenue_target: z.string().nullable().default(null), // e.g., "< 20L", "20L-1Cr", "> 5Cr"
    foreign_involvement: z.boolean().nullable().default(null), // Foreign investors, directors, or clients
    professional_services: z.boolean().nullable().default(null), // CA, Lawyer, Consultant
    exit_plans: z.enum(['sell', 'family', 'personal', 'unknown']).default('unknown'),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ========== Thought Process Schema ==========

export const ThoughtProcessSchema = z.object({
    analysis: z.string().describe('What the AI learned from the user\'s latest message'),
    contradictions: z.array(z.string()).describe('Any conflicts detected in user requirements'),
    missing_critical_factors: z.array(z.string()).describe('Critical information still needed for recommendation'),
    completeness_score: z.number().min(0).max(100).describe('How close we are to making a recommendation (0-100)'),
    current_understanding: z.string().describe('Summary of what we know about the user\'s needs so far'),
});

export type ThoughtProcess = z.infer<typeof ThoughtProcessSchema>;

// ========== Recommendation Output Schema ==========

export const RecommendationOutputSchema = z.object({
    entity: z.string().describe('Recommended legal entity type'),
    confidence: z.number().min(0).max(100).describe('Confidence in this recommendation (0-100)'),
    reasoning: z.array(z.string()).describe('Key reasons for this recommendation, citing specific facts'),
    alternative: z.object({
        entity: z.string(),
        reason: z.string(),
    }).nullable().describe('One alternative option with brief explanation'),
    caveats: z.array(z.string()).describe('Important warnings or considerations for the user'),
});

export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

// ========== LLM Response Schema ==========

export const LLMResponseSchema = z.object({
    thought_process: ThoughtProcessSchema,
    next_action: z.enum(['ask_question', 'recommend']).describe('What to do next'),
    question: z.string().optional().describe('Next question to ask user (if action is ask_question)'),
    follow_up: z.string().optional().describe('Optional clarifying sub-question'),
    recommendation: RecommendationOutputSchema.optional().describe('Final recommendation (if action is recommend)'),
    updated_profile: UserProfileSchema.describe('Updated user profile based on latest information'),
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

// ========== Message Type ==========

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// ========== Agent State ==========

export interface AgentState {
    sessionId: string;
    profile: UserProfile;
    conversationHistory: Message[];
    lastThought?: ThoughtProcess;
    isComplete: boolean;
    finalRecommendation?: RecommendationOutput;
}

// ========== Edge Case Types ==========

export type EdgeCaseType =
    | 'ambiguous_input'
    | 'contradictory_requirements'
    | 'off_topic'
    | 'premature_recommendation_request'
    | 'hard_constraint_violation';

export interface EdgeCaseResponse {
    type: EdgeCaseType;
    message: string;
    suggested_action: string;
}

// ========== Constants ==========

export const INITIAL_PROFILE: UserProfile = {
    intent: 'unknown',
    funding_needs: 'unknown',
    founder_count: null,
    liability_preference: 'unknown',
    nri_status: null,
    business_type: null,
    expansion_plans: 'unknown',
    revenue_target: null,
    foreign_involvement: null,
    professional_services: null,
    exit_plans: 'unknown',
};

export const COMPLETENESS_THRESHOLDS = {
    LOW: 30,
    MEDIUM: 70,
    HIGH: 90,
} as const;
