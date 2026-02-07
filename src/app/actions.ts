"use server";

import Groq from "groq-sdk";
import { QUESTIONS, getQuestion } from "@/lib/legal-agent/data";
import { getNextStep, getInitialState } from "@/lib/legal-agent/engine";
import { AgentState } from "@/lib/legal-agent/types";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function processMessage(message: string, currentState: AgentState | null) {
    try {
        // 1. Handle first message - Initialize and potentially skip Q1 if user already stated intent
        if (!currentState) {
            const lowerMsg = message.toLowerCase();

            // Check if user already indicated business or charity intent
            const businessKeywords = ["business", "profit", "startup", "company", "money", "earn", "sell", "product", "service", "freelance", "trading"];
            const charityKeywords = ["charity", "non-profit", "nonprofit", "ngo", "trust", "society", "help people", "social"];

            const indicatesBusiness = businessKeywords.some(kw => lowerMsg.includes(kw));
            const indicatesCharity = charityKeywords.some(kw => lowerMsg.includes(kw));

            if (indicatesBusiness || indicatesCharity) {
                // User already told us their intent - skip Q1 and go to Q2
                const initialState = getInitialState();
                const q1 = getQuestion("Q1");
                const selectedOption = indicatesBusiness
                    ? q1?.options.find(o => o.id === "BUSINESS")
                    : q1?.options.find(o => o.id === "CHARITY");

                if (selectedOption) {
                    // Apply Q1 scores
                    selectedOption.impacts.forEach(impact => {
                        initialState.scores[impact.entity] = (initialState.scores[impact.entity] || 0) + impact.score;
                    });
                    initialState.answers["Q1"] = selectedOption.id;
                    initialState.currentQuestionId = selectedOption.nextQuestionId || "Q2B";

                    // Get the next question
                    const nextQ = getQuestion(initialState.currentQuestionId);

                    const smartResponse = await groq.chat.completions.create({
                        messages: [{
                            role: "user",
                            content: `You're Oneasy, a friendly legal advisor. User just said: "${message}"

They want to start a ${indicatesBusiness ? "for-profit business" : "non-profit/charity"}.

1. Greet warmly and Introduce yourself (1 short sentence).
2. Ask this question casually: "${nextQ?.text}"

Example: "Hi, I'm Oneasy! That's a great goal. ${nextQ?.text}"
Keep it under 50 words.`
                        }],
                        model: "llama-3.3-70b-versatile",
                    });

                    return {
                        response: smartResponse.choices[0]?.message?.content || `Great! I'm Oneasy. ${nextQ?.text}`,
                        newState: initialState
                    };
                }
            }

            // Generic greeting - ask Q1
            const introResponse = await groq.chat.completions.create({
                messages: [{
                    role: "system",
                    content: `You are Oneasy, a friendly legal advisor for Indian entrepreneurs.`
                }, {
                    role: "user",
                    content: `User's first message: "${message}"
                    
Respond naturally:
1. Greet them briefly
2. Introduce yourself as Oneasy in one line
3. Ask: "So, are you looking to start a business to make money, or something more like a charity or non-profit?"

Keep it under 50 words total.`
                }],
                model: "llama-3.3-70b-versatile",
            });

            return {
                response: introResponse.choices[0]?.message?.content ||
                    "Hey! I'm Oneasy, your legal advisor. Are you starting a for-profit business or a non-profit/charity?",
                newState: getInitialState()
            };
        }

        const state = currentState;
        const currentQ = getQuestion(state.currentQuestionId);

        // Safety: If no current question, complete with best guess
        if (!currentQ) {
            return {
                response: "Thanks for all your answers! Let me analyze and give you a recommendation.",
                newState: { ...state, isComplete: true }
            };
        }

        // 2. Detect if user is asking for help/clarification
        // Skip intent check for very short messages that are likely answers
        const lowerMessage = message.toLowerCase().trim();
        const helpKeywords = ["simplify", "explain", "help", "what do you mean", "what?", "huh", "don't understand", "confused", "unclear", "why?", "why is"];
        const isHelpRequest = helpKeywords.some(kw => lowerMessage.includes(kw)) || lowerMessage === "why";

        // Also check for very short answers that should just be classified
        const isLikelyAnswer = message.length < 50 && !isHelpRequest;

        let intent = "A"; // Default to answer

        if (isHelpRequest) {
            intent = "B";
        } else if (!isLikelyAnswer) {
            // Only do LLM intent check for longer messages that might be off-topic
            const intentCheck = await groq.chat.completions.create({
                messages: [{
                    role: "user",
                    content: `User said: "${message}"
Current question: "${currentQ.text}"

Is this an answer to the question or completely off-topic?
A = Answer (even if informal like "yeah", "nope", "money", "just me", etc.)
C = Completely off-topic (like asking about weather)

Reply with just: A or C`
                }],
                model: "llama-3.3-70b-versatile",
                temperature: 0,
            });
            intent = intentCheck.choices[0]?.message?.content?.trim().toUpperCase() || "A";
        }

        // 3. Handle clarification requests
        if (intent === "B") {
            const clarifyResponse = await groq.chat.completions.create({
                messages: [{
                    role: "system",
                    content: "You are Oneasy, a friendly legal advisor. Explain simply."
                }, {
                    role: "user",
                    content: `The user asked "${message}" about this question: "${currentQ.text}"

Options are: ${currentQ.options.map(o => o.text).join(", ")}

If they asked "why":
- Explain WHY this matters for choosing the right legal entity
- Give a quick example of how different answers lead to different recommendations

If they want clarification:
- Explain what we're asking in simple terms
- Give examples for 2-3 options

Keep it brief, friendly, under 80 words.`
                }],
                model: "llama-3.3-70b-versatile",
            });

            return {
                response: clarifyResponse.choices[0]?.message?.content ||
                    "Let me explain that differently...",
                newState: state
            };
        }

        // 4. Handle off-topic
        if (intent === "C") {
            return {
                response: `I'm focused on helping you find the right legal entity. Let me ask again - ${currentQ.text.toLowerCase()}`,
                newState: state
            };
        }

        // 5. Classify the answer
        const classifyResponse = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: `TASK: Map user's answer to the best matching option.

QUESTION: "${currentQ.text}"
USER ANSWER: "${message}"

OPTIONS:
${currentQ.options.map(o => `${o.id}: ${o.text}`).join("\n")}

RULES:
- Understand intent, not just keywords
- "business", "profit", "startup", "money" → BUSINESS
- "ngo", "charity", "nonprofit", "trust", "help others" → CHARITY  
- "clothing brand", "e-commerce", "online store" → TRADING or ONLINE_SELLING
- "freelance", "consulting", "web dev" → FREELANCER
- "just me", "solo", "alone" → JUST_ME
- "yes, definitely" or strong agreement → first positive option
- "no", "not really" → negative options

OUTPUT: Just the option ID (e.g., BUSINESS). If truly unclear, output UNKNOWN.`
            }],
            model: "llama-3.3-70b-versatile",
            temperature: 0,
        });

        let classificationId = classifyResponse.choices[0]?.message?.content?.trim() || "UNKNOWN";

        // Clean up classification - remove any extra text
        classificationId = classificationId.split(/[\s\n]/)[0].toUpperCase();

        // Check if valid option
        const validOption = currentQ.options.find(o => o.id === classificationId);

        if (!validOption) {
            // Try to find a partial match
            const partialMatch = currentQ.options.find(o =>
                classificationId.includes(o.id) || o.id.includes(classificationId)
            );

            if (partialMatch) {
                classificationId = partialMatch.id;
            } else {
                // Ask for clarification
                const rephraseResponse = await groq.chat.completions.create({
                    messages: [{
                        role: "user",
                        content: `You're Oneasy. User said "${message}" but it's unclear.
Question was: "${currentQ.text}"
Options: ${currentQ.options.map(o => o.text).join(", ")}

Ask them to clarify in a friendly way. Give hints. Under 40 words.`
                    }],
                    model: "llama-3.3-70b-versatile",
                });

                return {
                    response: rephraseResponse.choices[0]?.message?.content ||
                        "Could you tell me more about that?",
                    newState: state
                };
            }
        }

        // 6. Process answer and get next state
        const nextState = getNextStep(state, message, classificationId);

        // 7. Generate response
        let response = "";

        if (nextState.isComplete) {
            // Final recommendation
            const recResponse = await groq.chat.completions.create({
                messages: [{
                    role: "system",
                    content: "You are Oneasy, a legal expert. Give clear, actionable recommendations."
                }, {
                    role: "user",
                    content: `Based on analysis, recommend: ${nextState.recommendedEntity} (${nextState.confidenceScore}% confidence)

User's answers: ${JSON.stringify(nextState.answers)}
Final scores: ${JSON.stringify(nextState.scores)}

Write a recommendation (under 150 words):
1. 🎯 State the recommendation clearly with confidence
2. 3 reasons why this fits them (bullet points)
3. Quick next steps
4. Encouraging closing`
                }],
                model: "llama-3.3-70b-versatile",
            });

            response = recResponse.choices[0]?.message?.content ||
                `🎯 **Recommended: ${nextState.recommendedEntity}** (${nextState.confidenceScore}% confidence)`;
        } else {
            // Ask next question naturally
            const nextQ = getQuestion(nextState.currentQuestionId);

            if (nextQ) {
                const questionResponse = await groq.chat.completions.create({
                    messages: [{
                        role: "user",
                        content: `You're Oneasy. Ask this question casually: "${nextQ.text}"

Rules:
- No "which of the following"
- No bullet points
- Sound like a friend chatting
- 1-2 sentences max
- Be direct

Just the question, nothing else.`
                    }],
                    model: "llama-3.3-70b-versatile",
                });

                response = questionResponse.choices[0]?.message?.content || nextQ.text;
            } else {
                response = "Let me finalize my recommendation for you...";
                nextState.isComplete = true;
            }
        }

        return { response, newState: nextState };

    } catch (error) {
        console.error("Agent Error:", error);
        return {
            response: "I hit a small bump. Could you say that again?",
            newState: currentState || getInitialState()
        };
    }
}
