# AI Talent Research Workspace

Simple Phase 1 MVP prototype for technical recruiters researching specialised candidates.

## Core MVP in 10 points

1. Recruiter enters a natural-language talent requirement.
2. Mock AI extracts structured criteria and expands related terms.
3. Recruiter can add or remove criteria before research starts.
4. Mock source provider searches 14 realistic public-profile-style candidates.
5. Candidate cards show score, top reasons, expertise, confidence, and status.
6. Candidate Brief shows evidence-linked reasons, score breakdown, timeline, publications, sources, and uncertainty.
7. Recruiter can change status, add notes, tags, rejection reason, public URL, verified information, and corrections.
8. Manual verification links open LinkedIn, Google Scholar, GitHub, company, and web searches in new tabs.
9. Recruiter can shortlist candidates and find similar candidates from the mock dataset.
10. Recruiter can manually add a candidate, labelled as recruiter-entered information.

## Architecture

The current repository is a plain static web app, so Phase 1 is implemented as a local browser prototype:

- `index.html`: application shell and dialogs.
- `styles.css`: responsive research-workspace UI.
- `app.js`: mock LLM service, source-provider interfaces, mock candidate source, search-link provider, scoring, persistence, and UI rendering.

The JavaScript intentionally mirrors the requested service boundaries:

- `MockLLMService`
- `CandidateSource`
- `MockCandidateSource`
- `SearchLinkProvider`

## Assumptions

- Phase 1 can run without paid AI APIs, backend dependencies, or network access.
- Mock source URLs are placeholders for source-attribution behavior.
- LinkedIn and Google Scholar remain manual verification links only.
- Candidate status and recruiter notes are stored in browser `localStorage`.

## Unnecessary complexity intentionally omitted

- Authentication, SSO, permissions, dashboards, ATS workflows, automated outreach, scheduling, real integrations, scraping, browser automation, salary/personality/culture-fit analysis, and protected-characteristic inference.

## Local setup

Open `index.html` directly, or run:

```bash
python3 -m http.server 8011
```

Then visit `http://127.0.0.1:8011`.

## Mock-data functions

- `MockLLMService.extractCriteria`
- `MockLLMService.expandResearchTerms`
- `MockLLMService.explainCandidateMatch`
- `MockCandidateSource.search`
- `scoreCandidate`
- `renderSimilarCandidates`

## Not yet implemented

- FastAPI backend
- SQLite persistence
- Pydantic models
- React/TypeScript/Vite frontend
- Backend tests and frontend production build
- OpenAlex integration
- GitHub public API integration
- Real LLM provider
- Database migrations
- Docker Compose
