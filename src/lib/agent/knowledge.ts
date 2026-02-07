/**
 * Knowledge Base: Entity Rules and Scoring Logic
 * Migrated from data.ts with probabilistic enhancements
 */

import { EntityType } from '../legal-agent/types';
import { EntityRule, Constraint } from './types';

/**
 * Comprehensive knowledge base for all legal entities
 */
export const ENTITY_KNOWLEDGE: Record<EntityType, EntityRule> = {
    'Sole Proprietorship': {
        entity: 'Sole Proprietorship',
        requiredFactors: ['solo_founder'],
        prohibitedFactors: ['nri', 'foreign_investment', 'vc_funding', 'franchise'],
        scoringWeights: {
            solo_founder: 0.6,
            low_investment: 0.3,
            simple_business: 0.4,
            low_risk: 0.3,
            no_liability_protection: 0.2,
        },
        hardConstraints: [
            {
                type: 'hard_gate',
                condition: 'nri === true',
                effect: 'eliminate',
                priority: 10,
            },
            {
                type: 'hard_gate',
                condition: 'foreign_investment === true',
                effect: 'eliminate',
                priority: 10,
            },
        ],
    },

    'OPC': {
        entity: 'OPC',
        requiredFactors: ['solo_founder'],
        prohibitedFactors: ['multiple_founders', 'franchise'],
        scoringWeights: {
            solo_founder: 0.6,
            nri: 0.3,
            liability_protection: 0.5,
            formal_structure: 0.4,
            directors_shareholders: 0.3,
        },
        hardConstraints: [
            {
                type: 'hard_gate',
                condition: 'founders > 1',
                effect: 'eliminate',
                priority: 10,
            },
            {
                type: 'hard_gate',
                condition: 'franchise === true',
                effect: 'eliminate',
                priority: 10,
            },
        ],
    },

    'Private Limited Company': {
        entity: 'Private Limited Company',
        requiredFactors: [],
        prohibitedFactors: [],
        scoringWeights: {
            vc_funding: 0.8,
            high_growth: 0.7,
            liability_protection: 0.6,
            foreign_investment: 0.7,
            formal_structure: 0.6,
            directors_shareholders: 0.5,
            franchise: 0.6,
        },
        hardConstraints: [
            {
                type: 'soft_preference',
                condition: 'foreign_investment === true',
                effect: 'strong_boost',
                priority: 8,
            },
        ],
    },

    'LLP': {
        entity: 'LLP',
        requiredFactors: [],
        prohibitedFactors: [],
        scoringWeights: {
            professional_services: 0.7,
            partnership: 0.6,
            liability_protection: 0.5,
            moderate_complexity: 0.4,
            no_directors: 0.4,
        },
        hardConstraints: [],
    },

    'Partnership Firm': {
        entity: 'Partnership Firm',
        requiredFactors: ['multiple_founders'],
        prohibitedFactors: ['nri', 'foreign_investment', 'vc_funding'],
        scoringWeights: {
            partnership: 0.6,
            simple_business: 0.4,
            trust_based: 0.3,
        },
        hardConstraints: [
            {
                type: 'hard_gate',
                condition: 'nri === true',
                effect: 'eliminate',
                priority: 10,
            },
        ],
    },

    'Public Limited Company': {
        entity: 'Public Limited Company',
        requiredFactors: [],
        prohibitedFactors: [],
        scoringWeights: {
            ipo_plans: 0.9,
            large_scale: 0.8,
            public_funding: 0.7,
        },
        hardConstraints: [],
    },

    'Section 8 Company': {
        entity: 'Section 8 Company',
        requiredFactors: ['ngo_charity'],
        prohibitedFactors: ['profit_motive'],
        scoringWeights: {
            ngo_charity: 0.9,
            government_grants: 0.6,
            credibility: 0.5,
        },
        hardConstraints: [
            {
                type: 'hard_gate',
                condition: 'business_type !== "charity"',
                effect: 'eliminate',
                priority: 10,
            },
        ],
    },

    'Trust': {
        entity: 'Trust',
        requiredFactors: ['ngo_charity'],
        prohibitedFactors: ['profit_motive'],
        scoringWeights: {
            ngo_charity: 0.8,
            simple_ngo: 0.5,
            religious: 0.6,
        },
        hardConstraints: [
            {
                type: 'hard_gate',
                condition: 'business_type !== "charity"',
                effect: 'eliminate',
                priority: 10,
            },
        ],
    },

    'Society': {
        entity: 'Society',
        requiredFactors: ['ngo_charity'],
        prohibitedFactors: ['profit_motive'],
        scoringWeights: {
            ngo_charity: 0.7,
            community: 0.5,
        },
        hardConstraints: [
            {
                type: 'hard_gate',
                condition: 'business_type !== "charity"',
                effect: 'eliminate',
                priority: 10,
            },
        ],
    },
};

/**
 * Information gaps that drive question generation
 */
export const CRITICAL_FACTORS = [
    {
        factor: 'business_type',
        question: 'Are you starting a for-profit business or a non-profit/charity?',
        importance: 10,
        differentiates: ['Section 8 Company', 'Trust', 'Society'] as EntityType[],
    },
    {
        factor: 'founders_count',
        question: 'How many people will own and run this business?',
        importance: 9,
        differentiates: ['Sole Proprietorship', 'OPC', 'Partnership Firm'] as EntityType[],
    },
    {
        factor: 'nri_status',
        question: 'Are you or any of the founders NRI (Non-Resident Indian) or foreign citizens?',
        importance: 9,
        differentiates: ['Sole Proprietorship', 'Partnership Firm', 'OPC'] as EntityType[],
    },
    {
        factor: 'funding_type',
        question: 'How do you plan to fund this - own money, VC/investors, or loans?',
        importance: 8,
        differentiates: ['Private Limited Company', 'LLP'] as EntityType[],
    },
    {
        factor: 'liability_protection',
        question: 'How important is it to protect your personal assets from business liabilities?',
        importance: 7,
        differentiates: ['Private Limited Company', 'LLP', 'OPC'] as EntityType[],
    },
    {
        factor: 'directors_shareholders',
        question: 'Do you want a formal structure with directors and shareholders?',
        importance: 6,
        differentiates: ['Private Limited Company', 'OPC', 'LLP'] as EntityType[],
    },
    {
        factor: 'expansion_plans',
        question: 'Do you plan to open franchises or multiple branches?',
        importance: 7,
        differentiates: ['Private Limited Company', 'LLP'] as EntityType[],
    },
];

/**
 * Get entity rule by name
 */
export function getEntityRule(entity: EntityType): EntityRule {
    return ENTITY_KNOWLEDGE[entity];
}

/**
 * Get all hard constraints across all entities
 */
export function getAllConstraints(): Constraint[] {
    return Object.values(ENTITY_KNOWLEDGE).flatMap(rule => rule.hardConstraints);
}
