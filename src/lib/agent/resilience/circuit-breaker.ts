/**
 * Circuit Breaker Pattern for LLM Calls
 * Prevents cascading failures when LLM is unavailable
 */

import { logger } from '../logger';

/**
 * Circuit breaker states
 */
export enum CircuitState {
    CLOSED = 'CLOSED', // Normal operation
    OPEN = 'OPEN',     // Blocking requests
    HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
    failureThreshold: number; // Number of failures before opening
    successThreshold: number; // Number of successes to close from half-open
    timeout: number; // Time in ms before attempting half-open
    monitoringPeriod: number; // Time window for failure counting
}

/**
 * Default circuit breaker config
 */
const DEFAULT_CONFIG: CircuitBreakerConfig = {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 60000, // 1 minute
    monitoringPeriod: 120000, // 2 minutes
};

/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount: number = 0;
    private successCount: number = 0;
    private lastFailureTime: Date | null = null;
    private config: CircuitBreakerConfig;
    private name: string;

    constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
        this.name = name;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Execute a function with circuit breaker protection
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            // Check if we should transition to half-open
            if (this.shouldAttemptReset()) {
                this.state = CircuitState.HALF_OPEN;
                logger.action('circuit-breaker', {
                    event: 'state_change',
                    circuit: this.name,
                    from: CircuitState.OPEN,
                    to: CircuitState.HALF_OPEN,
                });
            } else {
                const error = new Error(`Circuit breaker [${this.name}] is OPEN`);
                logger.error('circuit-breaker', {
                    event: 'request_blocked',
                    circuit: this.name,
                });
                throw error;
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    /**
     * Record successful execution
     */
    private onSuccess(): void {
        this.failureCount = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;

            if (this.successCount >= this.config.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
                logger.action('circuit-breaker', {
                    event: 'circuit_closed',
                    circuit: this.name,
                });
            }
        }
    }

    /**
     * Record failed execution
     */
    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = new Date();

        if (this.state === CircuitState.HALF_OPEN) {
            // Go back to open on any failure in half-open state
            this.state = CircuitState.OPEN;
            this.successCount = 0;
            logger.error('circuit-breaker', {
                event: 'circuit_reopened',
                circuit: this.name,
            });
        } else if (this.failureCount >= this.config.failureThreshold) {
            this.state = CircuitState.OPEN;
            logger.error('circuit-breaker', {
                event: 'circuit_opened',
                circuit: this.name,
                failureCount: this.failureCount,
            });
        }
    }

    /**
     * Check if enough time has passed to try resetting
     */
    private shouldAttemptReset(): boolean {
        if (!this.lastFailureTime) return false;

        const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
        return timeSinceLastFailure >= this.config.timeout;
    }

    /**
     * Get current state
     */
    getState(): CircuitState {
        return this.state;
    }

    /**
     * Manually reset circuit breaker
     */
    reset(): void {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        logger.action('circuit-breaker', {
            event: 'manual_reset',
            circuit: this.name,
        });
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime,
        };
    }
}

/**
 * Global circuit breakers for different LLM providers
 */
export const llmCircuitBreakers = {
    groq: new CircuitBreaker('groq-llm', {
        failureThreshold: 3,
        timeout: 60000,
    }),
    openai: new CircuitBreaker('openai-llm', {
        failureThreshold: 3,
        timeout: 60000,
    }),
};
