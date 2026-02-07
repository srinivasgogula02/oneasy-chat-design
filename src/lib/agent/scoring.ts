/**
 * Probabilistic Scoring Engine
 * Implements Bayesian inference for confidence updates
 */

import { AgentState, BusinessFactor, EntityHypothesis } from './types';
import { EntityType } from '../legal-agent/types';
import { getEntityRule } from './knowledge';

/**
 * Update entity confidences based on new evidence (Bayesian inference)
 */
export function updateConfidenceScores(
    state: AgentState,
    newFactor: BusinessFactor
): EntityHypothesis[] {
    const hypotheses = state.currentHypotheses;

    // Calculate likelihoods for each entity given the new factor
    const updatedHypotheses = hypotheses.map(hypothesis => {
        const entityRule = getEntityRule(hypothesis.entity);

        // Calculate likelihood: P(Evidence | Entity)
        const likelihood = calculateLikelihood(newFactor, entityRule);

        // Bayesian update: P(Entity | Evidence) ∝ P(Evidence | Entity) * P(Entity)
        const prior = hypothesis.confidence;
        const unnormalizedPosterior = likelihood * prior;

        return {
            ...hypothesis,
            confidence: unnormalizedPosterior, // Will normalize later
        };
    });

    // Normalize so all confidences sum to 1
    const totalConfidence = updatedHypotheses.reduce(
        (sum, h) => sum + h.confidence,
        0
    );

    return updatedHypotheses.map(h => ({
        ...h,
        confidence: totalConfidence > 0 ? h.confidence / totalConfidence : h.confidence,
    }));
}

/**
 * Calculate likelihood of evidence given an entity
 * P(Evidence | Entity) = how well this factor fits this entity
 */
function calculateLikelihood(
    factor: BusinessFactor,
    entityRule: any
): number {
    // Base likelihood (neutral)
    let likelihood = 0.5;

    // Check if factor is in required factors (strong positive signal)
    if (entityRule.requiredFactors.includes(factor.type)) {
        likelihood = factor.impact > 0 ? 0.9 : 0.1;
    }

    // Check if factor is in prohibited factors (strong negative signal)
    if (entityRule.prohibitedFactors.includes(factor.type)) {
        likelihood = factor.impact > 0 ? 0.1 : 0.9;
    }

    // Check scoring weights
    const weight = entityRule.scoringWeights[factor.type];
    if (weight) {
        // Adjust likelihood based on factor impact and weight
        likelihood = 0.5 + factor.impact * weight;
        // Clamp between 0.1 and 0.9
        likelihood = Math.max(0.1, Math.min(0.9, likelihood));
    }

    // Apply factor confidence
    // High confidence in the factor means we trust the likelihood more
    likelihood = 0.5 + (likelihood - 0.5) * factor.confidence;

    return likelihood;
}

/**
 * Apply hard constraints (eliminate entities that violate rules)
 */
export function applyConstraints(
    hypotheses: EntityHypothesis[],
    factors: BusinessFactor[]
): EntityHypothesis[] {
    return hypotheses.map(hypothesis => {
        const entityRule = getEntityRule(hypothesis.entity);
        let shouldEliminate = false;

        // Check each hard constraint
        for (const constraint of entityRule.hardConstraints) {
            if (constraint.type === 'hard_gate' && constraint.effect === 'eliminate') {
                // Check if any factor violates this constraint
                const violation = evaluateConstraint(constraint, factors);
                if (violation) {
                    shouldEliminate = true;
                    break;
                }
            }
        }

        return {
            ...hypothesis,
            confidence: shouldEliminate ? 0 : hypothesis.confidence,
            contradictingFactors: shouldEliminate
                ? [...hypothesis.contradictingFactors, 'Hard constraint violation']
                : hypothesis.contradictingFactors,
        };
    });
}

/**
 * Evaluate if a constraint is violated
 */
function evaluateConstraint(
    constraint: any,
    factors: BusinessFactor[]
): boolean {
    // Simple condition evaluation
    // In production, would use a proper expression evaluator
    const condition = constraint.condition;

    // Check for NRI constraint
    if (condition.includes('nri === true')) {
        return factors.some(f => f.type === 'nri' && f.impact > 0);
    }

    // Check for foreign investment
    if (condition.includes('foreign_investment === true')) {
        return factors.some(f => f.type === 'investment' && f.value.includes('foreign'));
    }

    // Check for multiple founders
    if (condition.includes('founders > 1')) {
        return factors.some(f => f.type === 'founders' && f.impact > 0.3);
    }

    // Check for charity type
    if (condition.includes('business_type !== "charity"')) {
        return !factors.some(f => f.type === 'other' && f.value.includes('charity'));
    }

    return false;
}

/**
 * Calculate information gain for a potential question
 */
export function calculateInformationGain(
    hypotheses: EntityHypothesis[],
    factor: string
): number {
    // Calculate current entropy (uncertainty)
    const currentEntropy = calculateEntropy(hypotheses.map(h => h.confidence));

    // Estimate entropy after asking about this factor
    // Higher information gain = better question
    // This is a simplified heuristic
    const topConfidence = Math.max(...hypotheses.map(h => h.confidence));

    // If we're already very certain, low gain
    if (topConfidence > 0.75) return 0.1;

    // If hypotheses are spread out, high gain potential
    const variance = calculateVariance(hypotheses.map(h => h.confidence));

    return variance * 2; // Scale to 0-1 range roughly
}

/**
 * Calculate Shannon entropy
 */
function calculateEntropy(probabilities: number[]): number {
    return -probabilities.reduce((sum, p) => {
        if (p <= 0) return sum;
        return sum + p * Math.log2(p);
    }, 0);
}

/**
 * Calculate variance
 */
function calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
}
