import { AgentState, EntityType, INITIAL_SCORES } from "./types";
import { QUESTIONS, getQuestion } from "./data";

export function getNextStep(currentState: AgentState, message: string, classificationId: string): AgentState {
    const currentQ = getQuestion(currentState.currentQuestionId);

    // Safety: If no current question, mark complete
    if (!currentQ) {
        return {
            ...currentState,
            isComplete: true,
            recommendedEntity: getTopRecommendation(currentState.scores).entity,
            confidenceScore: getTopRecommendation(currentState.scores).confidence,
        };
    }

    // 1. Update State with new answer
    const newState: AgentState = {
        ...currentState,
        answers: { ...currentState.answers, [currentState.currentQuestionId]: classificationId },
        scores: { ...currentState.scores },
    };

    // 2. Calculate New Scores
    const selectedOption = currentQ.options.find(opt => opt.id === classificationId);

    if (selectedOption) {
        selectedOption.impacts.forEach(impact => {
            newState.scores[impact.entity] = (newState.scores[impact.entity] || 0) + impact.score;
        });

        // Check for hard gates (e.g., Fintech -> Pvt Ltd mandatory)
        if (selectedOption.isHardGate && selectedOption.hardGateEntity) {
            newState.isComplete = true;
            newState.recommendedEntity = selectedOption.hardGateEntity;
            newState.confidenceScore = 100;
            return newState;
        }
    }

    // 3. Determine Next Question
    let nextQId = selectedOption?.nextQuestionId || "";

    // Check if next question exists, if not fallback to sequence
    if (nextQId && nextQId !== "COMPLETE" && !getQuestion(nextQId)) {
        console.warn(`Question ${nextQId} not found, falling back`);
        nextQId = "";
    }

    // 4. Check for Completion
    if (!nextQId || nextQId === "COMPLETE") {
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
    let secondMaxScore = -Infinity;

    (Object.keys(scores) as EntityType[]).forEach(entity => {
        const score = scores[entity];
        if (score > maxScore) {
            secondMaxScore = maxScore;
            maxScore = score;
            bestEntity = entity;
        } else if (score > secondMaxScore) {
            secondMaxScore = score;
        }
    });

    // Calculate confidence based on lead over second place
    let confidence = 75; // Default
    if (maxScore > 0) {
        const lead = maxScore - secondMaxScore;
        if (lead > 50) confidence = 95;
        else if (lead > 30) confidence = 88;
        else if (lead > 15) confidence = 82;
        else if (lead > 5) confidence = 75;
        else confidence = 68;
    }

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
