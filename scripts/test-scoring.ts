// Test script to verify scoring logic for ALL end-to-end combinations
// Run with: npx tsx scripts/test-scoring.ts

import { QUESTIONS } from '../src/lib/legal-agent/data';
import { INITIAL_SCORES, EntityType } from '../src/lib/legal-agent/types';

type Scores = Record<EntityType, number>;

function applyImpacts(scores: Scores, optionId: string, questionId: string): Scores {
    const question = QUESTIONS[questionId];
    if (!question) return scores;

    // Check if option exists in the question
    const option = question.options.find(o => o.id === optionId);
    if (!option) {
        console.error(`ERROR: Option ${optionId} not found in question ${questionId}`);
        return scores;
    }

    const newScores = { ...scores };
    option.impacts.forEach(impact => {
        newScores[impact.entity] = (newScores[impact.entity] || 0) + impact.score;
    });

    return newScores;
}

function clampScores(scores: Scores): Scores {
    const clamped = { ...scores };
    (Object.keys(clamped) as EntityType[]).forEach(entity => {
        clamped[entity] = Math.max(0, clamped[entity]);
    });
    return clamped;
}

function getTop3(scores: Scores): { entity: EntityType; score: number }[] {
    return (Object.entries(scores) as [EntityType, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([entity, score]) => ({ entity, score }));
}

// Define comprehensive test scenarios
const testScenarios = [
    {
        name: "Scenario 1: Solo Freelancer (No Risk, Low Income, No NRI)",
        path: [
            { q: "Q1", o: "BUSINESS" },
            { q: "Q2B", o: "FREELANCER" },
            { q: "Q3B", o: "EARNING" },
            { q: "Q4B", o: "THIS_WEEK" },
            { q: "Q5B", o: "JUST_ME" },
            { q: "Q5B_NRI_SOLO", o: "NO_RESIDENT" },
            { q: "Q6B", o: "NOT_WORRIED" },
            { q: "Q7B", o: "OWN_MONEY" },
            { q: "Q8B", o: "UNDER_20L" },

            { q: "Q10B", o: "INDIA_ONLY" },
            { q: "Q11B", o: "ONE_LOCATION" },
            { q: "Q12B", o: "PERSONAL" }
        ],
        expectedTop: "Sole Proprietorship"
    },
    {
        name: "Scenario 2: Tech Startup (High Growth, Team, Investors, Resident)",
        path: [
            { q: "Q1", o: "BUSINESS" },
            { q: "Q2B", o: "BUILDING_COMPANY" },
            { q: "Q3B", o: "IDEA" },
            { q: "Q4B", o: "FEW_WEEKS" },
            { q: "Q5B", o: "SMALL_TEAM" },
            { q: "Q5B_NRI_MULTI", o: "NO_RESIDENT" },
            { q: "Q6B", o: "MUST_PROTECT" },
            { q: "Q7B", o: "INVESTORS" },
            { q: "Q8B", o: "1CR_5CR" },

            { q: "Q10B", o: "FOREIGN_CLIENTS" },
            { q: "Q11B", o: "MULTIPLE_BRANCHES" },
            { q: "Q12B", o: "SELL" }
        ],
        expectedTop: "Private Limited Company"
    },
    {
        name: "Scenario 3: Solo Founder + NRI (Should favor OPC over Prop)",
        path: [
            { q: "Q1", o: "BUSINESS" },
            { q: "Q2B", o: "SOLO_SERVICE" },
            { q: "Q3B", o: "TESTING" },
            { q: "Q4B", o: "NO_RUSH" },
            { q: "Q5B", o: "JUST_ME" },
            { q: "Q5B_NRI_SOLO", o: "YES_NRI" }, // KEY FACTOR
            { q: "Q6B", o: "MUST_PROTECT" },
            { q: "Q7B", o: "OWN_MONEY" },
            { q: "Q8B", o: "20L_1CR" },

            { q: "Q10B", o: "INDIA_ONLY" },
            { q: "Q11B", o: "ONE_LOCATION" },
            { q: "Q12B", o: "NOT_SURE_EXIT" }
        ],
        expectedTop: "OPC",
        forbidden: "Sole Proprietorship"
    },
    {
        name: "Scenario 4: Two Partners + NRI (Should favor Pvt Ltd/LLP over Prop/OPC)",
        path: [
            { q: "Q1", o: "BUSINESS" },
            { q: "Q2B", o: "TRADING" },
            { q: "Q3B", o: "RUNNING_WELL" },
            { q: "Q4B", o: "URGENT" },
            { q: "Q5B", o: "TWO_PEOPLE" },
            { q: "Q5B_NRI_MULTI", o: "YES_NRI" }, // KEY FACTOR
            { q: "Q6B", o: "MUST_PROTECT" },
            { q: "Q7B", o: "BANK_LOAN" },
            { q: "Q8B", o: "20L_1CR" },

            { q: "Q10B", o: "FOREIGN_CLIENTS" },
            { q: "Q11B", o: "MULTIPLE_BRANCHES" },
            { q: "Q12B", o: "FAMILY" }
        ],
        expectedTop: "Private Limited Company", // or LLP
        forbidden: ["Sole Proprietorship", "OPC"]
    },
    {
        name: "Scenario 5: Professional Services (Doctors/CAs) -> LLP Preference",
        path: [
            { q: "Q1", o: "BUSINESS" },
            { q: "Q2B", o: "SOLO_SERVICE" },
            { q: "Q3B", o: "EARNING" },
            { q: "Q4B", o: "FEW_WEEKS" },
            { q: "Q5B", o: "TWO_PEOPLE" },
            { q: "Q5B_NRI_MULTI", o: "NO_RESIDENT" },
            { q: "Q6B", o: "MUST_PROTECT" },
            { q: "Q7B", o: "OWN_MONEY" },
            { q: "Q8B", o: "20L_1CR" },
            // KEY FACTOR
            { q: "Q10B", o: "INDIA_ONLY" },
            { q: "Q11B", o: "ONE_LOCATION" },
            { q: "Q12B", o: "FAMILY" }
        ],
        expectedTop: "LLP"
    },
    {
        name: "Scenario 6: NGO / Charity (Standard)",
        path: [
            { q: "Q1", o: "CHARITY" },
            { q: "Q2C", o: "CHARITABLE" },
            { q: "Q3C", o: "TWO_FOUNDERS" },
            { q: "Q4C", o: "DONATIONS_ONLY" },
            { q: "Q5C", o: "SIMPLE" },
            { q: "Q6C", o: "ONE_STATE" }
        ],
        expectedTop: "Trust"
    },
    {
        name: "Scenario 7: Section 8 Company (High Credibility, Govt Grants)",
        path: [
            { q: "Q1", o: "CHARITY" },
            { q: "Q2C", o: "RESEARCH" },
            { q: "Q3C", o: "FOUR_TO_SIX" },
            { q: "Q4C", o: "GOVT_GRANTS" },
            { q: "Q5C", o: "VERY_IMPORTANT" },
            { q: "Q6C", o: "PAN_INDIA" }
        ],
        expectedTop: "Section 8 Company"
    }
];

console.log("=".repeat(80));
console.log("COMPREHENSIVE SCORING LOGIC TEST");
console.log("=".repeat(80));
console.log("");

let passed = 0;
let failed = 0;

testScenarios.forEach((scenario, index) => {
    let scores: Scores = { ...INITIAL_SCORES };

    // Apply path
    scenario.path.forEach(step => {
        scores = applyImpacts(scores, step.o, step.q);
    });

    const finalScores = clampScores(scores);
    const top3 = getTop3(finalScores);
    const topEntity = top3[0].entity;

    console.log(`Scenario ${index + 1}: ${scenario.name}`);
    console.log("-".repeat(50));

    let scenarioPassed = true;
    let failureReason = "";

    // 1. Check Expected Top Entity
    if (scenario.expectedTop && topEntity !== scenario.expectedTop) {
        // Allow for slightly different top entity if it makes sense (e.g. Pvt Ltd vs LLP sometimes close)
        // But for strict tests, we want exact match. 
        // NOTE: For Scenario 4, we accept Pvt Ltd or LLP.
        if (scenario.name.includes("Scenario 4") && (topEntity === "Private Limited Company" || topEntity === "LLP")) {
            // OK
        } else {
            scenarioPassed = false;
            failureReason += `Expected top: ${scenario.expectedTop}, Got: ${topEntity}. `;
        }
    }

    // 2. Check Forbidden Entities (Must be 0)
    if (scenario.forbidden) {
        const forbiddenList = Array.isArray(scenario.forbidden) ? scenario.forbidden : [scenario.forbidden];
        forbiddenList.forEach(forbidden => {
            if (finalScores[forbidden as EntityType] > 0) {
                scenarioPassed = false;
                failureReason += `Forbidden entity ${forbidden} has score ${finalScores[forbidden as EntityType]}. `;
            }
        });
    }

    console.log(`Result: ${scenarioPassed ? "✅ PASSED" : "❌ FAILED"}`);
    if (!scenarioPassed) {
        console.log(`Reason: ${failureReason}`);
    }

    console.log("Top 3 Scores:");
    top3.forEach((t, i) => console.log(`  ${i + 1}. ${t.entity}: ${t.score}`));

    // Check specific scores for forbidden to be sure
    if (scenario.forbidden) {
        const forbiddenList = Array.isArray(scenario.forbidden) ? scenario.forbidden : [scenario.forbidden];
        forbiddenList.forEach(e => {
            console.log(`  [Check] ${e}: ${finalScores[e as EntityType]}`);
        });
    }

    console.log("");

    if (scenarioPassed) passed++;
    else failed++;
});

console.log("=".repeat(80));
console.log(`FINAL RESULTS: ${passed}/${testScenarios.length} Passed`);
console.log("=".repeat(80));
