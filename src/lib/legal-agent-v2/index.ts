/**
 * Legal Entity Suggestor V2 - Module Exports
 * AI-driven agent for legal entity recommendation
 */

// Types and schemas
export {
    type UserProfile,
    type ThoughtProcess,
    type LLMResponse,
    type RecommendationOutput,
    type Message,
    type AgentState,
    type EdgeCaseType,
    type EdgeCaseResponse,
    UserProfileSchema,
    ThoughtProcessSchema,
    LLMResponseSchema,
    RecommendationOutputSchema,
    INITIAL_PROFILE,
    COMPLETENESS_THRESHOLDS,
} from './types';

// System prompt
export { default as SYSTEM_PROMPT } from './systemPrompt';

// Agent functions
export {
    processLegalAgentMessage,
    formatRecommendation,
    initializeLegalAgentState,
    updateAgentState,
    shouldForceRecommendation,
} from './agent';
