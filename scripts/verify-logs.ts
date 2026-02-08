import 'dotenv/config';
import { processLegalAgentV2Message } from '@/app/actions';
import { nanoid } from 'nanoid';

// Mock env for testing
process.env.LLM_PROVIDER = 'vercel'; // Change to vercel or groq to test

console.log('Checking Environment:');
console.log('- GROQ_API_KEY Present:', !!process.env.GROQ_API_KEY);
console.log('- AI_GATEWAY_API_KEY Present:', !!process.env.AI_GATEWAY_API_KEY);
console.log('- LLM_PROVIDER:', process.env.LLM_PROVIDER);


async function testLogging() {
    console.log('--- Starting Log Test ---\n');

    const sessionId = nanoid();

    try {
        const result = await processLegalAgentV2Message(
            "I want to start a software company",
            sessionId
        );

        console.log('\n--- Test Complete ---');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testLogging();
