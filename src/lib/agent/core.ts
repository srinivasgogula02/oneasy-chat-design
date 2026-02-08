/**
 * Core Agent Implementation with ReAct Pattern
 * Think → Act → Observe → Reflect loop
 */

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import Groq from 'groq-sdk';
import {
    AgentState,
    Thought,
    Action,
    Observation,
    Reflection,
    FinalRecommendation,
} from './types';
import { logger } from './logger';
import {
    getTopHypotheses,
    addMessage,
    incrementIteration,
} from './state';

// LLM Configuration
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'groq';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const vercelAI = createOpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_GATEWAY_BASE_URL || 'https://api.openai.com/v1',
});

/**
 * Call LLM with unified interface
 */
async function callLLM(
    messages: { role: 'user' | 'system'; content: string }[],
    options?: { temperature?: number }
): Promise<string> {
    if (LLM_PROVIDER === 'vercel') {
        const result = await generateText({
            model: vercelAI(process.env.AI_MODEL || 'gpt-4o'),
            messages,
            temperature: options?.temperature,
        });
        return result.text || '';
    } else {
        const response = await groq.chat.completions.create({
            messages,
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            temperature: options?.temperature,
        });
        return response.choices[0]?.message?.content || '';
    }
}

/**
 * THINK: Analyze current state and decide next action
 */
export async function think(state: AgentState): Promise<Thought> {
    logger.thought(state.sessionId, { iteration: state.iterationCount });

    const topHypotheses = getTopHypotheses(state, 3);
    const topEntity = topHypotheses[0];

    const prompt = `You are a legal entity advisor agent. Analyze the current state and decide the best next action.

CURRENT STATE:
- Top Hypothesis: ${topEntity.entity} (${(topEntity.confidence * 100).toFixed(1)}% confidence)
- Gathered Factors: ${state.gatheredFactors.length}
- Iteration: ${state.iterationCount}/10

CONVERSATION HISTORY:
${state.conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

HYPOTHESES:
${topHypotheses.map(h => `- ${h.entity}: ${(h.confidence * 100).toFixed(1)}%`).join('\n')}

DECISION CRITERIA:
- If top confidence > 75%, recommend
- If missing critical info, ask question
- If user unclear, clarify
- If iteration >= 10, recommend with caveat

OUTPUT JSON:
{
  "reasoning": "brief explanation",
  "action": "ask_question|clarify_answer|use_tool|make_recommendation|reflect",
  "confidence": 0.0-1.0,
  "priority": 0-10
}`;

    const response = await callLLM([
        { role: 'system', content: 'You are a reasoning engine. Output valid JSON only.' },
        { role: 'user', content: prompt },
    ], { temperature: 0.3 });

    try {
        const thought: Thought = JSON.parse(response);
        return thought;
    } catch {
        // Fallback if JSON parsing fails
        return {
            reasoning: 'Continuing investigation',
            action: state.iterationCount >= 10 ? 'make_recommendation' : 'ask_question',
            confidence: 0.5,
            priority: 5,
        };
    }
}

/**
 * ACT: Execute the planned action
 */
export async function act(state: AgentState, thought: Thought): Promise<Action> {
    logger.action(state.sessionId, { thought });

    const actionMap: Record<Thought['action'], Action['type']> = {
        'ask_question': 'generate_question',
        'clarify_answer': 'generate_question',
        'use_tool': 'update_scores',
        'make_recommendation': 'recommend',
        'reflect': 'analyze_gap',
    };

    return {
        type: actionMap[thought.action],
        parameters: {
            state,
            thought,
        },
    };
}

/**
 * OBSERVE: Process action result and update state
 */
export async function observe(
    state: AgentState,
    action: Action
): Promise<Observation> {
    logger.observation(state.sessionId, { action });

    // Execute action based on type
    switch (action.type) {
        case 'generate_question':
            const question = await generateSmartQuestion(state);

            // **FIX: Check for recommendation signal**
            if (question === '[READY_TO_RECOMMEND]') {
                // Switch to recommendation mode
                return {
                    success: true,
                    data: await makeRecommendation(state),
                    impact: 'Sufficient information gathered - making recommendation',
                };
            }

            return {
                success: true,
                data: question,
                impact: 'Question generated for user',
            };

        case 'update_scores': {
            // Import scoring functions
            const { updateConfidenceScores, applyConstraints } = await import('./scoring');
            const { extractFactorsFromAnswer } = await import('./question-generator');

            // Get last user message
            const lastUserMessage = state.conversationHistory
                .filter(m => m.role === 'user')
                .slice(-1)[0];

            const lastAssistantMessage = state.conversationHistory
                .filter(m => m.role === 'assistant')
                .slice(-1)[0];

            if (lastUserMessage) {
                // Extract factors from user's answer
                const newFactors = extractFactorsFromAnswer(
                    lastUserMessage.content,
                    lastAssistantMessage?.content || ''
                );

                // Update scores for each factor
                let updatedHypotheses = state.currentHypotheses;
                for (const factor of newFactors) {
                    updatedHypotheses = updateConfidenceScores(
                        { ...state, currentHypotheses: updatedHypotheses },
                        factor
                    );
                }

                // Apply hard constraints
                updatedHypotheses = applyConstraints(updatedHypotheses, [
                    ...state.gatheredFactors,
                    ...newFactors
                ]);

                return {
                    success: true,
                    data: 'Scores updated based on new information',
                    impact: 'Confidence scores recalculated',
                    updatedFactors: newFactors,
                    updatedHypotheses: updatedHypotheses,
                };
            }

            return {
                success: true,
                data: 'No new factors to process',
                impact: 'No change',
            };
        }

        case 'recommend':
            return {
                success: true,
                data: await makeRecommendation(state),
                impact: 'Final recommendation prepared',
            };

        case 'analyze_gap':
            return {
                success: true,
                data: 'Gap analysis complete',
                impact: 'Identified missing information',
            };

        default:
            return {
                success: false,
                data: 'Unknown action',
                impact: 'No change',
            };
    }
}

/**
 * REFLECT: Assess progress and adjust strategy
 */
export async function reflect(state: AgentState): Promise<Reflection> {
    logger.reflection(state.sessionId, { iteration: state.iterationCount });

    const topHypothesis = getTopHypotheses(state, 1)[0];

    const shouldContinue =
        topHypothesis.confidence < 0.75 && state.iterationCount < 10;

    return {
        progressAssessment: `Iteration ${state.iterationCount}: Top hypothesis is ${topHypothesis.entity} at ${(topHypothesis.confidence * 100).toFixed(1)}%`,
        confidenceLevel: topHypothesis.confidence,
        shouldContinue,
        strategicAdjustments: shouldContinue
            ? ['Continue gathering information']
            : ['Prepare final recommendation'],
    };
}

/**
 * Generate smart question based on current state
 */
async function generateSmartQuestion(state: AgentState): Promise<string> {
    const { selectBestQuestion } = await import('./question-generator');
    const question = selectBestQuestion(state);

    // **FIX: Detect termination signal**
    // If question generator says we're ready to recommend, return a marker
    if (question === '[READY_TO_RECOMMEND]') {
        // This will be caught by the orchestrator as a completion signal
        return '[READY_TO_RECOMMEND]';
    }

    return question;
}

/**
 * Make final recommendation
 */
async function makeRecommendation(state: AgentState): Promise<FinalRecommendation> {
    const topHypotheses = getTopHypotheses(state, 3);
    const winner = topHypotheses[0];

    return {
        entity: winner.entity,
        confidence: winner.confidence,
        reasoning: winner.supportingFactors,
        alternatives: topHypotheses.slice(1, 3).map(h => ({
            entity: h.entity,
            confidence: h.confidence,
            reason: `Score: ${(h.confidence * 100).toFixed(1)}%`,
        })),
        caveats: winner.confidence < 0.6 ? ['Low confidence - consider consulting an expert'] : undefined,
    };
}

export { callLLM };
