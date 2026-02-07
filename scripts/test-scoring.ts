// Test script to verify scoring logic for all founder/NRI combinations
// Run with: npx tsx scripts/test-scoring.ts

import { QUESTIONS } from '../src/lib/legal-agent/data';
import { INITIAL_SCORES, EntityType } from '../src/lib/legal-agent/types';

type Scores = Record<EntityType, number>;

function applyImpacts(scores: Scores, optionId: string, questionId: string): Scores {
    const question = QUESTIONS[questionId];
    if (!question) return scores;

    const option = question.options.find(o => o.id === optionId);
    if (!option) return scores;

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

// Test scenarios for Q5B + Q5B_NRI_SOLO/MULTI combinations (focused on new logic)
const testCases = [
    {
        name: "Solo Founder + Resident",
        path: [
            { questionId: "Q5B", optionId: "JUST_ME" },
            { questionId: "Q5B_NRI_SOLO", optionId: "NO_RESIDENT" },
        ],
        expected: {
            topEntities: ["Sole Proprietorship", "OPC"],
            zeroEntities: [], // These should NOT be zero
        }
    },
    {
        name: "Solo Founder + NRI",
        path: [
            { questionId: "Q5B", optionId: "JUST_ME" },
            { questionId: "Q5B_NRI_SOLO", optionId: "YES_NRI" },
        ],
        expected: {
            topEntities: ["OPC"], // Prop penalized, OPC gets +30 from Q5B and +10 from NRI
            zeroEntities: ["Sole Proprietorship"], // Should be 0 due to -1000
        }
    },
    {
        name: "Two Partners + Resident",
        path: [
            { questionId: "Q5B", optionId: "TWO_PEOPLE" },
            { questionId: "Q5B_NRI_MULTI", optionId: "NO_RESIDENT" },
        ],
        expected: {
            topEntities: ["LLP", "Private Limited Company", "Partnership Firm", "Public Limited Company"],
            zeroEntities: ["Sole Proprietorship", "OPC"], // Should be 0
        }
    },
    {
        name: "Two Partners + NRI",
        path: [
            { questionId: "Q5B", optionId: "TWO_PEOPLE" },
            { questionId: "Q5B_NRI_MULTI", optionId: "YES_NRI" },
        ],
        expected: {
            topEntities: ["Private Limited Company", "LLP", "Public Limited Company"], // +30 from Q5B and +30 from NRI
            zeroEntities: ["Sole Proprietorship", "OPC"], // Should be 0
        }
    },
    {
        name: "Small Team (3-5) + Resident",
        path: [
            { questionId: "Q5B", optionId: "SMALL_TEAM" },
            { questionId: "Q5B_NRI_MULTI", optionId: "NO_RESIDENT" },
        ],
        expected: {
            topEntities: ["Private Limited Company", "LLP", "Partnership Firm", "Public Limited Company"],
            zeroEntities: ["Sole Proprietorship", "OPC"],
        }
    },
    {
        name: "Large Group (6+) + NRI",
        path: [
            { questionId: "Q5B", optionId: "LARGE_GROUP" },
            { questionId: "Q5B_NRI_MULTI", optionId: "YES_NRI" },
        ],
        expected: {
            topEntities: ["Private Limited Company", "Public Limited Company", "LLP"],
            zeroEntities: ["Sole Proprietorship", "OPC"],
        }
    },
];

console.log("=".repeat(60));
console.log("SCORING LOGIC TEST - Founder & NRI Combinations");
console.log("=".repeat(60));
console.log("");

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    let scores: Scores = { ...INITIAL_SCORES };

    // Apply each step in the path
    testCase.path.forEach(step => {
        scores = applyImpacts(scores, step.optionId, step.questionId);
    });

    // Clamp scores (as engine does)
    const finalScores = clampScores(scores);
    const top3 = getTop3(finalScores);

    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log("-".repeat(40));

    // Check if expected top entities are in top 3
    const topEntityNames = top3.map(t => t.entity);
    const hasExpectedTop = testCase.expected.topEntities.some(e => topEntityNames.includes(e as EntityType));

    // Check if zero entities are actually zero
    const zeroCheck = testCase.expected.zeroEntities.every(e => finalScores[e as EntityType] === 0);

    console.log("Top 3 Entities:");
    top3.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.entity}: ${t.score} points`);
    });

    console.log("");
    console.log("Zero Check:");
    testCase.expected.zeroEntities.forEach(e => {
        const score = finalScores[e as EntityType];
        const status = score === 0 ? "✅" : "❌";
        console.log(`  ${status} ${e}: ${score} (expected: 0)`);
    });

    const testPassed = hasExpectedTop && zeroCheck;
    console.log("");
    console.log(testPassed ? "✅ PASSED" : "❌ FAILED");
    console.log("");

    if (testPassed) passed++;
    else failed++;
});

console.log("=".repeat(60));
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log("=".repeat(60));

// Also print full score breakdown for debugging
console.log("");
console.log("DETAILED SCORE BREAKDOWN (Solo + NRI case):");
let debugScores: Scores = { ...INITIAL_SCORES };
debugScores = applyImpacts(debugScores, "JUST_ME", "Q5B");
console.log("After Q5B (Just Me):", debugScores);
debugScores = applyImpacts(debugScores, "YES_NRI", "Q5B_NRI");
console.log("After Q5B_NRI (Yes NRI):", debugScores);
console.log("After Clamping:", clampScores(debugScores));
