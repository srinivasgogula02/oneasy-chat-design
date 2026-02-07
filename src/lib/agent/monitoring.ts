/**
 * Cost Tracking and Monitoring
 * Tracks token usage, API costs, and performance metrics
 */

import { logger } from './logger';

/**
 * Cost tracking metrics
 */
export interface CostMetrics {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
    requestCount: number;
    modelUsage: Record<string, number>;
}

/**
 * Model pricing (per 1M tokens)
 */
const MODEL_PRICING = {
    // Groq
    'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
    'llama-3.1-70b-versatile': { input: 0.59, output: 0.79 },

    // OpenAI
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },

    // Fallback
    'default': { input: 0.50, output: 1.00 },
};

/**
 * Global cost tracker
 */
class CostTracker {
    private metrics: Map<string, CostMetrics> = new Map();

    /**
     * Initialize tracking for a session
     */
    initSession(sessionId: string): void {
        this.metrics.set(sessionId, {
            totalTokens: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalCost: 0,
            requestCount: 0,
            modelUsage: {},
        });
    }

    /**
     * Track an LLM call
     */
    trackCall(
        sessionId: string,
        model: string,
        inputTokens: number,
        outputTokens: number
    ): void {
        let metrics = this.metrics.get(sessionId);

        if (!metrics) {
            this.initSession(sessionId);
            metrics = this.metrics.get(sessionId)!;
        }

        // Calculate cost
        const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || MODEL_PRICING.default;
        const inputCost = (inputTokens / 1_000_000) * pricing.input;
        const outputCost = (outputTokens / 1_000_000) * pricing.output;
        const callCost = inputCost + outputCost;

        // Update metrics
        metrics.totalTokens += inputTokens + outputTokens;
        metrics.inputTokens += inputTokens;
        metrics.outputTokens += outputTokens;
        metrics.totalCost += callCost;
        metrics.requestCount += 1;
        metrics.modelUsage[model] = (metrics.modelUsage[model] || 0) + 1;

        logger.observation(sessionId, {
            event: 'llm_cost_tracked',
            model,
            inputTokens,
            outputTokens,
            cost: callCost,
        }, {
            cost: callCost,
        });
    }

    /**
     * Get metrics for a session
     */
    getMetrics(sessionId: string): CostMetrics | null {
        return this.metrics.get(sessionId) || null;
    }

    /**
     * Get total cost across all sessions
     */
    getTotalCost(): number {
        let total = 0;
        for (const metrics of this.metrics.values()) {
            total += metrics.totalCost;
        }
        return total;
    }

    /**
     * Get all session metrics
     */
    getAllMetrics(): Map<string, CostMetrics> {
        return new Map(this.metrics);
    }

    /**
     * Clear session metrics (cleanup)
     */
    clearSession(sessionId: string): void {
        this.metrics.delete(sessionId);
    }

    /**
     * Export metrics as JSON
     */
    exportMetrics(): string {
        const data = Array.from(this.metrics.entries()).map(([sessionId, metrics]) => ({
            sessionId,
            ...metrics,
        }));
        return JSON.stringify(data, null, 2);
    }
}

/**
 * Global cost tracker instance
 */
export const costTracker = new CostTracker();

/**
 * Performance monitoring
 */
export interface PerformanceMetrics {
    avgResponseTime: number;
    p95ResponseTime: number;
    successRate: number;
    errorRate: number;
    throughput: number; // requests per minute
}

/**
 * Performance tracker
 */
class PerformanceMonitor {
    private responseTimes: number[] = [];
    private successCount: number = 0;
    private errorCount: number = 0;
    private startTime: Date = new Date();

    trackResponse(durationMs: number, success: boolean): void {
        this.responseTimes.push(durationMs);

        if (success) {
            this.successCount++;
        } else {
            this.errorCount++;
        }

        // Keep only last 100 responses
        if (this.responseTimes.length > 100) {
            this.responseTimes.shift();
        }
    }

    getMetrics(): PerformanceMetrics {
        const totalRequests = this.successCount + this.errorCount;
        const sorted = [...this.responseTimes].sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);

        const elapsedMinutes = (Date.now() - this.startTime.getTime()) / 60000;

        return {
            avgResponseTime: this.responseTimes.length > 0
                ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
                : 0,
            p95ResponseTime: sorted[p95Index] || 0,
            successRate: totalRequests > 0 ? this.successCount / totalRequests : 0,
            errorRate: totalRequests > 0 ? this.errorCount / totalRequests : 0,
            throughput: elapsedMinutes > 0 ? totalRequests / elapsedMinutes : 0,
        };
    }

    reset(): void {
        this.responseTimes = [];
        this.successCount = 0;
        this.errorCount = 0;
        this.startTime = new Date();
    }
}

/**
 * Global performance monitor
 */
export const performanceMonitor = new PerformanceMonitor();
