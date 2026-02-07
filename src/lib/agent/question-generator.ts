/**
 * Intelligent Question Generator
 * Identifies information gaps and generates targeted questions
 */

import { AgentState, InformationGap } from './types';
import { CRITICAL_FACTORS } from './knowledge';
import { getTopHypotheses } from './state';
import { calculateInformationGain } from './scoring';

/**
 * Identify the most important missing information
 */
export function identifyInformationGaps(state: AgentState): InformationGap[] {
    const askedFactors = extractAskedFactors(state);
    const topHypotheses = getTopHypotheses(state, 3);

    // Find factors we haven't asked about yet
    const missingFactors = CRITICAL_FACTORS.filter(
        cf => !askedFactors.includes(cf.factor)
    );

    // Calculate information gain for each missing factor
    return missingFactors.map(factor => ({
        category: factor.factor,
        question: factor.question,
        importance: factor.importance,
        relatedEntities: factor.differentiates,
    })).sort((a, b) => b.importance - a.importance);
}

/**
 * Extract which factors we've already asked about
 */
function extractAskedFactors(state: AgentState): string[] {
    const factors: string[] = [];

    // Check conversation history for keywords
    const conversation = state.conversationHistory
        .filter(m => m.role === 'assistant')
        .map(m => m.content.toLowerCase())
        .join(' ');

    if (conversation.includes('business') || conversation.includes('profit')) {
        factors.push('business_type');
    }
    if (conversation.includes('founder') || conversation.includes('owner')) {
        factors.push('founders_count');
    }
    if (conversation.includes('nri') || conversation.includes('foreign')) {
        factors.push('nri_status');
    }
    if (conversation.includes('funding') || conversation.includes('investor')) {
        factors.push('funding_type');
    }
    if (conversation.includes('liability') || conversation.includes('protect')) {
        factors.push('liability_protection');
    }
    if (conversation.includes('director') || conversation.includes('shareholder')) {
        factors.push('directors_shareholders');
    }
    if (conversation.includes('franchise') || conversation.includes('branch')) {
        factors.push('expansion_plans');
    }

    // Also check gathered factors
    state.gatheredFactors.forEach(f => {
        if (!factors.includes(f.type)) {
            factors.push(f.type);
        }
    });

    return factors;
}

/**
 * Select the best question to ask next
 */
export function selectBestQuestion(state: AgentState): string {
    const gaps = identifyInformationGaps(state);

    if (gaps.length === 0) {
        // No more gaps - wrap up
        return "Is there anything else important about your business I should know?";
    }

    const topGap = gaps[0];
    return topGap.question;
}

/**
 * Parse user's answer and extract business factors
 */
export function extractFactorsFromAnswer(
    userAnswer: string,
    questionContext: string
): import('./types').BusinessFactor[] {
    const factors: import('./types').BusinessFactor[] = [];
    const answer = userAnswer.toLowerCase();

    // Business type detection
    if (answer.includes('charity') || answer.includes('ngo') || answer.includes('non-profit')) {
        factors.push({
            type: 'other',
            value: 'charity',
            impact: 0.9,
            confidence: 0.9,
            source: questionContext,
        });
    } else if (answer.includes('business') || answer.includes('profit')) {
        factors.push({
            type: 'other',
            value: 'business',
            impact: 0.9,
            confidence: 0.9,
            source: questionContext,
        });
    }

    // Founders count detection - IMPROVED FOR 'only me'
    const soloPatterns = /\b(only me|just me|solo|alone|myself|i'?m the only|single founder|one person)\b/i;
    const multiplePatterns = /\b(partner|co-?founder|two|multiple|team|us|we)\b/i;

    if (soloPatterns.test(answer)) {
        factors.push({
            type: 'founders',
            value: 'solo',
            impact: 0.9,
            confidence: 0.95,
            source: questionContext,
        });
    } else if (multiplePatterns.test(answer)) {
        factors.push({
            type: 'founders',
            value: 'multiple',
            impact: 0.5,
            confidence: 0.8,
            source: questionContext,
        });
    }

    // NRI status detection
    if (answer.includes('nri') || answer.includes('foreign') || answer.includes('non-resident')) {
        factors.push({
            type: 'nri',
            value: 'yes',
            impact: 0.9,
            confidence: 0.95,
            source: questionContext,
        });
    } else if (answer.includes('indian') || answer.includes('resident') || answer.includes('no')) {
        factors.push({
            type: 'nri',
            value: 'no',
            impact: -0.9,
            confidence: 0.8,
            source: questionContext,
        });
    }

    // Funding detection
    if (answer.includes('vc') || answer.includes('investor') || answer.includes('funding')) {
        factors.push({
            type: 'investment',
            value: 'vc',
            impact: 0.8,
            confidence: 0.9,
            source: questionContext,
        });
    } else if (answer.includes('bootstrap') || answer.includes('own money') || answer.includes('self')) {
        factors.push({
            type: 'investment',
            value: 'bootstrap',
            impact: -0.5,
            confidence: 0.8,
            source: questionContext,
        });
    }

    // Liability protection
    if (answer.includes('protect') || answer.includes('yes') && questionContext.includes('liability')) {
        factors.push({
            type: 'risk',
            value: 'needs_protection',
            impact: 0.7,
            confidence: 0.7,
            source: questionContext,
        });
    }

    // Directors/Shareholders
    if (answer.includes('yes') && questionContext.includes('director')) {
        factors.push({
            type: 'directors',
            value: 'yes',
            impact: 0.6,
            confidence: 0.8,
            source: questionContext,
        });
    } else if (answer.includes('no') && questionContext.includes('director')) {
        factors.push({
            type: 'directors',
            value: 'no',
            impact: -0.6,
            confidence: 0.8,
            source: questionContext,
        });
    }

    // Expansion plans
    if (answer.includes('franchise') || answer.includes('branch') || answer.includes('expand')) {
        factors.push({
            type: 'expansion',
            value: 'yes',
            impact: 0.7,
            confidence: 0.85,
            source: questionContext,
        });
    }

    return factors;
}
