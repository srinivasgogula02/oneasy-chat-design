
import { getNextStep, getInitialState } from '../src/lib/legal-agent/engine';
import { QUESTIONS } from '../src/lib/legal-agent/data';

let pathCount = 0;
const entityCounts: Record<string, number> = {};

// Optional: Limit for testing, set to -1 for no limit
const MAX_PATHS = -1;

function traverse(currentState: any, currentPath: { questionId: string; answerId: string; answerText: string }[]) {
    if (MAX_PATHS !== -1 && pathCount >= MAX_PATHS) return;

    if (currentState.isComplete) {
        pathCount++;
        const entity = currentState.recommendedEntity;
        entityCounts[entity] = (entityCounts[entity] || 0) + 1;

        const result = {
            path: currentPath.map(p => `${p.questionId}:${p.answerId}`).join(' -> '),
            recommendedEntity: entity,
            confidenceScore: currentState.confidenceScore,
            finalScores: currentState.scores
        };

        // Write to stdout
        console.log(JSON.stringify(result));

        if (pathCount % 50000 === 0) {
            console.error(`Processed ${pathCount} paths...`);
        }
        return;
    }

    const currentQId = currentState.currentQuestionId;
    const question = QUESTIONS[currentQId];

    if (!question) {
        console.error(`Question ${currentQId} not found!`);
        return;
    }

    for (const option of question.options) {
        const nextState = getNextStep(currentState, "", option.id);
        traverse(nextState, [
            ...currentPath,
            { questionId: currentQId, answerId: option.id, answerText: option.text }
        ]);
    }
}

console.error("Starting traversal...");
const initialState = getInitialState();
traverse(initialState, []);

console.error(`Traversal complete. Found ${pathCount} unique paths.`);
console.error(JSON.stringify(entityCounts, null, 2));

