/**
 * Test the Agent Core Functionality
 * Run with: npx tsx scripts/test-agent.ts
 */

import 'dotenv/config';
import { createOrchestrator } from '../src/lib/agent/orchestrator';
import { logger } from '../src/lib/agent/logger';

async function testAgent() {
    console.log('🚀 Testing Agentic Architecture...\n');

    const orchestrator = createOrchestrator(10, 0.75);

    // Test Scenario: Solo Founder looking for simple setup
    const testInputs = [
        "I want to start a business",
        "Just me, I'm a solo founder",
        "I'm a freelance consultant",
        "I'll bootstrap with my own money",
        "Low risk, mostly service work",
    ];

    let state;

    for (const input of testInputs) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`👤 USER: ${input}`);
        console.log(`${'='.repeat(60)}\n`);

        const response = await orchestrator.processMessage(input, state);
        state = response.state;

        console.log(`🤖 AGENT: ${response.message}\n`);

        if (response.debugInfo) {
            console.log('🔍 DEBUG INFO:');
            console.log('  Thought:', response.debugInfo.thought?.reasoning);
            console.log('  Action:', response.debugInfo.action?.type);
            console.log('  Observation:', response.debugInfo.observation?.impact);
        }

        // Check if complete
        if (state.nextAction === 'complete') {
            console.log('\n✅ Recommendation complete!');
            break;
        }
    }

    // Print statistics
    console.log('\n' + '='.repeat(60));
    console.log('📊 STATISTICS');
    console.log('='.repeat(60));
    const stats = logger.getStats();
    console.log(JSON.stringify(stats, null, 2));
}

testAgent().catch(console.error);
