/**
 * Tool Execution Framework
 * Handles tool calling, result aggregation, and observability
 */

import { AgentState } from '../types';
import { logger } from '../logger';
import { agentTools } from './index';

export interface ToolCall {
    toolName: keyof typeof agentTools;
    parameters: Record<string, any>;
}

export interface ToolResult {
    toolName: string;
    success: boolean;
    result: any;
    duration: number;
    error?: string;
}

/**
 * Execute a single tool with timing and error handling
 */
export async function executeTool(
    call: ToolCall,
    state: AgentState
): Promise<ToolResult> {
    const startTime = Date.now();

    try {
        const tool = agentTools[call.toolName];

        if (!tool) {
            throw new Error(`Unknown tool: ${call.toolName}`);
        }

        logger.action(state.sessionId, {
            event: 'tool_call',
            tool: call.toolName,
            parameters: call.parameters,
        });

        // Execute the tool with state context
        const result = await tool.execute(call.parameters, { state });
        const duration = Date.now() - startTime;

        logger.observation(state.sessionId, {
            event: 'tool_result',
            tool: call.toolName,
            success: result.success,
            duration,
        });

        return {
            toolName: call.toolName,
            success: true,
            result,
            duration,
        };
    } catch (error: any) {
        const duration = Date.now() - startTime;

        logger.error(state.sessionId, {
            event: 'tool_error',
            tool: call.toolName,
            error: error.message,
            duration,
        });

        return {
            toolName: call.toolName,
            success: false,
            result: null,
            duration,
            error: error.message,
        };
    }
}

/**
 * Execute multiple tools in sequence
 */
export async function executeTools(
    calls: ToolCall[],
    state: AgentState
): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const call of calls) {
        const result = await executeTool(call, state);
        results.push(result);

        // If a critical tool fails, stop execution
        if (!result.success && call.toolName === 'update_scores') {
            logger.error(state.sessionId, {
                event: 'tool_chain_stopped',
                reason: 'Critical tool failed',
            });
            break;
        }
    }

    return results;
}

/**
 * Aggregate tool results into actionable summary
 */
export function aggregateResults(results: ToolResult[]): {
    success: boolean;
    summary: string;
    data: Record<string, any>;
} {
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    if (successfulResults.length === 0) {
        return {
            success: false,
            summary: 'All tools failed to execute',
            data: { errors: failedResults.map(r => r.error) },
        };
    }

    // Combine data from all successful tools
    const combinedData: Record<string, any> = {};
    successfulResults.forEach(result => {
        combinedData[result.toolName] = result.result;
    });

    const summary = `Executed ${successfulResults.length}/${results.length} tools successfully`;

    return {
        success: true,
        summary,
        data: combinedData,
    };
}

/**
 * Get tool execution statistics
 */
export function getToolStats(results: ToolResult[]): {
    totalCalls: number;
    successRate: number;
    avgDuration: number;
    toolUsage: Record<string, number>;
} {
    const totalCalls = results.length;
    const successCount = results.filter(r => r.success).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const toolUsage: Record<string, number> = {};

    results.forEach(r => {
        toolUsage[r.toolName] = (toolUsage[r.toolName] || 0) + 1;
    });

    return {
        totalCalls,
        successRate: totalCalls > 0 ? successCount / totalCalls : 0,
        avgDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
        toolUsage,
    };
}
