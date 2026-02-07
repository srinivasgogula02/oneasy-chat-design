/**
 * Logging and Observability Infrastructure
 * Provides comprehensive logging for agent operations
 */

import { AgentLogEvent, LogLevel } from './types';

class AgentLogger {
    private logs: AgentLogEvent[] = [];
    private enableConsole: boolean;
    private logLevel: LogLevel;

    constructor(enableConsole: boolean = true, logLevel: LogLevel = 'info') {
        this.enableConsole = enableConsole;
        this.logLevel = logLevel;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }

    private log(event: AgentLogEvent, level: LogLevel = 'info') {
        this.logs.push(event);

        if (this.enableConsole && this.shouldLog(level)) {
            const emoji = {
                thought: '🤔',
                action: '⚡',
                observation: '👁️',
                reflection: '🔄',
                error: '❌',
                recommendation: '🎯',
            }[event.event] || '📝';

            console.log(
                `${emoji} [${event.event.toUpperCase()}]`,
                `Session: ${event.sessionId.slice(0, 8)}...`,
                event.data
            );

            if (event.metadata) {
                console.log('  Metadata:', event.metadata);
            }
        }
    }

    thought(sessionId: string, data: any, metadata?: any) {
        this.log(
            {
                sessionId,
                timestamp: new Date(),
                event: 'thought',
                data,
                metadata,
            },
            'debug'
        );
    }

    action(sessionId: string, data: any, metadata?: any) {
        this.log(
            {
                sessionId,
                timestamp: new Date(),
                event: 'action',
                data,
                metadata,
            },
            'info'
        );
    }

    observation(sessionId: string, data: any, metadata?: any) {
        this.log(
            {
                sessionId,
                timestamp: new Date(),
                event: 'observation',
                data,
                metadata,
            },
            'debug'
        );
    }

    reflection(sessionId: string, data: any, metadata?: any) {
        this.log(
            {
                sessionId,
                timestamp: new Date(),
                event: 'reflection',
                data,
                metadata,
            },
            'info'
        );
    }

    recommendation(sessionId: string, data: any, metadata?: any) {
        this.log(
            {
                sessionId,
                timestamp: new Date(),
                event: 'recommendation',
                data,
                metadata,
            },
            'info'
        );
    }

    error(sessionId: string, data: any, metadata?: any) {
        this.log(
            {
                sessionId,
                timestamp: new Date(),
                event: 'error',
                data,
                metadata,
            },
            'error'
        );
    }

    // Get all logs for a session
    getSessionLogs(sessionId: string): AgentLogEvent[] {
        return this.logs.filter(log => log.sessionId === sessionId);
    }

    // Get logs as JSON for export
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    // Clear all logs (use with caution)
    clearLogs() {
        this.logs = [];
    }

    // Get statistics
    getStats() {
        const eventCounts: Record<string, number> = {};
        let totalCost = 0;
        let totalLatency = 0;
        let countWithMetrics = 0;

        this.logs.forEach(log => {
            eventCounts[log.event] = (eventCounts[log.event] || 0) + 1;

            if (log.metadata?.cost) {
                totalCost += log.metadata.cost;
            }

            if (log.metadata?.latency) {
                totalLatency += log.metadata.latency;
                countWithMetrics++;
            }
        });

        return {
            totalLogs: this.logs.length,
            eventCounts,
            totalCost,
            averageLatency: countWithMetrics > 0 ? totalLatency / countWithMetrics : 0,
        };
    }
}

// Singleton instance
export const logger = new AgentLogger(
    process.env.NODE_ENV === 'development',
    (process.env.LOG_LEVEL as LogLevel) || 'info'
);

// Helper to measure execution time
export async function withTiming<T>(
    fn: () => Promise<T>,
    label: string
): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;

    console.log(`⏱️  ${label}: ${duration}ms`);

    return { result, duration };
}
