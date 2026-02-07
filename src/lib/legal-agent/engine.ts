import { AgentState, EntityType, INITIAL_SCORES } from "./types";
import { QUESTIONS } from "./data";

export function getNextStep(currentState: AgentState, message: string, classificationId: string): AgentState {
    const currentQ = QUESTIONS[currentState.currentQuestionId];
    if (!currentQ) return currentState;

    // 1. Update State with new answer
    const newState = {
        ...currentState,
        answers: { ...currentState.answers, [currentState.currentQuestionId]: classificationId },
    };

    // 2. Calculate New Scores
    const selectedOption = currentQ.options.find(opt => opt.id === classificationId);
    if (selectedOption) {
        selectedOption.impacts.forEach(impact => {
            newState.scores[impact.entity] = (newState.scores[impact.entity] || 0) + impact.score;
        });

        // Check for hard gates (e.g., Education -> Society/Trust)
        if (selectedOption.isHardGate && selectedOption.hardGateEntity) {
            newState.isComplete = true;
            newState.recommendedEntity = selectedOption.hardGateEntity;
            newState.confidenceScore = 100; // Hard rules are 100% confident
            return newState;
        }
    }

    // 3. Determine Next Question
    let nextQId = "";

    // Routing Logic
    if (selectedOption?.nextQuestionId) {
        nextQId = selectedOption.nextQuestionId;
    } else {
        // Default flow sequence
        const sequence = ["Q1", "Q2B", "Q3B", "Q4B", "Q5B", "Q6B", "Q7B", "Q8B", "Q9B", "Q10B", "Q11B", "Q12B"];
        const currentIndex = sequence.indexOf(currentState.currentQuestionId);
        if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
            nextQId = sequence[currentIndex + 1];
        }
    }

    // 4. Check for Completion
    if (!nextQId) {
        newState.isComplete = true;
        const { entity, confidence } = getTopRecommendation(newState.scores);
        newState.recommendedEntity = entity;
        newState.confidenceScore = confidence;
    } else {
        newState.currentQuestionId = nextQId;
    }

    return newState;
}

function getTopRecommendation(scores: Record<EntityType, number>): { entity: EntityType, confidence: number } {
    let bestEntity: EntityType = "Private Limited Company";
    let maxScore = -Infinity;
    let totalScore = 0;

    (Object.keys(scores) as EntityType[]).forEach(entity => {
        const score = scores[entity];
        // Filter out negative scenarios effectively by not considering them for max
        if (score > maxScore) {
            maxScore = score;
            bestEntity = entity;
        }
        if (score > 0) totalScore += score;
    });

    // Calculate distinctiveness/confidence (simple heuristic)
    // Determine mostly by how much it leads the runner-up or max potential
    // For simplicity, we cap at 98% and map score range to confidence
    const confidence = Math.min(98, Math.max(70, Math.round((maxScore / 250) * 100)));

    return { entity: bestEntity, confidence };
}

export function getInitialState(): AgentState {
    return {
        currentQuestionId: "Q1",
        answers: {},
        scores: { ...INITIAL_SCORES },
        isComplete: false,
        history: [],
    };
}
