# Legal Entity Suggestor V2 - Configuration & Frontend Integration

## ✅ Completed

### 1. Multi-Provider Support

The agent now supports both **Groq** and **Vercel AI Gateway** providers based on `.env` configuration:

**`.env` Configuration:**
```bash
# Choose provider: "groq" or "vercel"
LLM_PROVIDER=vercel

# Groq Configuration (when LLM_PROVIDER=groq)
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Vercel AI Gateway (when LLM_PROVIDER=vercel)
AI_GATEWAY_API_KEY=your_key_here
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1
AI_MODEL=gpt-4o
```

**Agent Logic (`agent.ts`):**
- Dynamically imports the correct SDK based on `LLM_PROVIDER`
- Groq: Uses `@ai-sdk/groq` with `groq()` function
- Vercel: Uses `@ai-sdk/openai` with `createOpenAI()` and custom baseURL

### 2. Frontend Integration

**Updated Components:**
- [`pro-chat.tsx`](file:///Users/vinaygogula/Downloads/srinivas/2026/OnEasy/chat_design/src/components/chat/pro-chat.tsx)

**Changes Made:**
✅ Imported `processLegalAgentV2Message` from actions.ts  
✅ Added `sessionId` state (using nanoid)  
✅ Added `useV2Agent` toggle (default: `true`)  
✅ Updated `handleSendMessage` to conditionally use V1 or V2 agent  
✅ Fixed TypeScript errors (imported `INITIAL_SCORES`)  
✅ Added "use client" directive

**Usage:**
```tsx
const [useV2Agent, setUseV2Agent] = useState(true); // true = AI agent, false = legacy
```

The frontend now:
- Uses V2 agent by default (`useV2Agent === true`)
- Falls back to V1 if toggled to `false`
- Maintains session persistence via `sessionId`
- Converts V2 state to legacy format for UI compatibility

### 3. How It Works

**User sends message**  
↓  
**Frontend checks `useV2Agent`**  
↓  
**If true**: Calls `processLegalAgentV2Message(message, sessionId)`  
↓  
**Agent reads `.env` → `LLM_PROVIDER`**  
↓  
**If "vercel"**: Uses Vercel AI Gateway with configured model  
**If "groq"**: Uses Groq with Llama 3.3 70B  
↓  
**Returns structured response**  
↓  
**Frontend displays response**

### Files Modified

1. **agent.ts** - Added multi-provider support
2. **pro-chat.tsx** - Connected V2 agent to UI
3. **No .env changes** - Already configured correctly

## Testing

To test the V2 agent:

```bash
# 1. Ensure .env has correct configuration
LLM_PROVIDER=vercel  # or "groq"

# 2. Run dev server
npm run dev

# 3. Open chat and send message
# The agent will use the provider specified in .env
```

## Toggle Between V1 and V2

To switch to legacy V1 agent, change in `pro-chat.tsx`:

```tsx
const [useV2Agent, setUseV2Agent] = useState(false); // Now uses V1
```

Or add a UI toggle button later for dynamic switching.

## Next Steps

- **Test with both providers** (Groq and Vercel)
- **Add UI toggle** for V1/V2 switching (optional)
- **Deploy and monitor** LLM performance
