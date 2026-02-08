/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Legal Entity Suggestor V2 - Example Usage
 * Demonstrates how to use the AI-driven agent
 */

import {
    processLegalAgentV2Message,
    resetLegalAgentV2Session,
    getLegalAgentV2State,
} from '@/app/actions';
import { nanoid } from 'nanoid';

// Example 1: Complete conversation flow
async function exampleTechStartup() {
    const sessionId = nanoid();

    console.log('=== Tech Startup Example ===\n');

    // User's first message
    let result = await processLegalAgentV2Message(
        "I'm building a SaaS product and want to raise VC funding",
        sessionId
    );
    console.log('AI:', result.response);
    console.log('Profile:', result.updated_profile);
    console.log('Completeness:', result.thoughtProcess?.completeness_score, '%\n');

    // User provides co-founder info
    result = await processLegalAgentV2Message(
        "I have 2 co-founders",
        sessionId
    );
    console.log('AI:', result.response);
    console.log('Completeness:', result.thoughtProcess?.completeness_score, '%\n');

    // User provides NRI info
    result = await processLegalAgentV2Message(
        "No, we're all Indian residents",
        sessionId
    );
    console.log('AI:', result.response);
    console.log('Is Complete:', result.isComplete);

    if (result.recommendation) {
        console.log('\nFinal Recommendation:', result.recommendation.entity);
        console.log('Confidence:', result.recommendation.confidence, '%');
        console.log('Reasoning:', result.recommendation.reasoning);
    }
}

// Example 2: Contradiction detection
async function exampleContradiction() {
    const sessionId = nanoid();

    console.log('\n=== Contradiction Detection Example ===\n');

    let result = await processLegalAgentV2Message(
        "I want a sole proprietorship",
        sessionId
    );
    console.log('AI:', result.response);

    result = await processLegalAgentV2Message(
        "I'll need angel investors next year",
        sessionId
    );
    console.log('AI:', result.response);
    console.log('Contradictions:', result.thoughtProcess?.contradictions);
}

// Example 3: Hard constraint (Fintech)
async function exampleHardConstraint() {
    const sessionId = nanoid();

    console.log('\n=== Hard Constraint Example (Fintech) ===\n');

    const result = await processLegalAgentV2Message(
        "I'm starting an NBFC for lending money",
        sessionId
    );
    console.log('AI:', result.response);
    console.log('Profile:', result.updated_profile);
    console.log('Analysis:', result.thoughtProcess?.analysis);
}

// Example 4: Ambiguous input
async function exampleAmbiguousInput() {
    const sessionId = nanoid();

    console.log('\n=== Ambiguous Input Example ===\n');

    const result = await processLegalAgentV2Message(
        "I want to make money",
        sessionId
    );
    console.log('AI:', result.response);
    console.log('Missing Factors:', result.thoughtProcess?.missing_critical_factors);
}

// Example 5: Professional services (LLP preference)
async function exampleProfessionalServices() {
    const sessionId = nanoid();

    console.log('\n=== Professional Services Example ===\n');

    const result = await processLegalAgentV2Message(
        "I'm a CA starting a consultancy with 2 partners",
        sessionId
    );
    console.log('AI:', result.response);
    console.log('Profile:', result.updated_profile);
}

// Run examples (comment out as needed)
async function runExamples() {
    try {
        await exampleTechStartup();
        // await exampleContradiction();
        // await exampleHardConstraint();
        // await exampleAmbiguousInput();
        // await exampleProfessionalServices();
    } catch (error) {
        console.error('Error running examples:', error);
    }
}

// Uncomment to run:
// runExamples();
