/**
 * Test Production Hardening Features
 * Run with: npx tsx scripts/test-hardening.ts
 */

import 'dotenv/config';
import {
    checkGuardrails,
    requiresHumanApproval,
    initializeMetrics,
    updateMetrics,
    createSafeTermination,
    DEFAULT_GUARDRAILS,
} from '../src/lib/agent/guardrails';
import { CircuitBreaker, CircuitState } from '../src/lib/agent/resilience/circuit-breaker';
import { costTracker, performanceMonitor } from '../src/lib/agent/monitoring';
import { initializeAgentState } from '../src/lib/agent/state';

async function testHardening() {
    console.log('🛡️  Testing Production Hardening Features...\n');

    // Test 1: Guardrails
    console.log('='.repeat(60));
    console.log('TEST 1: Guardrails - Iteration Limit');
    console.log('='.repeat(60));

    let state = initializeAgentState();
    state.iterationCount = 10; // At limit

    const metrics = initializeMetrics();
    const violation = checkGuardrails(state, metrics);

    console.log(`✅ Violated: ${violation.violated}`);
    console.log(`📛 Type: ${violation.type}`);
    console.log(`💬 Message: ${violation.message}`);

    if (violation.violated && violation.type) {
        const termination = createSafeTermination(violation.type, violation.message, state);
        console.log(`\n🛑 Safe Termination Response:`);
        console.log(`   ${termination.substring(0, 100)}...`);
    }
    console.log();

    // Test 2: Cost Tracking
    console.log('='.repeat(60));
    console.log('TEST 2: Cost Tracking');
    console.log('='.repeat(60));

    const sessionId = 'test-session-123';
    costTracker.initSession(sessionId);

    // Simulate LLM calls
    costTracker.trackCall(sessionId, 'llama-3.3-70b-versatile', 500, 200);
    costTracker.trackCall(sessionId, 'llama-3.3-70b-versatile', 600, 300);
    costTracker.trackCall(sessionId, 'gpt-4o-mini', 400, 150);

    const costMetrics = costTracker.getMetrics(sessionId);
    console.log(`✅ Total Tokens: ${costMetrics?.totalTokens}`);
    console.log(`💰 Total Cost: $${costMetrics?.totalCost.toFixed(4)}`);
    console.log(`📊 Requests: ${costMetrics?.requestCount}`);
    console.log(`🤖 Models Used:`, costMetrics?.modelUsage);
    console.log();

    // Test 3: Circuit Breaker
    console.log('='.repeat(60));
    console.log('TEST 3: Circuit Breaker');
    console.log('='.repeat(60));

    const breaker = new CircuitBreaker('test-llm', {
        failureThreshold: 3,
        timeout: 1000,
    });

    console.log(`Initial State: ${breaker.getState()}`);

    // Simulate failures
    for (let i = 0; i < 3; i++) {
        try {
            await breaker.execute(async () => {
                throw new Error('LLM Error');
            });
        } catch (e) {
            console.log(`  Failure ${i + 1} recorded`);
        }
    }

    console.log(`After 3 failures: ${breaker.getState()}`);

    // Try to execute with open circuit
    try {
        await breaker.execute(async () => 'success');
    } catch (e: any) {
        console.log(`❌ Circuit OPEN - Request blocked: ${e.message}`);
    }

    // Wait for timeout and test half-open
    console.log(`Waiting 1s for timeout...`);
    await new Promise(resolve => setTimeout(resolve, 1100));

    try {
        const result = await breaker.execute(async () => 'success');
        console.log(`✅ Circuit HALF_OPEN -> CLOSED: ${result}`);
    } catch (e) {
        console.log(`Still failing...`);
    }

    console.log(`Final State: ${breaker.getState()}`);
    console.log();

    // Test 4: Human Approval Check
    console.log('='.repeat(60));
    console.log('TEST 4: Human Approval Check');
    console.log('='.repeat(60));

    // Low confidence scenario
    state.currentHypotheses[0].confidence = 0.45;
    const approval = requiresHumanApproval(state);

    console.log(`✅ Requires Approval: ${approval.required}`);
    console.log(`📝 Reason: ${approval.reason}`);
    console.log();

    // Test 5: Performance Monitoring
    console.log('='.repeat(60));
    console.log('TEST 5: Performance Monitoring');
    console.log('='.repeat(60));

    performanceMonitor.reset();
    performanceMonitor.trackResponse(150, true);
    performanceMonitor.trackResponse(200, true);
    performanceMonitor.trackResponse(180, true);
    performanceMonitor.trackResponse(5000, false); // Slow failure

    const perfMetrics = performanceMonitor.getMetrics();
    console.log(`⏱️  Avg Response: ${perfMetrics.avgResponseTime.toFixed(0)}ms`);
    console.log(`📈 P95 Response: ${perfMetrics.p95ResponseTime.toFixed(0)}ms`);
    console.log(`✅ Success Rate: ${(perfMetrics.successRate * 100).toFixed(1)}%`);
    console.log(`❌ Error Rate: ${(perfMetrics.errorRate * 100).toFixed(1)}%`);
    console.log();

    // Test 6: Budget Enforcement
    console.log('='.repeat(60));
    console.log('TEST 6: Budget Enforcement');
    console.log('='.repeat(60));

    let budgetMetrics = initializeMetrics();
    budgetMetrics = updateMetrics(budgetMetrics, 5000, 0.003);
    budgetMetrics = updateMetrics(budgetMetrics, 3000, 0.002);
    budgetMetrics.costAccumulated = 0.51; // Exceed $0.50 limit

    const budgetViolation = checkGuardrails(state, budgetMetrics);
    console.log(`✅ Budget Violated: ${budgetViolation.violated}`);
    console.log(`💸 Type: ${budgetViolation.type}`);
    console.log(`💰 Accumulated: $${budgetMetrics.costAccumulated.toFixed(2)}`);
    console.log(`🚫 Limit: $${DEFAULT_GUARDRAILS.maxCostPerSession.toFixed(2)}`);
    console.log();

    console.log('='.repeat(60));
    console.log('✅ ALL HARDENING TESTS COMPLETE');
    console.log('='.repeat(60));
}

testHardening().catch(console.error);
