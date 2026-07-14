# AI Talent Research Workspace

Simple MVP prototype for technical recruiters researching specialised candidates with free live OpenAlex publication search.

## Core MVP in 10 points

1. Recruiter enters a natural-language talent requirement.
2. A free rule-based parser extracts structured criteria and expands related terms.
3. Recruiter can add or remove criteria before research starts.
4. OpenAlex live search retrieves real public scholarly works and aggregates authors as candidates.
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
- `app.js`: rule-based JD parser, source-provider interfaces, OpenAlex source, search-link provider, scoring, persistence, and UI rendering.

The JavaScript intentionally mirrors the requested service boundaries:

- `MockLLMService`
- `CandidateSource`
- `OpenAlexCandidateSource`
- `MockCandidateSource`
- `SearchLinkProvider`

## Assumptions

- The live candidate search uses OpenAlex public scholarly records and requires browser network access.
- The JD parser is not a paid LLM yet; it uses local rules and technical term extraction.
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

## Free live-data functions

- `MockLLMService.extractCriteria`
- `MockLLMService.expandResearchTerms`
- `MockLLMService.explainCandidateMatch`
- `OpenAlexCandidateSource.search`
- `OpenAlexCandidateSource.aggregateAuthors`
- `scoreOpenAlexCandidate`
- `renderSimilarCandidates`

## Not yet implemented

- FastAPI backend
- SQLite persistence
- Pydantic models
- React/TypeScript/Vite frontend
- Backend tests and frontend production build
- GitHub public API integration
- Real LLM provider
- Database migrations
- Docker Compose
