export type EntityType =
    | "Private Limited Company"
    | "LLP"
    | "OPC"
    | "Partnership Firm"
    | "Sole Proprietorship"
    | "Public Limited Company"
    | "Section 8 Company"
    | "Trust"
    | "Society";

export interface ScoreImpact {
    entity: EntityType;
    score: number;
}

export interface Option {
    id: string;
    text: string; // The text shown to user / used for matching
    impacts: ScoreImpact[];
    nextQuestionId?: string; // If this option routes to a specific next Q
    isHardGate?: boolean; // If true, this option forces specific logic (e.g. Foreign Investment -> Pvt Ltd)
    hardGateEntity?: EntityType; // The entity forced by hard gate
}

export interface Question {
    id: string;
    text: string;
    options: Option[];
    explanation?: string; // Optional context for the AI to answer "Why?"
}

export interface AgentState {
    currentQuestionId: string;
    answers: Record<string, string>; // questionId -> optionId
    scores: Record<EntityType, number>;
    isComplete: boolean;
    recommendedEntity?: EntityType;
    confidenceScore?: number;
    history: { role: "user" | "assistant" | "system"; content: string }[];
}

export const INITIAL_SCORES: Record<EntityType, number> = {
    "Private Limited Company": 0,
    "LLP": 0,
    "OPC": 0,
    "Partnership Firm": 0,
    "Sole Proprietorship": 0,
    "Public Limited Company": 0,
    "Section 8 Company": 0,
    "Trust": 0,
    "Society": 0,
};
