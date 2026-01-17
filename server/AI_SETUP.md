# AI Diet Assistant Setup

The cafeteria application includes an AI-powered diet assistant that can answer nutrition questions, provide dietary recommendations, and help with allergen information.

## Configuration for Render Deployment

### Setting Environment Variables in Render

1. **Go to your Render Dashboard:**
   - Navigate to https://dashboard.render.com/
   - Select your web service (cafeteria backend)

2. **Add Environment Variables:**
   - Click on "Environment" in the left sidebar
   - Click "Add Environment Variable"
   - **Minimum Required - Just add this:**

   ```
   Key: AI_API_KEY
   Value: sk-your-openai-api-key-here
   ```

   That's it! The system will use default settings (OpenAI with gpt-3.5-turbo).

   **Optional - For custom configuration:**
   ```
   Key: AI_PROVIDER
   Value: openai (or anthropic, gemini)

   Key: AI_MODEL
   Value: gpt-4 (or claude-3-sonnet-20240229, gemini-pro)
   ```

3. **Save and Deploy:**
   - Click "Save Changes"
   - Render will automatically redeploy with the new environment variables

### Choose your AI provider and get an API key:

**Option 1: OpenAI (GPT-4, GPT-3.5)** - Recommended
- Go to https://platform.openai.com/
- Sign up or log in
- Navigate to API Keys section
- Create a new API key
- Copy the key (starts with `sk-`)
- In Render: Set `AI_PROVIDER=openai` and `AI_MODEL=gpt-3.5-turbo`

**Option 2: Anthropic (Claude)**
- Go to https://console.anthropic.com/
- Sign up or log in
- Navigate to API Keys
- Create a new API key
- Copy the key (starts with `sk-ant-`)
- In Render: Set `AI_PROVIDER=anthropic` and `AI_MODEL=claude-3-sonnet-20240229`

**Option 3: Google Gemini**
- Go to https://makersuite.google.com/app/apikey
- Sign up or log in
- Create a new API key
- Copy the key
- In Render: Set `AI_PROVIDER=gemini` and `AI_MODEL=gemini-pro`

## Local Development Configuration

For local development, copy `.env.example` to `.env` and add your keys:

```bash
cd server
cp .env.example .env
```

Update your `.env` file:
```env
AI_API_KEY=sk-your-openai-api-key-here
AI_PROVIDER=openai
AI_MODEL=gpt-3.5-turbo
```

## Without AI Configuration

If you don't configure an AI API key, the diet assistant will still work using keyword-based responses. It won't be as intelligent but will provide basic nutrition guidance.

## Cost Considerations

- **OpenAI GPT-3.5-turbo**: ~$0.002 per 1K tokens (very affordable)
- **OpenAI GPT-4**: ~$0.03 per 1K tokens
- **Anthropic Claude**: Similar pricing to OpenAI
- **Google Gemini**: Free tier available

For most applications, GPT-3.5-turbo provides excellent results at minimal cost.

## Implementation Status

Currently, the application uses placeholder responses. To enable actual AI integration:

1. Install the AI SDK:
   ```bash
   npm install openai
   # or
   npm install @anthropic-ai/sdk
   # or
   npm install @google/generative-ai
   ```

2. The server code at `/api/ai/diet-assistant` will need to be updated to call the actual AI API.

## Privacy & Security

- Never commit your `.env` file with real API keys to GitHub
- Use Render's environment variables for production
- Keep API keys secure and rotate them regularly
- Monitor API usage to prevent unexpected costs
- Consider rate limiting for production use
