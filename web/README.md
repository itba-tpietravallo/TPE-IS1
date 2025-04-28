## Getting Started

First, run the development server:

```bash
# OR yarn dev OR pnpm dev OR bun dev
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

You can start editing the page by modifying `app/routes/_index.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Remix, take a look at the following resources:

- 📖 [Remix docs](https://remix.run/docs)
- ✨ [Tailwind CSS](https://tailwindcss.com/)

## Deployment

All commits to a branch will trigger a Github Action's workflow that'll build and push to Vercel's platform

Commits on the main branch will trigger production builds, while commits on other branches will trigger preview builds.

Github Actions use secrets corresponding to the `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and `VERCEL_TOKEN` corresponding to @tomaspietravallo's account (please get in touch to debug the ci/cd pipeline). Secrets were set up on March 18th, 2025 with a 1 YEAR expiry.
