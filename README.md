# buildingforabuilder

A DIY cost estimate calculator and planner built by a home improvement pioneer.

## About

AI-assisted project extraction and cost estimation for painting, flooring, and fence projects. Uses Gemini for scoping and deterministic logic for estimates.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Add environment variables to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- Next.js 16
- Vercel AI SDK + Gemini
- Supabase (caching)
- Zod (schemas)
- Tailwind CSS
