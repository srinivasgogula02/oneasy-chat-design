/**
 * Test Tool System
 * Run with: npx tsx scripts/test-tools.ts
 */

import 'dotenv/config';
import { initializeAgentState, addMessage, addFactor } from '../src/lib/agent/state';
import { executeTool, executeTools, aggregateResults, getToolStats } from '../src/lib/agent/tools/executor';
import { logger } from '../src/lib/agent/logger';

async function testTools() {
    console.log('🔧 Testing Agent Tool System...\n');

    // Initialize state
    let state = initializeAgentState();

    // Simulate conversation
    state = addMessage(state, 'user', 'I want to start a solo consulting business');
    state = addMessage(state, 'assistant', 'Are you starting a for-profit business?');
    state = addMessage(state, 'user', 'Yes, for profit. Just me, solo founder.');

    console.log('📊 Initial State:');
    console.log(`  Session: ${state.sessionId.slice(0, 8)}...`);
    console.log(`  Messages: ${state.conversationHistory.length}`);
    console.log(`  Factors: ${state.gatheredFactors.length}\n`);

    // Test 1: Update Scores Tool
    console.log('='.repeat(60));
    console.log('TEST 1: Update Scores Tool');
    console.log('='.repeat(60));

    const result1 = await executeTool(
        {
            toolName: 'update_scores',
            parameters: {
                userAnswer: 'Yes, for profit. Just me, solo founder.',
                questionContext: 'Are you starting a for-profit business?',
            },
        },
        state
    );

    console.log(`✅ Success: ${result1.success}`);
    console.log(`⏱️  Duration: ${result1.duration}ms`);
    console.log(`📈 Factors Found: ${result1.result?.factorsFound || 0}`);
    console.log(`🎯 Top Entities:`, result1.result?.topEntities);
    console.log();

    // Update state with new factors if successful
    if (result1.success && result1.result?.factors) {
        result1.result.factors.forEach((f: any) => {
            state = addFactor(state, {
                type: f.type,
                value: f.value,
                impact: f.impact,
                confidence: 0.9,
                source: 'test',
            });
        });

        // Update hypotheses if returned
        if (result1.result.updatedHypotheses) {
            state = {
                ...state,
                currentHypotheses: result1.result.updatedHypotheses,
            };
        }
    }

    // Test 2: Analyze Gaps Tool
    console.log('='.repeat(60));
    console.log('TEST 2: Analyze Gaps Tool');
    console.log('='.repeat(60));

    const topConfidence = Math.max(...state.currentHypotheses.map(h => h.confidence));

    const result2 = await executeTool(
        {
            toolName: 'analyze_gaps',
            parameters: {
                currentConfidence: topConfidence,
            },
        },
        state
    );

    console.log(`✅ Success: ${result2.success}`);
    console.log(`❓ Missing Factors: ${result2.result?.missingFactors || 0}`);
    console.log(`📋 Top Gaps:`, result2.result?.topGaps?.slice(0, 2));
    console.log(`💡 Recommendation: ${result2.result?.recommendation}`);
    console.log();

    // Test 3: Validate Recommendation Tool
    console.log('='.repeat(60));
    console.log('TEST 3: Validate Recommendation Tool');
    console.log('='.repeat(60));

    const topEntity = state.currentHypotheses
        .sort((a, b) => b.confidence - a.confidence)[0].entity;

    const result3 = await executeTool(
        {
            toolName: 'validate_recommendation',
            parameters: {
                entity: topEntity,
            },
        },
        state
    );

    console.log(`✅ Success: ${result3.success}`);
    console.log(`🏢 Entity: ${result3.result?.entity}`);
    console.log(`📊 Confidence: ${result3.result?.confidence}`);
    console.log(`✔️  Valid: ${result3.result?.isValid}`);
    console.log(`💬 Recommendation: ${result3.result?.recommendation}`);
    console.log();

    // Test 4: Execute Multiple Tools
    console.log('='.repeat(60));
    console.log('TEST 4: Execute Tool Chain');
    console.log('='.repeat(60));

    const chainResults = await executeTools([
        {
            toolName: 'analyze_gaps',
            parameters: { currentConfidence: topConfidence },
        },
        {
            toolName: 'validate_recommendation',
            parameters: { entity: topEntity },
        },
    ], state);

    const aggregated = aggregateResults(chainResults);
    console.log(`✅ Overall Success: ${aggregated.success}`);
    console.log(`📝 Summary: ${aggregated.summary}`);
    console.log();

    // Statistics
    console.log('='.repeat(60));
    console.log('📊 TOOL EXECUTION STATISTICS');
    console.log('='.repeat(60));

    const allResults = [result1, result2, result3, ...chainResults];
    const stats = getToolStats(allResults);

    console.log(`Total Calls: ${stats.totalCalls}`);
    console.log(`Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`Avg Duration: ${stats.avgDuration.toFixed(0)}ms`);
    console.log(`Tool Usage:`, stats.toolUsage);
    console.log();

    // Logger stats
    console.log('='.repeat(60));
    console.log('📈 LOGGER STATISTICS');
    console.log('='.repeat(60));
    const loggerStats = logger.getStats();
    console.log(JSON.stringify(loggerStats, null, 2));
}

testTools().catch(console.error);
