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

    // First, check gathered factors (most reliable source)
    state.gatheredFactors.forEach(f => {
        // Map factor types to critical factor names
        if (f.type === 'other' && f.value === 'business') {
            factors.push('business_type');
        } else if (f.type === 'other' && f.value === 'charity') {
            factors.push('business_type');
        } else if (f.type === 'founders') {
            factors.push('founders_count');
        } else if (f.type === 'nri') {
            factors.push('nri_status');
        } else if (f.type === 'investment') {
            factors.push('funding_type');
        } else if (f.type === 'risk') {
            factors.push('liability_protection');
        } else if (f.type === 'directors') {
            factors.push('directors_shareholders');
        } else if (f.type === 'expansion') {
            factors.push('expansion_plans');
        }
    });

    // Also check conversation history for keywords (fallback)
    const conversation = state.conversationHistory
        .filter(m => m.role === 'assistant')
        .map(m => m.content.toLowerCase())
        .join(' ');

    if ((conversation.includes('business') || conversation.includes('profit')) && !factors.includes('business_type')) {
        factors.push('business_type');
    }
    if ((conversation.includes('founder') || conversation.includes('owner') || conversation.includes('people will own')) && !factors.includes('founders_count')) {
        factors.push('founders_count');
    }
    if ((conversation.includes('nri') || conversation.includes('foreign')) && !factors.includes('nri_status')) {
        factors.push('nri_status');
    }
    if ((conversation.includes('funding') || conversation.includes('investor')) && !factors.includes('funding_type')) {
        factors.push('funding_type');
    }
    if ((conversation.includes('liability') || conversation.includes('protect')) && !factors.includes('liability_protection')) {
        factors.push('liability_protection');
    }
    if ((conversation.includes('director') || conversation.includes('shareholder')) && !factors.includes('directors_shareholders')) {
        factors.push('directors_shareholders');
    }
    if ((conversation.includes('franchise') || conversation.includes('branch')) && !factors.includes('expansion_plans')) {
        factors.push('expansion_plans');
    }

    return factors;
}

/**
 * Select the best question to ask next
 */
export function selectBestQuestion(state: AgentState): string {
    const gaps = identifyInformationGaps(state);

    // **FIX: Prevent infinite loops**
    // If no gaps OR we have enough factors and many iterations, force termination
    if (gaps.length === 0 || (state.gatheredFactors.length >= 5 && state.iterationCount >= 7)) {
        // Signal to make a recommendation instead of asking more questions
        // Return a special marker that the orchestrator can detect
        return "[READY_TO_RECOMMEND]";
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

    // Founders count detection - IMPROVED to handle specific numbers
    const soloPatterns = /\b(only me|just me|solo|alone|myself|i'?m the only|single founder|one person|^1$)\b/i;
    const twoPartners = /\b(two|2|duo|pair)\b/i;
    const threeOrMore = /\b(three|3|four|4|five|5|six|6|seven|8|nine|9|ten|10|\d+)\b/i;
    const multiplePatterns = /\b(partner|co-?founder|multiple|team|us|we)\b/i;

    if (soloPatterns.test(answer)) {
        factors.push({
            type: 'founders',
            value: 'solo',
            impact: 0.9,
            confidence: 0.95,
            source: questionContext,
        });
    } else if (twoPartners.test(answer) || threeOrMore.test(answer)) {
        // Extract the specific number if mentioned
        const numberMatch = answer.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i);
        const numberValue = numberMatch ? numberMatch[1] : 'multiple';

        factors.push({
            type: 'founders',
            value: numberValue, // Store the actual number
            impact: 0.8,
            confidence: 0.9,
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

    // Liability protection - ENHANCED
    const highLiabilityPatterns = /\b(very important|critical|must|absolutely|essential|protect)\b/i;
    const lowLiabilityPatterns = /\b(not important|don't care|doesn't matter|no|minimal)\b/i;

    if (highLiabilityPatterns.test(answer) || (answer.includes('yes') && questionContext.includes('liability'))) {
        factors.push({
            type: 'risk',
            value: 'high_protection',
            impact: 0.8,
            confidence: 0.9,
            source: questionContext,
        });
    } else if (lowLiabilityPatterns.test(answer)) {
        factors.push({
            type: 'risk',
            value: 'low_protection',
            impact: -0.5,
            confidence: 0.8,
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

    // Expansion plans - ENHANCED
    const expansionPatterns = /\b(franchise|branch|expand|both|many|multiple locations|scale)\b/i;
    if (expansionPatterns.test(answer)) {
        factors.push({
            type: 'expansion',
            value: 'yes',
            impact: 0.7,
            confidence: 0.85,
            source: questionContext,
        });
    }

    // Revenue/Scale detection - NEW
    const revenuePatterns = /\b(\d+\s*(?:cr|crore|lakh|lakhs|million|billion))\b/i;
    const highRevenuePatterns = /\b(\d+\s*(?:cr|crore))\b/i;

    if (revenuePatterns.test(answer)) {
        const isHighRevenue = highRevenuePatterns.test(answer);
        factors.push({
            type: 'revenue',
            value: isHighRevenue ? 'high' : 'medium',
            impact: isHighRevenue ? 0.6 : 0.4,
            confidence: 0.85,
            source: questionContext,
        });
    }

    return factors;
}
