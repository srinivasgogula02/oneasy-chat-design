# Legal Entity Suggestor V2 - Usage Guide

## Overview

The Legal Entity Suggestor V2 is an AI-powered agent that acts like a human Chartered Accountant. It conducts conversational interviews to understand a user's business needs and recommends the appropriate legal entity structure.

## Key Features

- **💬 Conversational AI**: Natural dialogue instead of rigid forms
- **🧠 Chain-of-Thought Reasoning**: The AI analyzes each response and decides what to ask next
- **⚡ Hard Constraint Enforcement**: Automatically applies legal requirements (e.g., VCs → only Pvt Ltd)
- **🔍 Contradiction Detection**: Catches conflicting requirements and educates users
- **📊 Structured Output**: Zod schemas ensure type-safe responses

## Architecture

```
User Input → Server Action → processLegalAgentMessage() → Groq LLM → Structured Response
                                        ↓
                            Updates UserProfile State
                                        ↓
                            Returns Question or Recommendation
```

## How to Use

### Server-Side (Next.js Server Actions)

```typescript
import { processLegalAgentV2Message } from '@/app/actions';
import { nanoid } from 'nanoid';

// Initialize session
const sessionId = nanoid();

// Process user message
const result = await processLegalAgentV2Message(
  "I'm building a tech startup and need VC funding",
  sessionId
);

console.log(result.response); // AI's next question or recommendation
console.log(result.profile); // Updated user profile
console.log(result.isComplete); // true if recommendation ready
```

### Response Structure

```typescript
{
  response: string;              // The AI's message to the user
  profile: UserProfile;          // Current understanding of user's needs
  isComplete: boolean;           // Whether recommendation is ready
  thoughtProcess: ThoughtProcess; // AI's reasoning (for debugging)
  recommendation?: RecommendationOutput; // Final recommendation if complete
}
```

## Example Conversation Flow

### Example 1: Tech Startup (Happy Path)

**User:** "I'm building a SaaS product and want to raise VC funding"

**AI Analyzes:**
- Intent: business ✓
- Funding: VC (hard constraint: must be Pvt Ltd) ✓
- Business type: tech startup ✓
- Missing: founder count, foreign involvement

**AI Response:** "How many co-founders are on the team?"

**User:** "I have 2 co-founders"

**AI Analyzes:**
- Founders: 3 total ✓
- Completeness: 75%

**AI Response:** "Are any of you NRI or planning to have foreign investors?"

**User:** "No, we're all Indian residents"

**AI Analyzes:**
- NRI: false ✓
- Foreign involvement: false ✓
- Completeness: 95% → Ready to recommend!

**AI Recommendation:**

```markdown
## 🎯 Recommended: **Private Limited Company**

**Confidence:** 95%

### Why This is Best For You:

- You need VC funding, which can only be raised by Private Limited Companies
- You have 3 founders, which meets the minimum requirement of 2
- Tech startups benefit from the credibility and structure of a Pvt Ltd
- Limited liability protects personal assets if the business fails

### Alternative Option:

**LLP**: If you decide not to pursue VC funding and want lower compliance, LLP offers limited liability with less paperwork

### ⚠️ Important Considerations:

- Setup takes 10-15 days and costs ₹8-15K
- Higher compliance requirements (annual audits, board meetings, ROC filings)
- Consider hiring a CA for ongoing compliance management
```

---

### Example 2: Contradiction Detection

**User:** "I want a sole proprietorship"

**AI:** "Got it. What are your plans for funding?"

**User:** "I'll need angel investors next year"

**AI Detects Contradiction:** 
- User wants: Proprietorship
- User needs: Angel investment
- Conflict: Proprietorships cannot receive equity investment!

**AI Response:**

"I notice you're interested in a Sole Proprietorship, but you mentioned needing angel investors. Unfortunately, angel investors can only invest in companies by purchasing equity shares. A Sole Proprietorship cannot issue shares.

Would you like to consider a Private Limited Company instead? It's specifically designed to raise equity funding from investors."

---

### Example 3: Edge Case - Off Topic

**User:** "What's the best programming language for startups?"

**AI Response:**

"I specialize in helping you choose the right legal structure for your business. Let's focus on that. Tell me about your business idea - what type of venture are you starting?"

---

## Testing the Agent

### Manual Testing

Run the development server:

```bash
npm run dev
```

Open the chat interface and test these scenarios:

#### Test Case 1: Hard Constraint (Fintech)
- Input: "I'm starting an NBFC"
- Expected: AI should immediately recommend Pvt Ltd (RBI requirement)

#### Test Case 2: Ambiguous Input
- Input: "I want to make money"
- Expected: AI should ask if it's a for-profit business or non-profit

#### Test Case 3: Professional Services
- Input: "I'm a CA starting a consultancy with 2 partners"
- Expected: AI should lean toward LLP (industry standard for CAs)

### Debugging

The agent returns `thoughtProcess` for debugging:

```typescript
{
  analysis: "User mentioned tech startup and VC funding...",
  contradictions: [],
  missing_critical_factors: ["Number of co-founders"],
  completeness_score: 60,
  current_understanding: "Intent: business, Funding: vc, Type: tech_startup"
}
```

## UserProfile Schema

The AI tracks these fields:

```typescript
{
  intent: 'business' | 'charity' | 'unknown'
  funding_needs: 'vc' | 'angel' | 'bank_loan' | 'bootstrap' | 'grants' | 'unknown'
  founder_count: number | null
  liability_preference: 'limited' | 'unlimited' | 'unknown'
  nri_status: boolean | null
  business_type: string | null  // e.g., "fintech", "professional_services"
  expansion_plans: 'franchise' | 'multi_branch' | 'single_location' | 'online' | 'unknown'
  revenue_target: string | null  // e.g., "< 20L", "> 5Cr"
  foreign_involvement: boolean | null
  professional_services: boolean | null
  exit_plans: 'sell' | 'family' | 'personal' | 'unknown'
}
```

## Hard Constraints (Enforced by AI)

| User Requirement | Mandatory Entity |
|------------------|------------------|
| VC/Angel funding needed | Private Limited Company |
| Banking/Fintech/NBFC | Private Limited Company (RBI) |
| Non-profit/School/Charity | Section 8 Company / Trust / Society |
| Foreign directors/funding | Private Limited Company (preferred) |
| NRI founder | Cannot be Proprietorship/Partnership |
| Franchise model | Private Limited Company |

## File Structure

```
src/lib/legal-agent-v2/
├── types.ts         # Zod schemas for structured output
├── systemPrompt.ts  # CA persona + condensed knowledge base
├── agent.ts         # Main LLM processing logic
└── index.ts         # Module exports

src/app/
└── actions.ts       # Server Actions (processLegalAgentV2Message)
```

## Environment Variables

Make sure you have these in your `.env`:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

## Cost & Performance

- **Model**: `llama-3.3-70b-versatile` (Groq)
- **Average latency**: ~1-2 seconds per response
- **Cost**: ~$0.10 per 1M tokens (extremely cheap)
- **System prompt**: ~800 tokens (optimized from 10K+ word documents)

## Troubleshooting

### "LLM returned no object"

This means the LLM failed to generate valid structured output. The agent will:
1. Retry up to 3 times (exponential backoff)
2. Fall back to a generic question if all retries fail

### Profile Not Updating

Check the `thought_process.analysis` field to see what the AI understood from the message.

### Recommendation Too Early

The agent has a safety check: it won't recommend until completeness_score >= 90%. If it's recommending prematurely, adjust the weights in `calculateCompletenessScore()`.

## Next Steps

- **Frontend Integration**: Connect this to your chat UI component
- **State Persistence**: Move from in-memory Map to Redis/database
- **Analytics**: Track conversation paths and success rates
- **A/B Testing**: Compare V1 (scoring) vs V2 (AI) performance
