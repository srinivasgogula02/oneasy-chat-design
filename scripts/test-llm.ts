// Test script for LLM Connection
// Run with: npx tsx scripts/test-llm.ts

import fs from 'fs';
import path from 'path';

// Manually load .env since dotenv is not installed
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                process.env[key] = value;
            }
        });
        console.log("✅ Loaded .env file");
    } else {
        console.warn("⚠️ .env file not found");
    }
} catch (e) {
    console.error("Error loading .env:", e);
}

async function testLLM() {
    console.log("🧪 Testing LLM Connection...\n");
    console.log(`Current Provider: ${process.env.LLM_PROVIDER || "groq (default)"}`);

    // Dynamic import
    const { testLLMConnection } = await import('../src/app/actions');

    try {
        const result = await testLLMConnection();
        if (result.success) {
            console.log("✅ SUCCESS!");
            console.log(`Provider: ${result.provider}`);
            console.log(`Model: ${result.model}`);
            console.log(`Duration: ${result.duration}ms`);
            console.log(`Response: "${result.response?.trim() || ''}"`);
        } else {
            console.error("❌ FAILED!");
            console.error(`Provider: ${result.provider}`);
            console.error(`Error: ${result.error}`);
        }
    } catch (e: any) {
        console.error("Error executing test:", e);
    }
}

testLLM();
