
import { UserProfile } from "./types";
import { QUESTIONS } from "../legal-agent/data";
import { INITIAL_SCORES, EntityType } from "../legal-agent/types";

/**
 * Maps the V2 UserProfile to the legacy 'answers' format (QuestionID -> OptionID)
 * effectively simulating as if the user answered the V1 questionnaire.
 */
export function mapV2ProfileToLegacyAnswers(profile: UserProfile): Record<string, string> {
    const answers: Record<string, string> = {};

    // 1. Intent
    if (profile.intent === 'business') answers['Q1'] = 'BUSINESS';
    if (profile.intent === 'charity') answers['Q1'] = 'CHARITY';

    // 2. Funding Needs
    if (profile.funding_needs === 'vc' || profile.funding_needs === 'angel') answers['Q7B'] = 'INVESTORS';
    if (profile.funding_needs === 'bank_loan') answers['Q7B'] = 'BANK_LOAN';
    if (profile.funding_needs === 'bootstrap') answers['Q7B'] = 'OWN_MONEY';

    // 3. Founder Count & NRI
    if (profile.founder_count !== null) {
        if (profile.founder_count === 1) {
            answers['Q5B'] = 'JUST_ME';
            if (profile.nri_status === true) answers['Q5B_NRI_SOLO'] = 'YES_NRI';
            if (profile.nri_status === false) answers['Q5B_NRI_SOLO'] = 'NO_RESIDENT';
        } else if (profile.founder_count === 2) {
            answers['Q5B'] = 'TWO_PEOPLE';
        } else if (profile.founder_count >= 3 && profile.founder_count <= 5) {
            answers['Q5B'] = 'SMALL_TEAM';
        } else if (profile.founder_count > 5) {
            answers['Q5B'] = 'LARGE_GROUP';
        }

        if (profile.founder_count > 1) {
            if (profile.nri_status === true) answers['Q5B_NRI_MULTI'] = 'YES_NRI';
            if (profile.nri_status === false) answers['Q5B_NRI_MULTI'] = 'NO_RESIDENT';
        }
    }

    // 4. Liability Preference
    if (profile.liability_preference === 'limited') answers['Q6B'] = 'MUST_PROTECT';
    if (profile.liability_preference === 'unlimited') answers['Q6B'] = 'NOT_WORRIED';

    // 5. Expansion Plans
    if (profile.expansion_plans === 'franchise') answers['Q11B'] = 'FRANCHISE';
    if (profile.expansion_plans === 'multi_branch') answers['Q11B'] = 'MULTIPLE_BRANCHES';
    if (profile.expansion_plans === 'single_location') answers['Q11B'] = 'ONE_LOCATION';
    if (profile.expansion_plans === 'online') answers['Q11B'] = 'ONLINE_ONLY';

    // 6. Exit Plans
    if (profile.exit_plans === 'sell') answers['Q12B'] = 'SELL';
    if (profile.exit_plans === 'family') answers['Q12B'] = 'FAMILY';
    if (profile.exit_plans === 'personal') answers['Q12B'] = 'PERSONAL';

    // 7. Business Type (Approximate mapping for Q2B)
    if (profile.business_type) {
        const type = profile.business_type.toLowerCase();
        if (type.includes('freelance') || type.includes('consult')) answers['Q2B'] = 'FREELANCER';
        if (type.includes('content') || type.includes('youtube')) answers['Q2B'] = 'CONTENT_CREATOR';
        if (type.includes('start') || type.includes('tech') || type.includes('app')) answers['Q2B'] = 'BUILDING_COMPANY';
        if (type.includes('shop') || type.includes('trade')) answers['Q2B'] = 'TRADING';
    }

    // 8. Foreign Involvement
    if (profile.foreign_involvement === true) answers['Q10B'] = 'FOREIGN_CLIENTS';
    if (profile.foreign_involvement === false) answers['Q10B'] = 'INDIA_ONLY';

    // 9. Revenue Target
    if (profile.revenue_target) {
        if (profile.revenue_target.includes('< 20L')) answers['Q8B'] = 'UNDER_20L';
        if (profile.revenue_target.includes('20L-1Cr')) answers['Q8B'] = '20L_1CR';
        if (profile.revenue_target.includes('> 5Cr')) answers['Q8B'] = 'ABOVE_5CR';
    }

    return answers;
}

/**
 * Calculates legacy scores based on the simulated answers from V2 profile.
 * This provides real-time chart updates as the AI learns more about the user.
 */
export function calculateScoresFromV2Profile(profile: UserProfile): Record<EntityType, number> {
    // 1. Map to answers
    const answers = mapV2ProfileToLegacyAnswers(profile);

    // 2. Start with initial scores
    const scores = { ...INITIAL_SCORES };

    // 3. Apply impacts from each answer
    Object.entries(answers).forEach(([questionId, optionId]) => {
        const question = QUESTIONS[questionId];
        if (!question) return;

        const option = question.options.find(o => o.id === optionId);
        if (!option) return;

        // Apply score adjustments
        if (option.impacts) {
            option.impacts.forEach(impact => {
                const entity = impact.entity as EntityType;
                if (scores[entity] !== undefined) {
                    scores[entity] += impact.score;
                }
            });
        }
    });

    return scores;
}
