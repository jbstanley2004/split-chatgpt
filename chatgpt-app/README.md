# Split Payments ChatGPT App

This is a ChatGPT App that allows users to complete the Split Payments merchant onboarding process directly within ChatGPT. The app uses the OpenAI Apps SDK (MCP protocol) to render interactive widgets for each step of the business profile setup.

## Architecture

<!-- Updated architecture to show serverless deployment -->
\`\`\`
Your Next.js App (www.ccsplit.org)
├── app/api/chatgpt-mcp/route.ts   # MCP endpoint (serverless)
├── app/api/portal/               # Backend API routes
│   ├── application/route.ts
│   └── application/[id]/
│       ├── route.ts
│       └── submit/route.ts
└── chatgpt-app/
    └── widgets/                   # React widgets for ChatGPT UI
        ├── src/
        │   ├── components/        # Shared components
        │   ├── auth-widget.tsx
        │   ├── business-info-widget.tsx
        │   ├── owner-info-widget.tsx
        │   ├── business-address-widget.tsx
        │   ├── bank-account-widget.tsx
        │   ├── processing-details-widget.tsx
        │   └── confirmation-widget.tsx
        ├── dist/                  # Built HTML widgets
        └── build.mjs
\`\`\`

## Flow

1. **Authentication** - User signs in or creates an account
2. **Business Information** - Legal name, EIN, business type
3. **Owner Information** - Personal details, SSN (last 4), ownership %
4. **Business Address** - Physical and mailing address
5. **Bank Account** - For deposit settlements
6. **Processing Details** - Expected volumes, sales method
7. **Confirmation** - Review and submit application

## Production Setup (Serverless on Vercel)

<!-- Replaced local setup with serverless instructions -->
The MCP server runs as a serverless API route at:

\`\`\`
https://www.ccsplit.org/api/chatgpt-mcp
\`\`\`

No port configuration is needed. The endpoint is automatically available when you deploy to Vercel.

### 1. Build widgets (optional, for customization)

\`\`\`bash
cd chatgpt-app/widgets
npm install
npm run build
\`\`\`

### 2. Connect to ChatGPT

1. Go to ChatGPT Settings → Apps & Connectors → Advanced settings
2. Enable Developer Mode
3. Create a new connector with:
   - **Name**: Split Payments
   - **Description**: Complete your Split Payments merchant application
   - **URL**: `https://www.ccsplit.org/api/chatgpt-mcp`

That's it! No ngrok, no ports, no local server needed.

## Tools

| Tool | Description |
|------|-------------|
| `split_start_onboarding` | Start the onboarding process, shows auth widget |
| `split_authenticate` | Authenticate user (sign in/sign up) |
| `split_save_business_info` | Save step 1: Business information |
| `split_save_owner_info` | Save step 2: Owner information |
| `split_save_business_address` | Save step 3: Business address |
| `split_save_bank_account` | Save step 4: Bank account |
| `split_save_processing_details` | Save step 5: Processing details |
| `split_submit_application` | Submit the complete application |

## Usage in ChatGPT

Just say: "Help me sign up for Split Payments" or "Start Split merchant application"

The model will call `split_start_onboarding` and guide you through each step sequentially.

## Environment Variables

Set these in Vercel (already configured):

| Variable | Value |
|----------|-------|
| `SPLIT_API_URL` | `https://www.ccsplit.org/api` |
| `SPLIT_API_KEY` | Your generated API key |
