"use server";

import Groq from "groq-sdk";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { QUESTIONS, getQuestion } from "@/lib/legal-agent/data";
import { getNextStep, getInitialState } from "@/lib/legal-agent/engine";
import { AgentState } from "@/lib/legal-agent/types";
import { analyzeRecommendation } from "@/lib/legal-agent/analysis";

// LLM Provider configuration
// Set LLM_PROVIDER=vercel in .env to use Vercel AI Gateway
// Set LLM_PROVIDER=groq (default) to use Groq
const LLM_PROVIDER = process.env.LLM_PROVIDER || "groq";

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Initialize Vercel AI Gateway client
const vercelAI = createOpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_GATEWAY_BASE_URL || "https://api.openai.com/v1",
});

// LLM call timeout (30 seconds)
const LLM_TIMEOUT_MS = 30000;

// Timeout wrapper for LLM calls
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = LLM_TIMEOUT_MS): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('LLM request timeout - please try again')), timeoutMs)
    );
    return Promise.race([promise, timeout]);
}

// Unified LLM call function with timeout protection
async function callLLM(messages: { role: "user" | "system"; content: string }[], options?: { temperature?: number }): Promise<string> {
    const llmPromise = (async () => {
        if (LLM_PROVIDER === "vercel") {
            // Use Vercel AI SDK
            const result = await generateText({
                model: vercelAI(process.env.AI_MODEL || "gpt-4o"),
                messages,
                temperature: options?.temperature,
            });
            return result.text || "";
        } else {
            // Use Groq (default)
            const response = await groq.chat.completions.create({
                messages,
                model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
                temperature: options?.temperature,
            });
            return response.choices[0]?.message?.content || "";
        }
    })();

    return withTimeout(llmPromise, LLM_TIMEOUT_MS);
}

// ======= PRODUCTION HARDENING =======

// Input validation constants
const MAX_MESSAGE_LENGTH = 2000; // Prevent abuse with very long messages
const MIN_MESSAGE_LENGTH = 1;

// Sanitize user input - remove potential XSS or injection attempts
function sanitizeInput(input: string): string {
    return input
        .trim()
        .slice(0, MAX_MESSAGE_LENGTH) // Enforce max length
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // Remove control characters
}

// Validate input before processing
function validateInput(message: string): { valid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Invalid message format' };
    }
    if (message.trim().length < MIN_MESSAGE_LENGTH) {
        return { valid: false, error: 'Message is too short' };
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
        return { valid: false, error: 'Message is too long' };
    }
    return { valid: true };
}

// Check for illegal or harmful content
async function checkContentSafety(message: string): Promise<{ safe: boolean; reason?: string }> {
    // 1. Fast Keyword Check (Strict blocking for obvious violations)
    const unsafeKeywords = [
        "drug", "cocaine", "clean money", "launder money", "money laundering",
        "bomb", "kill", "smuggle", "fake currency", "hack bank",
        "hurt someone", "murder", "suicide", "terror", "weapon"
    ];
    const lowerMsg = message.toLowerCase();
    if (unsafeKeywords.some(kw => lowerMsg.includes(kw))) {
        return { safe: false, reason: "Contains unsafe keywords" };
    }

    // 2. LLM Contextual Check
    const safetyCheck = await callLLM([{
        role: "user",
        content: `TASK: Safety Content Classification
USER INPUT: "${message}"

Determine if this input violates safety policies by filtering for:
1. Illegal Acts: Promoting, admitting to, or asking how to commit crimes.
2. Harmful Intent: Violence, self-harm, harassment, hate speech.
3. Sexually Explicit: NSFW content.

RULES:
- "How do I launder money?" -> UNSAFE
- "I want to hurt someone" -> UNSAFE
- "Start a bakery" -> SAFE
- "Tax planning" -> SAFE

OUTPUT JSON ONLY:
{ "safe": boolean, "reason": "short explanation if unsafe" }`
    }], { temperature: 0 });

    try {
        const result = JSON.parse(safetyCheck.trim());
        return { safe: result.safe, reason: result.reason };
    } catch (e) {
        return { safe: true }; // Fallback if LLM fails but keywords passed
    }
}

export async function processMessage(message: string, currentState: AgentState | null) {
    try {
        // === Input Validation ===
        const validation = validateInput(message);
        if (!validation.valid) {
            return {
                response: validation.error || "Invalid input",
                newState: currentState || getInitialState()
            };
        }

        // === Safety Check ===
        const safety = await checkContentSafety(message);
        if (!safety.safe) {
            return {
                response: "⚠️ Safety Alert: This content violates our safety policies. Examples of violations include illegal activities, violence, or hate speech.",
                newState: { ...(currentState || getInitialState()), isBlocked: true }
            };
        }

        // Sanitize the input
        const sanitizedMessage = sanitizeInput(message);

        // 1. Handle first message - Initialize and potentially skip Q1 if user already stated intent
        if (!currentState) {
            const lowerMsg = sanitizedMessage.toLowerCase();

            // Check if user already indicated business or charity intent
            // Using word boundary matching to avoid false positives (e.g., "earn" in "learning")
            const businessKeywords = ["business", "startup", "money", "earn", "sell", "product", "service", "freelance", "trading", "shop", "store"];
            const charityKeywords = ["charity", "non-profit", "nonprofit", "ngo", "trust", "society", "help people", "social work", "section 8", "foundation", "welfare"];

            // Word boundary check helper
            const hasKeyword = (text: string, keywords: string[]) =>
                keywords.some(kw => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text));

            const indicatesBusiness = hasKeyword(lowerMsg, businessKeywords);
            const indicatesCharity = hasKeyword(lowerMsg, charityKeywords);

            // IMPORTANT: Check charity FIRST because "profit" is substring of "non-profit"
            if (indicatesCharity || indicatesBusiness) {
                // User already told us their intent - skip Q1 and go to Q2
                const initialState = getInitialState();
                const q1 = getQuestion("Q1");
                // Prioritize charity if both match (e.g., "non-profit" contains "profit")
                const selectedOption = indicatesCharity
                    ? q1?.options.find(o => o.id === "CHARITY")
                    : q1?.options.find(o => o.id === "BUSINESS");

                if (selectedOption) {
                    // Apply Q1 scores
                    selectedOption.impacts.forEach(impact => {
                        initialState.scores[impact.entity] = (initialState.scores[impact.entity] || 0) + impact.score;
                    });
                    initialState.answers["Q1"] = selectedOption.id;
                    // Set next question based on path - no hardcoded fallback
                    initialState.currentQuestionId = selectedOption.nextQuestionId || (indicatesCharity ? "Q2C" : "Q2B");

                    // Get the next question
                    const nextQ = getQuestion(initialState.currentQuestionId);

                    const smartResponse = await callLLM([{
                        role: "user",
                        content: `You're Oneasy, a friendly legal advisor. User just said: "${sanitizedMessage}"

They want to start a ${indicatesCharity ? "non-profit/charity" : "for-profit business"}.

1. Greet warmly and Introduce yourself (1 short sentence).
2. Ask this question casually: "${nextQ?.text}"

Example: "Hi, I'm Oneasy! That's a great goal. ${nextQ?.text}"
Keep it under 50 words.`
                    }]);

                    return {
                        response: smartResponse || `Great! I'm Oneasy. ${nextQ?.text}`,
                        newState: initialState
                    };
                }
            }

            // Generic greeting - ask Q1
            const introResponse = await callLLM([{
                role: "system",
                content: `You are Oneasy, a friendly legal advisor for Indian entrepreneurs.`
            }, {
                role: "user",
                content: `User's first message: "${sanitizedMessage}"
                    
Respond naturally:
1. Greet them briefly
2. Introduce yourself as Oneasy in one line
3. Ask: "So, are you looking to start a business to make money, or something more like a charity or non-profit?"

Keep it under 50 words total.`
            }]);

            return {
                response: introResponse ||
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
            const intentResult = await callLLM([{
                role: "user",
                content: `User said: "${sanitizedMessage}"
Current question: "${currentQ.text}"

Is this an answer to the question or completely off-topic?
A = Answer (even if informal like "yeah", "nope", "money", "just me", etc.)
C = Completely off-topic (like asking about weather)

Reply with just: A or C`
            }], { temperature: 0 });
            intent = intentResult?.trim().toUpperCase() || "A";
        }

        // 3. Handle clarification requests
        if (intent === "B") {
            const clarifyResponse = await callLLM([{
                role: "system",
                content: "You are Oneasy, a friendly legal advisor. Explain simply."
            }, {
                role: "user",
                content: `The user asked "${sanitizedMessage}" about this question: "${currentQ.text}"

Options are: ${currentQ.options.map(o => o.text).join(", ")}

If they asked "why":
- Explain WHY this matters for choosing the right legal entity
- Give a quick example of how different answers lead to different recommendations

If they want clarification:
- Explain what we're asking in simple terms
- Give examples for 2-3 options

Keep it brief, friendly, under 80 words.`
            }]);

            return {
                response: clarifyResponse || "Let me explain that differently...",
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
        const classifyResult = await callLLM([{
            role: "user",
            content: `TASK: Map user's answer to the best matching option.

QUESTION: "${currentQ.text}"
USER ANSWER: "${sanitizedMessage}"

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
        }], { temperature: 0 });

        let classificationId = classifyResult?.trim() || "UNKNOWN";

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
                const rephraseResponse = await callLLM([{
                    role: "user",
                    content: `You're Oneasy. User said "${sanitizedMessage}" but it's unclear.
Question was: "${currentQ.text}"
Options: ${currentQ.options.map(o => o.text).join(", ")}

Ask them to clarify in a friendly way. Give hints. Under 40 words.`
                }]);

                return {
                    response: rephraseResponse || "Could you tell me more about that?",
                    newState: state
                };
            }
        }

        // 6. Process answer and get next state
        const nextState = getNextStep(state, sanitizedMessage, classificationId);

        // 7. Generate response
        let response = "";

        if (nextState.isComplete) {
            // Final recommendation
            // Perform detailed analysis
            const analysis = analyzeRecommendation(nextState);
            const analysisContext = `
WHY THIS ENTITY:
${analysis.winnerReasoning.map(r => `- ${r}`).join("\n")}

ALTERNATIVES & TRADE-OFFS (Explain these clearly):
${analysis.alternatives.map(a => `- ${a.entity}: ${a.reason}`).join("\n")}
`;

            // Final recommendation
            const recResponse = await callLLM([{
                role: "system",
                content: "You are Oneasy, a legal expert. Give clear, actionable recommendations with deep insights. Be helpful and educational."
            }, {
                role: "user",
                content: `Based on analysis, recommend: ${nextState.recommendedEntity} (${Math.round((nextState.confidenceScore || 0) * 100)}% confidence)

ANALYSIS:
${analysisContext}

Write a recommendation (under 200 words):
1. 🎯 State the recommendation clearly with confidence.
2. 💡 Explain WHY (using the "Why This Entity" points).
3. 🔄 Alternatives: Mention close runner-ups and explain the "Pivot Points" (e.g. "If you had chosen X..."). This is crucial for education.
4. Quick next steps.
5. Encouraging closing.`
            }]);

            response = recResponse ||
                `🎯 **Recommended: ${nextState.recommendedEntity}** (${nextState.confidenceScore}% confidence)`;
        } else {
            // Ask next question naturally
            const nextQ = getQuestion(nextState.currentQuestionId);

            if (nextQ) {
                const questionResponse = await callLLM([{
                    role: "user",
                    content: `You're Oneasy. Ask this question casually: "${nextQ.text}"

Rules:
- No "which of the following"
- No bullet points
- Sound like a friend chatting
- 1-2 sentences max
- Be direct

Just the question, nothing else.`
                }]);

                response = questionResponse || nextQ.text;
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

// Verification action
export async function testLLMConnection() {
    try {
        const start = Date.now();
        const response = await callLLM([{ role: "user", content: "Test connection. Reply with 'OK'." }], { temperature: 0 });
        const duration = Date.now() - start;
        return {
            success: true,
            provider: LLM_PROVIDER,
            model: LLM_PROVIDER === "vercel" ? (process.env.AI_MODEL || "gpt-4.1") : (process.env.GROQ_MODEL || "llama-3.3-70b-versatile"),
            response,
            duration
        };
    } catch (e: any) {
        return { success: false, provider: LLM_PROVIDER, error: e.message };
    }
}
