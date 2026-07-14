# AI Talent Research Workspace

Simple MVP prototype for technical recruiters researching specialised research and technical candidates with public evidence from OpenAlex, GitHub, and guided manual discovery.

This prototype is designed to identify specialised research and technical talent with publicly available evidence. It is not a complete professional talent database and may not identify experienced industry candidates whose work is not publicly visible.

## Core MVP in 10 points

1. Recruiter enters a natural-language talent requirement.
2. The app tries an AI criteria parser first, then falls back to a free local parser if no backend/API key is available.
3. Recruiter reviews a structured research brief with business expert keywords, must-have evidence, candidate profile hypotheses, recommended evidence channels, archetypes, and expected limitations.
4. An automatic source planner selects a source mix, then OpenAlex and GitHub public APIs retrieve publication, repository-owner, and contributor evidence. It also generates university official-site, laboratory, research-group, conference, patent, and company-page discovery queries for manual verification.
5. Candidate cards show score, top reasons, expertise, confidence, and status.
6. Candidate Brief shows evidence-linked reasons, score breakdown, timeline, publications, sources, and uncertainty.
7. Recruiter can change status, add notes, tags, rejection reason, public URL, verified information, and corrections.
8. Manual verification links open LinkedIn, Google Scholar, GitHub, company, and web searches in new tabs.
9. Recruiter can run multiple role-specific projects at the same time, with separate results and shortlist per project.
10. Recruiter can manually add a candidate, labelled as recruiter-entered information.

## Architecture

The current repository is a plain static web app, so Phase 1 is implemented as a local browser prototype:

- `index.html`: application shell and dialogs.
- `styles.css`: responsive research-workspace UI.
- `app.js`: AI criteria client, rule-based fallback parser, automatic source planner, OpenAlex source, GitHub source, search-link provider, scoring, persistence, and UI rendering.
- `server.js`: small Node server for static files plus `POST /api/analyze-jd`.

The JavaScript intentionally mirrors the requested service boundaries:

- `CriteriaAnalysisService`
- `RuleBasedCriteriaService`
- `SourcePlanner`
- `CandidateSource`
- `OpenAlexCandidateSource`
- `GitHubCandidateSource`
- `MockCandidateSource`
- `SearchLinkProvider`

## Assumptions

- The live candidate search uses OpenAlex public scholarly records and requires browser network access.
- GitHub repository and contributor search uses the public GitHub API. Without a GitHub token, public search rate limits can apply.
- The product optimises for a small, high-evidence candidate set rather than a large candidate database.
- Candidates with private work histories, private repositories, or profiles visible only on restricted professional platforms may not be discovered.
- AI JD parsing requires a backend with `OPENAI_API_KEY`. Without that key, the frontend automatically uses local rules and does not incur AI API cost.
- Language ability, current enrollment, graduation date, visa, and availability can be captured as criteria but must be verified manually; OpenAlex cannot prove them.
- LinkedIn and Google Scholar remain manual verification links only.
- Candidate status and recruiter notes are stored in browser `localStorage`.

## Unnecessary complexity intentionally omitted

- Authentication, SSO, permissions, dashboards, ATS workflows, automated outreach, scheduling, real integrations, scraping, browser automation, salary/personality/culture-fit analysis, and protected-characteristic inference.

## Local setup

Open `index.html` directly, or run:

```bash
node server.js
```

Then visit `http://127.0.0.1:8011`.

To enable real AI criteria parsing:

```bash
export OPENAI_API_KEY="your_api_key"
export OPENAI_MODEL="gpt-4.1-mini"
node server.js
```

OpenAI API calls are paid usage. If `OPENAI_API_KEY` is not set, `/api/analyze-jd` returns unavailable and the browser falls back to the free local parser.

GitHub Pages can only host the static frontend, so it cannot securely store an API key. Use Render/Vercel/Railway or another backend for `POST /api/analyze-jd`.

## Free live-data functions

- `CriteriaAnalysisService.extractCriteria`
- `RuleBasedCriteriaService.extractCriteria`
- `RuleBasedCriteriaService.expandResearchTerms`
- `RuleBasedCriteriaService.explainCandidateMatch`
- `OpenAlexCandidateSource.search`
- `OpenAlexCandidateSource.aggregateAuthors`
- `scoreOpenAlexCandidate`
- `renderSimilarCandidates`

## Not yet implemented

- Production auth and backend persistence
- SQLite persistence
- Pydantic models
- React/TypeScript/Vite frontend
- Backend tests and frontend production build
- GitHub public API integration
- Database migrations
- Docker Compose
