"use server";

import Groq from "groq-sdk";
import { QUESTIONS } from "@/lib/legal-agent/data";
import { getNextStep, getInitialState } from "@/lib/legal-agent/engine";
import { AgentState } from "@/lib/legal-agent/types";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function processMessage(message: string, currentState: AgentState | null) {
    try {
        // 1. Handle first message (greeting/intro) - No state yet
        if (!currentState) {
            const introPrompt = `
You are Oneasy, a friendly and expert legal advisor for Indian startup founders.
The user just sent: "${message}"

Respond naturally:
1. Greet them warmly (1 sentence)
2. Introduce yourself as Oneasy, their legal entity advisor (1 sentence)
3. Ask: "First off, are you starting a business to make money, or is this more of a non-profit/charity thing?"

Keep it casual and friendly. Use simple language.
            `;

            const intro = await groq.chat.completions.create({
                messages: [{ role: "user", content: introPrompt }],
                model: "llama-3.3-70b-versatile",
            });

            return {
                response: intro.choices[0]?.message?.content || "Hey! I'm Oneasy. Are you starting a for-profit business or a non-profit?",
                newState: getInitialState()
            };
        }

        const state = currentState;
        const currentQ = QUESTIONS[state.currentQuestionId];

        // 2. DETECT META-REQUESTS (simplify, explain, help, what do you mean, etc.)
        const metaCheckPrompt = `
User said: "${message}"

Is this a META-REQUEST? (asking for help, clarification, simplification, or expressing confusion)
Examples of meta-requests: "simplify", "what do you mean", "I don't understand", "explain", "huh?", "help", "can you rephrase"

Reply with ONLY one word:
- "META" if it's a meta-request
- "ANSWER" if they're actually answering the question
        `;

        const metaCheck = await groq.chat.completions.create({
            messages: [{ role: "user", content: metaCheckPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0,
        });

        const isMeta = metaCheck.choices[0]?.message?.content?.trim().toUpperCase() === "META";

        // 3. HANDLE META-REQUEST - Explain/simplify the current question
        if (isMeta && currentQ) {
            const simplifyPrompt = `
You are Oneasy, a friendly legal advisor.
The user is confused about this question: "${currentQ.text}"
The possible answers are: ${currentQ.options.map(o => o.text).join(", ")}

Explain this question in VERY SIMPLE terms:
1. What are we actually asking (in plain language)
2. Give a simple example for each option
3. Ask them again in simpler words

Keep it friendly, helpful, and use everyday language. No legal jargon.
            `;

            const simplify = await groq.chat.completions.create({
                messages: [{ role: "user", content: simplifyPrompt }],
                model: "llama-3.3-70b-versatile",
            });

            return {
                response: simplify.choices[0]?.message?.content || "Let me explain that differently...",
                newState: state // Stay on same question
            };
        }

        // 4. SMART CLASSIFICATION - Understand context and domain
        let classificationId = "";

        if (currentQ && currentQ.options.length > 0) {
            const classificationPrompt = `
You are an intelligent classifier for a legal entity advisor.

CURRENT QUESTION: "${currentQ.text}"
USER'S ANSWER: "${message}"

OPTIONS TO CHOOSE FROM:
${currentQ.options.map(o => `- ${o.id}: ${o.text}`).join("\n")}

YOUR TASK: Map the user's answer to the BEST matching option ID.

CLASSIFICATION RULES:
1. Understand the INTENT, not just keywords
2. Use domain knowledge:
   - "clothing brand", "D2C", "e-commerce" → ONLINE_SELLING or TRADING
   - "web dev", "freelancing", "consulting" → FREELANCER or PROFESSIONAL
   - "app", "SaaS", "startup" → BUILDING_COMPANY or TECH
   - "solo", "just me", "alone" → JUST_ME
   - "already earning", "have customers" → EARNING or RUNNING_WELL
   - "bootstrap", "own money" → OWN_MONEY
   - "investors", "raise funding" → INVESTORS

3. If truly unclear, return UNKNOWN

OUTPUT: Just the Option ID, nothing else.
            `;

            const classification = await groq.chat.completions.create({
                messages: [{ role: "user", content: classificationPrompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0,
            });

            classificationId = classification.choices[0]?.message?.content?.trim() || "UNKNOWN";
        }

        // 5. Handle UNKNOWN - Ask for clarification naturally
        if (classificationId === "UNKNOWN" && !state.isComplete) {
            const clarifyPrompt = `
You are Oneasy, a helpful legal advisor.
The user said: "${message}"
You asked: "${currentQ?.text}"

Their answer doesn't clearly fit any category. Ask a follow-up question to understand better.
Be specific and give examples to help them answer.
Keep it friendly and short.
            `;

            const clarify = await groq.chat.completions.create({
                messages: [{ role: "user", content: clarifyPrompt }],
                model: "llama-3.3-70b-versatile",
            });

            return {
                response: clarify.choices[0]?.message?.content || "Could you tell me a bit more about that?",
                newState: state
            };
        }

        // 6. Advance to next step
        const nextState = getNextStep(state, message, classificationId);

        // 7. Generate Response
        let aiResponseText = "";

        if (nextState.isComplete) {
            const recEntity = nextState.recommendedEntity || "Private Limited Company";
            const confidence = nextState.confidenceScore || 75;

            const recommendationPrompt = `
You are Oneasy, an expert legal advisor.
Based on analysis, recommend: **${recEntity}** (${confidence}% confidence)

User's journey: ${JSON.stringify(nextState.answers)}

Write a clear recommendation:
1. 🎯 State the recommendation clearly
2. Explain WHY this fits them (2-3 bullet points based on their answers)
3. List 3 key benefits
4. Next steps to get started

Be professional but friendly. Use Markdown.
            `;

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: recommendationPrompt }],
                model: "llama-3.3-70b-versatile",
            });
            aiResponseText = completion.choices[0]?.message?.content || "Based on your answers, I recommend a Private Limited Company.";
        } else {
            const nextQ = QUESTIONS[nextState.currentQuestionId];

            const questionPrompt = `
You are Oneasy, chatting naturally with a founder.
Ask this question casually: "${nextQ?.text}"

RULES:
- No "which of the following"
- No bullet points or lists
- Sound like a friend, not a survey
- 1-2 sentences max
- Be direct and clear
            `;

            const questionWrap = await groq.chat.completions.create({
                messages: [{ role: "user", content: questionPrompt }],
                model: "llama-3.3-70b-versatile",
            });

            aiResponseText = questionWrap.choices[0]?.message?.content || "Tell me more...";
        }

        return {
            response: aiResponseText,
            newState: nextState
        };

    } catch (error) {
        console.error("Agent Error:", error);
        return {
            response: "Sorry, I hit a small bump. Could you say that again?",
            newState: currentState || getInitialState()
        };
    }
}
