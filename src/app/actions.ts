"use server";

import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function getGroqResponse(message: string) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are Oneasy, an expert legal advisor for startup founders. You specialize in helping founders utilize the Oneasy platform to register their companies. You provide clear, comparing advice on legal entities (LLC, C-Corp, S-Corp, etc.), registered agents, and state incorporation (Delaware vs Wyoming vs home state). Keep your responses professional, concise, and helpful. Always format your responses using Markdown, including bolding for key terms and lists for comparisons.",
                },
                {
                    role: "user",
                    content: message,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Error fetching Groq response:", error);
        return "Sorry, I encountered an error while processing your request.";
    }
}
