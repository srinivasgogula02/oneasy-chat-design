/**
 * Legal Entity Suggestor V2 - Main Agent Logic
 * Chain-of-Thought reasoning with Vercel AI SDK
 */

import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import pRetry from 'p-retry';
import {
    LLMResponseSchema,
    type LLMResponse,
    type Message,
    type UserProfile,
    type AgentState,
    INITIAL_PROFILE,
    COMPLETENESS_THRESHOLDS,
} from './types';
import SYSTEM_PROMPT from './systemPrompt';

/**
 * Main agent processing function
 * Processes user messages and maintains conversation state
 */
export async function processLegalAgentMessage(
    messages: Message[],
    currentProfile: UserProfile = INITIAL_PROFILE
): Promise<LLMResponse> {
    try {
        // Call LLM with retry logic
        const response = await callLLMWithRetry(messages, currentProfile);
        return response;
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[Agent Error]', err);

        // Fallback response if LLM fails
        return createFallbackResponse(currentProfile, err.message);
    }
}

/**
 * Call LLM with structured output using Vercel AI SDK
 * Supports both Groq and Vercel AI Gateway providers
 */
async function callLLMWithRetry(
    messages: Message[],
    profile: UserProfile
): Promise<LLMResponse> {
    return pRetry(
        async () => {
            // Prepare messages with profile context
            const systemMessages: Message[] = [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {
                    role: 'system',
                    content: `CURRENT USER PROFILE:\n${JSON.stringify(profile, null, 2)}\n\nAnalyze the user's latest message, update the profile, and decide whether to ask a question or make a recommendation.`,
                },
            ];

            const allMessages = [...systemMessages, ...messages];

            // Get LLM configuration from environment
            const provider = process.env.LLM_PROVIDER || 'groq';
            let model;

            if (provider === 'vercel') {
                // Use Vercel AI Gateway (supports OpenAI, Anthropic, etc.)
                const { createOpenAI } = await import('@ai-sdk/openai');
                const aiModel = process.env.AI_MODEL || 'gpt-4o';

                const openai = createOpenAI({
                    baseURL: process.env.AI_GATEWAY_BASE_URL,
                    apiKey: process.env.AI_GATEWAY_API_KEY || '',
                });

                model = openai(aiModel);
            } else {
                // Use Groq (default)
                const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
                model = groq(groqModel);
            }

            // Call LLM with structured output
            console.log(`[V2 Agent] Calling LLM (${provider})...`);
            console.time('[V2 Agent] LLM Latency');

            const result = await generateObject({
                model,
                schema: LLMResponseSchema,
                messages: allMessages.map(m => ({
                    role: m.role,
                    content: m.content,
                })),
                temperature: 0.3, // Lower temperature for more consistent reasoning
            });

            console.timeEnd('[V2 Agent] LLM Latency');

            // Validate response
            if (!result.object) {
                throw new Error('LLM returned no object');
            }

            // Type-safe access to the object
            const llmResponse = result.object as LLMResponse;

            console.log('[V2 Agent] Response:', JSON.stringify({
                thought: llmResponse.thought_process,
                action: llmResponse.next_action,
                question: llmResponse.question,
                recommendation: llmResponse.recommendation?.entity
            }, null, 2));

            // Validate action consistency
            if (llmResponse.next_action === 'ask_question' && !llmResponse.question) {
                throw new Error('Action is ask_question but no question provided');
            }

            if (llmResponse.next_action === 'recommend' && !llmResponse.recommendation) {
                throw new Error('Action is recommend but no recommendation provided');
            }

            return llmResponse;
        },
        {
            retries: 3,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 5000,
            onFailedAttempt: (error: unknown) => {
                const err = error instanceof Error ? error : new Error(String(error));
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                console.warn(`[LLM Retry] Attempt ${(error as any).attemptNumber} failed:`, err.message);
            },
        }
    );
}


/**
 * Create a fallback response when LLM fails
 */
function createFallbackResponse(profile: UserProfile, errorMessage: string): LLMResponse {
    console.error('[Fallback Triggered]', errorMessage);

    // Determine what to ask based on what's missing
    const missingFactors = getMissingCriticalFactors(profile);
    const fallbackQuestion = missingFactors.length > 0
        ? getFallbackQuestionForFactor(missingFactors[0])
        : "Could you tell me more about your business? What kind of venture are you starting?";

    return {
        thought_process: {
            analysis: 'System encountered an error, using fallback logic',
            contradictions: [],
            missing_critical_factors: missingFactors,
            completeness_score: calculateCompletenessScore(profile),
            current_understanding: summarizeProfile(profile),
        },
        suitability_analysis: {
            "Private Limited Company": { score: 50, reason: "Insufficient data", is_excluded: false },
            "LLP": { score: 50, reason: "Insufficient data", is_excluded: false },
            "One Person Company (OPC)": { score: 50, reason: "Insufficient data", is_excluded: false },
            "Partnership Firm": { score: 50, reason: "Insufficient data", is_excluded: false },
            "Sole Proprietorship": { score: 50, reason: "Insufficient data", is_excluded: false },
        },
        next_action: 'ask_question',
        question: fallbackQuestion,
        updated_profile: profile,
    };
}

/**
 * Identify missing critical factors from profile
 */
function getMissingCriticalFactors(profile: UserProfile): string[] {
    const missing: string[] = [];

    if (profile.intent === 'unknown') {
        missing.push('Business intent (for-profit or non-profit)');
    }

    if (profile.founder_count === null) {
        missing.push('Number of founders');
    }

    if (profile.nri_status === null && profile.intent !== 'unknown') {
        missing.push('NRI status');
    }

    if (profile.funding_needs === 'unknown' && profile.intent === 'business') {
        missing.push('Funding requirements');
    }

    if (profile.liability_preference === 'unknown' && profile.intent === 'business') {
        missing.push('Liability protection preference');
    }

    if (profile.business_type === null && profile.intent === 'business') {
        missing.push('Business type/industry');
    }

    return missing;
}

/**
 * Get a fallback question for a specific missing factor
 */
function getFallbackQuestionForFactor(factor: string): string {
    const questionMap: Record<string, string> = {
        'Business intent (for-profit or non-profit)': 'Are you starting a for-profit business or a non-profit organization?',
        'Number of founders': 'How many people will be owning and running this business?',
        'NRI status': 'Are you or any of the founders NRI (Non-Resident Indian) or foreign citizens?',
        'Funding requirements': 'How do you plan to fund this business - with your own money, VC/angel investors, or bank loans?',
        'Liability protection preference': 'How important is it for you to protect your personal assets from business liabilities?',
        'Business type/industry': 'What type of business are you starting? For example, is it tech/software, professional services, retail, or something else?',
    };

    return questionMap[factor] || 'Could you tell me more about your business plans?';
}

/**
 * Calculate completeness score based on profile
 */
function calculateCompletenessScore(profile: UserProfile): number {
    let score = 0;
    const weights = {
        intent: 20,
        founder_count: 15,
        nri_status: 15,
        funding_needs: 15,
        liability_preference: 10,
        business_type: 10,
        expansion_plans: 5,
        revenue_target: 5,
        foreign_involvement: 5,
    };

    if (profile.intent !== 'unknown') score += weights.intent;
    if (profile.founder_count !== null) score += weights.founder_count;
    if (profile.nri_status !== null) score += weights.nri_status;
    if (profile.funding_needs !== 'unknown') score += weights.funding_needs;
    if (profile.liability_preference !== 'unknown') score += weights.liability_preference;
    if (profile.business_type !== null) score += weights.business_type;
    if (profile.expansion_plans !== 'unknown') score += weights.expansion_plans;
    if (profile.revenue_target !== null) score += weights.revenue_target;
    if (profile.foreign_involvement !== null) score += weights.foreign_involvement;

    return Math.min(100, score);
}

/**
 * Summarize current profile for context
 */
function summarizeProfile(profile: UserProfile): string {
    const parts: string[] = [];

    if (profile.intent !== 'unknown') {
        parts.push(`Intent: ${profile.intent}`);
    }

    if (profile.founder_count !== null) {
        parts.push(`Founders: ${profile.founder_count}`);
    }

    if (profile.funding_needs !== 'unknown') {
        parts.push(`Funding: ${profile.funding_needs}`);
    }

    if (profile.business_type) {
        parts.push(`Type: ${profile.business_type}`);
    }

    if (profile.nri_status !== null) {
        parts.push(`NRI: ${profile.nri_status ? 'Yes' : 'No'}`);
    }

    return parts.length > 0 ? parts.join(', ') : 'No information gathered yet';
}

/**
 * Format final recommendation as user-friendly message
 */
export function formatRecommendation(
    recommendation: LLMResponse['recommendation']
): string {
    if (!recommendation) {
        return 'Unable to generate recommendation at this time.';
    }

    let message = `## 🎯 Recommended: **${recommendation.entity}**\n\n`;
    message += `**Confidence:** ${recommendation.confidence}%\n\n`;

    if (recommendation.reasoning.length > 0) {
        message += `### Why This is Best For You:\n\n`;
        recommendation.reasoning.forEach(reason => {
            message += `- ${reason}\n`;
        });
        message += '\n';
    }

    if (recommendation.alternative) {
        message += `### Alternative Option:\n\n`;
        message += `**${recommendation.alternative.entity}**: ${recommendation.alternative.reason}\n\n`;
    }

    if (recommendation.caveats && recommendation.caveats.length > 0) {
        message += `### ⚠️ Important Considerations:\n\n`;
        recommendation.caveats.forEach(caveat => {
            message += `- ${caveat}\n`;
        });
    }

    return message;
}

/**
 * Initialize agent state
 */
export function initializeLegalAgentState(sessionId: string): AgentState {
    return {
        sessionId,
        profile: { ...INITIAL_PROFILE },
        conversationHistory: [],
        isComplete: false,
    };
}

/**
 * Update agent state with new message and response
 */
export function updateAgentState(
    state: AgentState,
    userMessage: string,
    llmResponse: LLMResponse
): AgentState {
    const newState = { ...state };

    // Add user message to history
    newState.conversationHistory.push({
        role: 'user',
        content: userMessage,
    });

    // Add assistant response to history
    const assistantMessage = llmResponse.next_action === 'ask_question'
        ? llmResponse.question || 'How can I help you?'
        : formatRecommendation(llmResponse.recommendation);

    newState.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
    });

    // Update profile
    newState.profile = llmResponse.updated_profile;

    // Update thought process
    newState.lastThought = llmResponse.thought_process;

    // Update completion status
    if (llmResponse.next_action === 'recommend') {
        newState.isComplete = true;
        newState.finalRecommendation = llmResponse.recommendation;
    }

    return newState;
}

/**
 * Check if agent should force recommendation (safety check)
 */
export function shouldForceRecommendation(
    state: AgentState,
    maxMessages: number = 20
): boolean {
    // Force recommendation after too many messages
    if (state.conversationHistory.length >= maxMessages) {
        return true;
    }

    // Force if completeness is very high but not recommending
    if (
        state.lastThought &&
        state.lastThought.completeness_score >= COMPLETENESS_THRESHOLDS.HIGH &&
        !state.isComplete
    ) {
        return true;
    }

    return false;
}
