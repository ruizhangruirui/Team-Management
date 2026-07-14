"use strict";

const STORAGE_KEY = "ai-talent-research-mvp-v1";
const AI_CRITERIA_ENDPOINT_KEY = "ai-talent-research-ai-endpoint";
const DEFAULT_AI_CRITERIA_ENDPOINT = "/api/analyze-jd";
const TODAY = new Date().toISOString().slice(0, 10);
const STATUSES = ["New", "Reviewing", "Potential Fit", "Strong Fit", "Not Relevant", "Shortlisted", "Archived"];
const REJECTION_REASONS = [
  "Wrong research focus",
  "Insufficient seniority",
  "Wrong location",
  "Irrelevant industry",
  "Duplicate",
  "Information could not be verified",
  "Other",
];
const TECHNICAL_TERM_LIBRARY = [
  "CUDA", "Triton", "MLIR", "TVM", "LLVM", "XLA", "JAX", "PyTorch", "TensorFlow",
  "robotic planning", "motion planning", "reinforcement learning", "LLM evaluation",
  "multimodal", "vision-language models", "computer vision", "natural language processing",
  "retrieval augmented generation", "RAG", "AI compiler", "compiler optimisation",
  "kernel optimisation", "GPU kernels", "distributed training", "model serving",
  "benchmarking", "model evaluation", "foundation models", "transformers",
  "graph neural networks", "autonomous systems", "speech recognition", "edge AI",
  "SLAM", "control theory", "optimization", "Bayesian optimization", "causal inference",
  "time series", "recommendation systems", "information retrieval", "knowledge graphs",
  "privacy preserving machine learning", "federated learning", "adversarial robustness",
  "quantization", "model compression", "accelerator architecture", "high performance computing",
  "parallel programming", "large language models", "agentic AI", "tool use", "alignment",
];
const KNOWN_COMPANY_NAMES = [
  "DeepMind", "Meta", "NVIDIA", "Huawei", "Google", "Microsoft", "Amazon", "Apple",
  "Intel", "ARM", "Qualcomm", "Anthropic", "OpenAI", "Adobe", "IBM", "Oracle",
  "Samsung", "Sony", "Bosch", "Siemens", "ByteDance", "Tencent", "Alibaba",
];

const state = {
  projects: [],
  activeProjectId: "",
  manualCandidates: [],
  activeView: "research",
};

const sourceArchitecture = {
  AccessMode: {
    API: "api",
    SEARCH_LINK: "search_link",
    MANUAL_INPUT: "manual_input",
  },
  CandidateSource: class CandidateSource {
    constructor(name, accessMode) {
      this.name = name;
      this.accessMode = accessMode;
    }

    async search() {
      throw new Error("CandidateSource.search must be implemented by subclasses.");
    }

    normalizeResult(rawResult) {
      return rawResult;
    }
  },
};

class CriteriaAnalysisService {
  constructor() {
    this.localParser = new RuleBasedCriteriaService();
    this.lastAnalysisMode = "Local rules";
  }

  async extractCriteria(userInput) {
    const localCriteria = await this.localParser.extractCriteria(userInput);
    const endpoint = getAiCriteriaEndpoint();
    if (!endpoint) {
      this.lastAnalysisMode = "Local rules";
      return localCriteria;
    }
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ job_description: userInput }),
      }, 18000);
      if (!response.ok) {
        throw new Error(`AI parser returned ${response.status}`);
      }
      const payload = await response.json();
      if (!payload?.criteria) {
        throw new Error("AI parser returned no criteria.");
      }
      this.lastAnalysisMode = payload.mode === "ai" ? "AI analyzed" : "Local rules";
      return normalizeCriteria(payload.criteria, localCriteria);
    } catch (error) {
      console.warn("AI criteria parser unavailable; using local parser.", error);
      this.lastAnalysisMode = "Local rules fallback";
      return localCriteria;
    }
  }

  async expandResearchTerms(criteria) {
    return this.localParser.expandResearchTerms(criteria);
  }

  async explainCandidateMatch(candidate, criteria, score) {
    return this.localParser.explainCandidateMatch(candidate, criteria, score);
  }
}

class RuleBasedCriteriaService {
  async extractCriteria(userInput) {
    const text = userInput.toLowerCase();
    const jdTerms = extractJdTerms(userInput);
    const criteria = {
      target_roles: pickByText(text, {
        researcher: ["Research Scientist", "Senior Research Scientist", "Applied Scientist"],
        engineer: ["Senior Software Engineer", "Applied Scientist", "Technical Specialist"],
        phd: ["PhD Candidate", "Postdoctoral Researcher", "Recent PhD Graduate"],
        graduate: ["Recent PhD Graduate", "PhD Candidate", "Postdoctoral Researcher"],
        intern: ["Research Intern", "PhD Candidate", "Master Student"],
        campus: ["Research Intern", "PhD Candidate", "Recent PhD Graduate"],
      }, ["Research Scientist", "Applied Scientist"]),
      seniority: text.includes("senior") || text.includes("principal") ? "senior" : text.includes("phd") ? "doctoral" : "not specified",
      core_technical_skills: unique([...extractKnownTerms(text, TECHNICAL_TERM_LIBRARY), ...jdTerms.skills]),
      research_topics: unique([...extractResearchTopics(text), ...jdTerms.topics]),
      related_terminology: [],
      publication_keywords: [],
      target_companies: unique([...extractKnownTerms(text, KNOWN_COMPANY_NAMES), ...jdTerms.companies]),
      relevant_industries: pickIndustries(text),
      universities: unique([...extractKnownTerms(text, ["ETH Zurich", "EPFL", "Oxford", "Cambridge", "TU Munich", "Imperial College London", "Stanford", "MIT", "Carnegie Mellon", "Berkeley"]), ...jdTerms.universities]),
      academic_background: text.includes("phd") ? ["PhD", "doctoral research"] : [],
      location: unique([...extractKnownTerms(text, ["Europe", "Switzerland", "Zurich", "Germany", "UK", "London", "France", "Paris", "Netherlands", "United States", "China", "Singapore", "Canada"]), ...jdTerms.locations]),
      languages_required: jdTerms.languages.required,
      languages_preferred: jdTerms.languages.preferred,
      degree_stage: jdTerms.degreeStage,
      availability: jdTerms.availability,
      manually_verify: jdTerms.manualVerification,
      jd_keywords: jdTerms.phrases,
      required_criteria: jdTerms.required,
      preferred_criteria: jdTerms.preferred,
      exclusion_criteria: jdTerms.exclusions,
    };
    criteria.related_terminology = expandTerms([...criteria.core_technical_skills, ...criteria.research_topics]);
    criteria.publication_keywords = unique([...criteria.research_topics, ...criteria.core_technical_skills, ...criteria.related_terminology, ...jdTerms.phrases]).slice(0, 12);
    return fillEmptyCriteria(criteria);
  }

  async expandResearchTerms(criteria) {
    const topics = unique([...criteria.research_topics, ...criteria.core_technical_skills, ...criteria.related_terminology]);
    return {
      professional_title_queries: criteria.target_roles.map((role) => `${role} ${topics[0] || "AI research"}`),
      research_topic_queries: topics.map((topic) => `"${topic}" researcher`),
      publication_queries: criteria.publication_keywords.map((term) => `"${term}" publication`),
      university_queries: criteria.universities.map((uni) => `${uni} ${topics[0] || "machine learning"}`),
      company_queries: criteria.target_companies.map((company) => `${company} ${topics[0] || "research scientist"}`),
      github_queries: topics.map((topic) => `${topic} GitHub`),
      personal_website_queries: criteria.target_roles.map((role) => `${role} personal website ${criteria.location[0] || ""}`.trim()),
      manual_verification_links: ["LinkedIn person search", "Google Scholar author search", "Company website search"],
    };
  }

  async explainCandidateMatch(candidate, criteria, score) {
    return candidate.matchReasons
      .filter((reason) => hasSource(candidate, reason.sourceIds))
      .slice(0, 5)
      .map((reason) => ({ ...reason, score: score.total }));
  }
}

class MockCandidateSource extends sourceArchitecture.CandidateSource {
  constructor() {
    super("MockCandidateSource", sourceArchitecture.AccessMode.MANUAL_INPUT);
  }

  async search(criteria, limit = 12) {
    const all = [...MOCK_CANDIDATES, ...state.manualCandidates];
    return all
      .map((candidate) => ({ candidate, score: scoreCandidate(candidate, criteria) }))
      .filter((entry) => entry.score.total >= 18 || entry.candidate.enteredManually)
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, limit)
      .map((entry) => this.normalizeResult({ ...entry.candidate, scoreBreakdown: entry.score.breakdown, totalScore: entry.score.total }));
  }
}

class OpenAlexCandidateSource extends sourceArchitecture.CandidateSource {
  constructor() {
    super("OpenAlexSource", sourceArchitecture.AccessMode.API);
  }

  async search(criteria, limit = 16, options = {}) {
    const queries = buildOpenAlexQueries(criteria, options).slice(0, 4);
    if (!queries.length) {
      throw new Error("No searchable research terms were extracted from this requirement.");
    }
    const workMap = new Map();
    for (const query of queries) {
      const works = await this.fetchWorks(query, options);
      works.forEach((work) => workMap.set(work.id, { ...work, matchedQuery: query }));
    }
    const candidates = this.aggregateAuthors([...workMap.values()], criteria, options);
    if (options.candidateStage === "early-career") {
      await this.hydrateAuthorMetrics(candidates);
    }
    return candidates
      .filter((candidateRecord) => !isExcludedByCandidateStage(candidateRecord, options))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  async fetchWorks(query, options = {}) {
    const params = new URLSearchParams({
      search: query,
      filter: "from_publication_date:2021-01-01,is_retracted:false",
      sort: "relevance_score:desc",
      "per-page": "20",
      select: "id,doi,title,display_name,publication_year,primary_location,authorships,topics,keywords,cited_by_count,relevance_score",
    });
    const response = await fetch(`https://api.openalex.org/works?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`OpenAlex request failed with status ${response.status}`);
    }
    const payload = await response.json();
    return payload.results || [];
  }

  async hydrateAuthorMetrics(candidates) {
    await Promise.all(candidates.slice(0, 30).map(async (candidate) => {
      try {
        const params = new URLSearchParams({
          select: "id,works_count,cited_by_count,summary_stats",
        });
        const response = await fetch(`${candidate.openAlexAuthorId}?${params.toString()}`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;
        const payload = await response.json();
        candidate.openAlexWorksCount = Number(payload.works_count || 0);
        candidate.openAlexCitedByCount = Number(payload.cited_by_count || 0);
        candidate.openAlexHIndex = Number(payload.summary_stats?.h_index || 0);
      } catch (error) {
        console.warn("OpenAlex author metrics unavailable.", error);
      }
    }));
  }

  aggregateAuthors(works, criteria, options = {}) {
    const authors = new Map();
    works.forEach((work) => {
      (work.authorships || []).forEach((authorship) => {
        if (options.searchMode === "swiss-campus" && !hasSwissUniversityEvidence(authorship)) return;
        const author = authorship.author || {};
        if (!author.id || !author.display_name) return;
        if (!authors.has(author.id)) {
          authors.set(author.id, {
            id: `openalex-${author.id.split("/").pop()}`,
            openAlexAuthorId: author.id,
            fullName: author.display_name,
            currentTitle: "Research author",
            currentOrganisation: "",
            previousOrganisations: [],
            location: "",
            education: "Evidence unavailable",
            university: "",
            skills: [],
            researchTopics: [],
            summary: "",
            publications: [],
            sourceIds: [],
            sourceRecords: [],
            githubUrl: "",
            personalWebsite: author.id,
            orcidUrl: author.orcid || "",
            linkedinSearchLink: "",
            scholarSearchLink: "",
            timeline: [],
            matchReasons: [],
            missingInformation: [
              "Current employer and title are not verified; OpenAlex affiliations may come from publication metadata.",
              ...(options.searchMode === "swiss-campus" ? ["Current student status is not verified; recruiter must confirm enrollment manually."] : []),
              "Employment dates are unavailable.",
              "GitHub and LinkedIn profiles require manual verification.",
            ],
            enteredManually: false,
            createdAt: TODAY,
            updatedAt: TODAY,
            _institutions: [],
            _countries: [],
            _citations: 0,
            _authorPositions: [],
            _matchedQueries: [],
          });
        }
        const candidateRecord = authors.get(author.id);
        const institutions = (authorship.institutions || []).map((institution) => institution.display_name).filter(Boolean);
        const countries = authorship.countries || [];
        candidateRecord._institutions.push(...institutions);
        candidateRecord._countries.push(...countries);
        candidateRecord._authorPositions.push(authorship.author_position || "");
        candidateRecord._matchedQueries.push(work.matchedQuery);
        candidateRecord._citations += Number(work.cited_by_count || 0);
        const sourceUrl = work.primary_location?.landing_page_url || work.doi || work.id;
        const venue = work.primary_location?.source?.display_name || work.primary_location?.raw_source_name || "OpenAlex record";
        candidateRecord.publications.push({
          title: work.display_name || work.title || "Untitled work",
          year: work.publication_year || "Date not verified",
          venue,
          abstract: "",
          sourceUrl,
          relevanceExplanation: `Matched OpenAlex query: ${work.matchedQuery}`,
          relevanceScore: Math.round(work.relevance_score || 0),
        });
        const sourceId = `source-${candidateRecord.id}-${work.id.split("/").pop()}`;
        candidateRecord.sourceIds.push(sourceId);
        candidateRecord.sourceRecords.push({
          id: sourceId,
          sourceType: "OpenAlex work",
          sourceTitle: work.display_name || work.title || "Untitled work",
          sourceUrl: work.id,
          extractedFacts: [
            `Publication year: ${work.publication_year || "Date not verified"}`,
            `Venue/source: ${venue}`,
            `Matched query: ${work.matchedQuery}`,
          ],
          sourceConfidence: "High",
          retrievalDate: TODAY,
          enteredManually: false,
        });
        candidateRecord.researchTopics.push(...extractWorkTopics(work), work.matchedQuery);
        candidateRecord.skills.push(...extractWorkKeywords(work), ...criteria.core_technical_skills);
      });
    });

    return [...authors.values()].map((candidateRecord) => this.finalizeCandidate(candidateRecord, criteria, options));
  }

  finalizeCandidate(candidateRecord, criteria, options = {}) {
    candidateRecord.publications = uniqueBy(candidateRecord.publications, (publication) => publication.sourceUrl || publication.title)
      .sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0))
      .slice(0, 5);
    candidateRecord.sourceRecords = uniqueBy(candidateRecord.sourceRecords, (record) => record.sourceUrl || record.sourceTitle);
    candidateRecord.sourceIds = candidateRecord.sourceRecords.map((record) => record.id);
    candidateRecord.currentOrganisation = mostCommon(candidateRecord._institutions) || "Evidence unavailable";
    candidateRecord.location = mostCommon(candidateRecord._countries) || "Evidence unavailable";
    candidateRecord.university = candidateRecord.currentOrganisation;
    candidateRecord.skills = unique(candidateRecord.skills).slice(0, 8);
    candidateRecord.researchTopics = unique(candidateRecord.researchTopics).slice(0, 8);
    candidateRecord.summary = `OpenAlex found ${candidateRecord.publications.length} recent public work(s) connected to this requirement.`;
    candidateRecord.timeline = candidateRecord.publications.map((publication) => ({
      date: String(publication.year || "Date not verified"),
      label: publication.title,
      source: "OpenAlex work",
    }));
    candidateRecord.matchReasons = [
      { text: `Has ${candidateRecord.publications.length} recent OpenAlex-indexed publication(s) matching this project.`, sourceIds: candidateRecord.sourceIds.slice(0, 2) },
      { text: `Matched research terms: ${unique(candidateRecord._matchedQueries).slice(0, 3).join(", ")}.`, sourceIds: candidateRecord.sourceIds.slice(0, 2) },
      { text: `Publication metadata links the author to ${candidateRecord.currentOrganisation}.`, sourceIds: candidateRecord.sourceIds.slice(0, 1) },
      ...(options.candidateStage === "early-career" ? [{ text: "Strict early-career mode requires first-author evidence and filters high-output PI-style profiles where OpenAlex author metrics are available.", sourceIds: candidateRecord.sourceIds.slice(0, 2) }] : []),
      ...(options.searchMode === "swiss-campus" ? [{ text: "Swiss university affiliation appears in OpenAlex publication authorship metadata.", sourceIds: candidateRecord.sourceIds.slice(0, 2) }] : []),
    ];
    const score = scoreOpenAlexCandidate(candidateRecord, criteria);
    candidateRecord.scoreBreakdown = score.breakdown;
    candidateRecord.totalScore = score.total;
    candidateRecord.evidenceConfidence = computeConfidence(candidateRecord);
    delete candidateRecord._institutions;
    delete candidateRecord._countries;
    delete candidateRecord._citations;
    candidateRecord.authorPositions = unique(candidateRecord._authorPositions);
    delete candidateRecord._authorPositions;
    delete candidateRecord._matchedQueries;
    return candidateRecord;
  }
}

class GitHubCandidateSource extends sourceArchitecture.CandidateSource {
  constructor() {
    super("GitHubSource", sourceArchitecture.AccessMode.API);
  }

  async search(criteria, limit = 8) {
    const queries = buildGitHubQueries(criteria).slice(0, 3);
    if (!queries.length) return [];
    const repoMap = new Map();
    for (const query of queries) {
      const repos = await this.fetchRepositories(query);
      repos.forEach((repo) => {
        const owner = repo.owner?.login;
        if (!owner) return;
        const existing = repoMap.get(owner) || { owner, repos: [], matchedQueries: [] };
        existing.repos.push(repo);
        existing.matchedQueries.push(query);
        repoMap.set(owner, existing);
      });
    }
    const leads = await Promise.all([...repoMap.values()].slice(0, limit * 2).map((entry) => this.buildLead(entry, criteria)));
    return leads
      .filter(Boolean)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  async fetchRepositories(query) {
    const params = new URLSearchParams({
      q: `${query} in:name,description,readme`,
      sort: "stars",
      order: "desc",
      per_page: "10",
    });
    const response = await fetch(`https://api.github.com/search/repositories?${params.toString()}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      throw new Error(`GitHub repository search failed with status ${response.status}`);
    }
    const payload = await response.json();
    return payload.items || [];
  }

  async fetchUser(login) {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return null;
    return response.json();
  }

  async buildLead(entry, criteria) {
    const profile = await this.fetchUser(entry.owner);
    const repos = uniqueBy(entry.repos, (repo) => repo.html_url).slice(0, 4);
    const sourceRecords = repos.map((repo, index) => ({
      id: `github-source-${entry.owner}-${index}`,
      sourceType: "GitHub repository",
      sourceTitle: repo.full_name || repo.name || "GitHub repository",
      sourceUrl: repo.html_url || "",
      extractedFacts: [
        `Repository description: ${repo.description || "Not provided"}`,
        `Stars: ${repo.stargazers_count || 0}`,
        `Primary language: ${repo.language || "Evidence unavailable"}`,
      ],
      sourceConfidence: repo.stargazers_count >= 20 ? "Medium" : "Low",
      retrievalDate: TODAY,
      enteredManually: false,
    }));
    const skills = inferGitHubSkills(repos, criteria);
    const candidate = {
      id: `github-${entry.owner}`,
      fullName: profile?.name || entry.owner,
      currentTitle: "GitHub technical lead",
      currentOrganisation: profile?.company || "Evidence unavailable",
      previousOrganisations: [],
      location: profile?.location || "Evidence unavailable",
      education: "Evidence unavailable",
      university: "Evidence unavailable",
      skills,
      researchTopics: unique([...skills, ...entry.matchedQueries]).slice(0, 8),
      summary: `GitHub found ${repos.length} public repository lead(s) connected to this requirement.`,
      publications: [],
      sourceIds: sourceRecords.map((record) => record.id),
      sourceRecords,
      githubUrl: profile?.html_url || `https://github.com/${entry.owner}`,
      personalWebsite: profile?.blog || profile?.html_url || `https://github.com/${entry.owner}`,
      orcidUrl: "",
      linkedinSearchLink: "",
      scholarSearchLink: "",
      timeline: repos.map((repo) => ({
        date: repo.updated_at ? repo.updated_at.slice(0, 10) : "Date not verified",
        label: repo.full_name || repo.name,
        source: "GitHub repository",
      })),
      matchReasons: [
        { text: `Owns or contributes to GitHub repositories matching: ${unique(entry.matchedQueries).slice(0, 3).join(", ")}.`, sourceIds: sourceRecords.slice(0, 2).map((record) => record.id) },
        { text: `Repository evidence includes ${repos.map((repo) => repo.full_name).filter(Boolean).slice(0, 2).join(", ")}.`, sourceIds: sourceRecords.slice(0, 2).map((record) => record.id) },
      ],
      missingInformation: [
        "Identity, current employer, seniority, and availability require manual verification.",
        "GitHub activity does not prove employment history or degree status.",
        "LinkedIn, company page, patent, and web evidence should be checked before outreach.",
      ],
      enteredManually: false,
      createdAt: TODAY,
      updatedAt: TODAY,
    };
    const score = scoreGitHubCandidate(candidate, repos, criteria);
    candidate.scoreBreakdown = score.breakdown;
    candidate.totalScore = score.total;
    candidate.evidenceConfidence = computeConfidence(candidate);
    return candidate;
  }
}

class SearchLinkProvider extends sourceArchitecture.CandidateSource {
  constructor() {
    super("SearchLinkProvider", sourceArchitecture.AccessMode.SEARCH_LINK);
  }

  searchLinks(candidate) {
    const q = encodeURIComponent(`${candidate.fullName} ${candidate.currentOrganisation || ""}`);
    return {
      linkedin: candidate.linkedinSearchLink || `https://www.linkedin.com/search/results/people/?keywords=${q}`,
      scholar: candidate.scholarSearchLink || `https://scholar.google.com/scholar?q=${q}`,
      github: candidate.githubUrl || `https://github.com/search?q=${q}&type=users`,
      web: `https://www.google.com/search?q=${q}`,
      company: `https://www.google.com/search?q=${q}+company+profile`,
    };
  }
}

const llmService = new CriteriaAnalysisService();
const openAlexSource = new OpenAlexCandidateSource();
const githubSource = new GitHubCandidateSource();
const linkProvider = new SearchLinkProvider();

const MOCK_CANDIDATES = [
  candidate("c-001", "Dr. Elena Kovacs", "Senior Research Scientist", "ETH AI Center", ["Google Research"], "Zurich, Switzerland", "PhD Computer Vision, ETH Zurich", "ETH Zurich", ["multimodal evaluation", "vision-language models", "benchmarking", "PyTorch"], ["multimodal foundation models", "LLM evaluation", "vision-language learning"], "Recent public work centers on evaluating vision-language models and multimodal benchmarks.", [
    pub("Measuring Robustness in Vision-Language Evaluation", 2025, "ICLR Workshop", "Directly matches multimodal evaluation.", "https://example.org/kovacs-vlm-eval", 94),
    pub("Dataset Bias in Image-Text Benchmarks", 2023, "NeurIPS Workshop", "Supports benchmark quality expertise.", "https://example.org/kovacs-bias", 86),
  ], ["e1", "e2", "e3"], ["Location may reflect the university profile and should be verified.", "Current employer has not been independently verified from a company page."]),
  candidate("c-002", "Marco Stein", "Principal CUDA Engineer", "NVIDIA", ["Siemens"], "Munich, Germany", "MSc Computer Engineering, TU Munich", "TU Munich", ["CUDA", "kernel optimisation", "Triton", "profiling", "C++"], ["GPU kernels", "deep learning systems"], "Public talks and repositories indicate strong GPU kernel optimisation experience.", [
    pub("Warp-Level Optimisation Patterns for Transformer Kernels", 2024, "GTC", "Highly relevant to CUDA optimisation.", "https://example.org/stein-warp", 91),
  ], ["e4", "e5"], ["No verified academic publication profile was found."]),
  candidate("c-003", "Dr. Priya Natarajan", "Research Scientist", "University of Oxford", ["Meta AI"], "Oxford, UK", "PhD Machine Learning, University of Cambridge", "University of Cambridge", ["AI compilers", "MLIR", "TVM", "graph optimisation", "Python"], ["machine learning compilers", "tensor compiler optimisation"], "Work connects compiler IR research with ML model deployment.", [
    pub("Shape-Aware Optimisation in MLIR Pipelines", 2025, "MLSys", "Strong AI compiler match.", "https://example.org/natarajan-mlir", 96),
    pub("Scheduling Tensor Programs for Edge Accelerators", 2022, "CGO", "Older compiler systems evidence.", "https://example.org/natarajan-tensor", 81),
  ], ["e6", "e7", "e8"], ["Current employment dates are incomplete."]),
  candidate("c-004", "Jonas Meyer", "PhD Candidate, Robotics", "EPFL", [], "Lausanne, Switzerland", "PhD Candidate Robotics, EPFL", "EPFL", ["robotic planning", "motion planning", "ROS", "reinforcement learning"], ["robot planning", "learning-based control"], "Doctoral work focuses on planning for mobile manipulation.", [
    pub("Learning Heuristics for Long-Horizon Robot Planning", 2024, "ICRA", "Directly relevant to robotic planning.", "https://example.org/meyer-planning", 89),
  ], ["e9", "e10"], ["Expected graduation date is not verified.", "Industry experience unavailable."]),
  candidate("c-005", "Dr. Sara Bellini", "Applied Scientist", "Amazon AGI", ["University of Milan"], "Berlin, Germany", "PhD NLP, University of Milan", "University of Milan", ["LLM evaluation", "retrieval augmented generation", "NLP", "model safety"], ["LLM evaluation", "foundation model assessment"], "Public profile suggests applied evaluation work for language models.", [
    pub("Task-Oriented Evaluation of Retrieval-Augmented LLMs", 2025, "ACL Findings", "Relevant evaluation publication.", "https://example.org/bellini-rag-eval", 88),
  ], ["e11", "e12"], ["Exact team inside current organisation is not verified."]),
  candidate("c-006", "Tom Weber", "Senior Software Engineer", "Graphcore", ["ARM"], "Bristol, UK", "MEng Computer Science, Imperial College London", "Imperial College London", ["LLVM", "compiler optimisation", "C++", "accelerators"], ["AI accelerators", "compiler backends"], "Engineering profile aligns with compiler backend and accelerator optimisation.", [
    pub("Practical Lowering Paths for Accelerator Backends", 2023, "LLVM Dev Meeting", "Relevant compiler engineering evidence.", "https://example.org/weber-lowering", 79),
  ], ["e13", "e14"], ["No personal website was found in mock sources."]),
  candidate("c-007", "Dr. Amina Haddad", "Postdoctoral Researcher", "INRIA", ["Sorbonne University"], "Paris, France", "PhD Computer Science, Sorbonne University", "Sorbonne University", ["multimodal learning", "representation learning", "evaluation", "French"], ["multimodal representation learning", "image-text models"], "Academic record shows multimodal representation and evaluation work.", [
    pub("Compositional Probes for Image-Text Models", 2024, "ECCV", "Strong vision-language publication.", "https://example.org/haddad-probes", 92),
  ], ["e15", "e16"], ["Availability and current project focus are unknown."]),
  candidate("c-008", "Lucas Pereira", "ML Systems Engineer", "DeepMind", ["University of Porto"], "London, UK", "MSc Distributed Systems, University of Porto", "University of Porto", ["XLA", "JAX", "distributed training", "profiling"], ["ML systems", "compiler runtime"], "Systems profile overlaps with XLA and model training infrastructure.", [
    pub("Runtime Profiling for JAX Training Workloads", 2024, "MLSys Workshop", "Relevant systems evidence.", "https://example.org/pereira-jax", 84),
  ], ["e17", "e18"], ["Education is not independently verified beyond a public biography."]),
  candidate("c-009", "Dr. Nina Schulte", "Research Group Lead", "TU Munich", ["Bosch AI"], "Munich, Germany", "PhD Robotics, TU Munich", "TU Munich", ["robotic planning", "autonomous systems", "probabilistic planning"], ["robot planning", "autonomous driving"], "Group page and publications indicate senior robotics planning expertise.", [
    pub("Risk-Aware Planning for Autonomous Robots", 2025, "RSS", "Direct match for planning research.", "https://example.org/schulte-risk", 93),
  ], ["e19", "e20"], ["No public GitHub profile was found."]),
  candidate("c-010", "Yuki Tanaka", "Technical Specialist, AI Compilers", "Huawei Noah's Ark Lab", ["Tokyo University"], "Paris, France", "MSc Computer Science, University of Tokyo", "University of Tokyo", ["TVM", "Triton", "kernel fusion", "Python", "C++"], ["tensor compiler", "kernel fusion"], "Mock profile represents compiler optimisation and kernel fusion experience.", [
    pub("Automatic Fusion Strategies for Transformer Operators", 2023, "arXiv", "Relevant to AI compiler and kernel fusion searches.", "https://example.org/tanaka-fusion", 85),
  ], ["e21", "e22"], ["This is mock data and must be replaced by verified public sources before use."]),
  candidate("c-011", "Dr. Clara Rossi", "Senior Applied Scientist", "Microsoft Research", ["EPFL"], "Cambridge, UK", "PhD Machine Learning, EPFL", "EPFL", ["multimodal LLMs", "evaluation", "human preference data"], ["multimodal foundation models", "model evaluation"], "Recent work connects multimodal LLMs and evaluation methodology.", [
    pub("Preference-Aware Evaluation for Multimodal Assistants", 2025, "ACL", "Strong match for multimodal LLM evaluation.", "https://example.org/rossi-preference", 95),
  ], ["e23", "e24"], ["Public profile URL should be manually confirmed."]),
  candidate("c-012", "Oskar Lind", "Open Source Compiler Engineer", "Independent", ["Ericsson"], "Stockholm, Sweden", "BSc Software Engineering, KTH", "KTH Royal Institute of Technology", ["MLIR", "LLVM", "Triton", "open source", "C++"], ["compiler infrastructure", "AI compilers"], "Public repositories indicate practical compiler infrastructure work.", [
    pub("MLIR Dialect Patterns for Sparse Tensor Workloads", 2024, "Open Source Summit", "Relevant technical talk.", "https://example.org/lind-mlir", 82),
  ], ["e25", "e26"], ["Current organisation is self-reported and should be verified."]),
  candidate("c-013", "Dr. Mei Zhang", "University Researcher", "University of Amsterdam", ["Tsinghua University"], "Amsterdam, Netherlands", "PhD AI, Tsinghua University", "Tsinghua University", ["vision-language models", "dataset curation", "multimodal benchmarks"], ["image-text models", "multimodal evaluation"], "Academic profile is a close match for benchmark-driven multimodal research.", [
    pub("Counterfactual Splits for Vision-Language Benchmarks", 2024, "CVPR", "Relevant benchmark publication.", "https://example.org/zhang-counterfactual", 90),
  ], ["e27", "e28"], ["Employment dates are incomplete."]),
  candidate("c-014", "Rafael Ortiz", "Senior Research Engineer", "Barcelona Supercomputing Center", ["Intel Labs"], "Barcelona, Spain", "PhD High Performance Computing, UPC", "UPC BarcelonaTech", ["CUDA", "HPC", "kernel optimisation", "distributed systems"], ["GPU computing", "AI infrastructure"], "HPC and CUDA record may fit kernel optimisation searches.", [
    pub("Memory-Tiling Methods for GPU Attention Kernels", 2025, "PPoPP", "Relevant CUDA kernel evidence.", "https://example.org/ortiz-tiling", 90),
  ], ["e29", "e30"], ["Recruiter should verify whether current work is AI-specific."]),
];

const SOURCE_RECORDS = {
  e1: source("Academic profile", "ETH AI Center profile for Elena Kovacs", "https://example.org/eth/kovacs", ["Current title", "Location", "Research topics"], "High"),
  e2: source("Publication record", "ICLR Workshop proceedings", "https://example.org/kovacs-vlm-eval", ["Publication title", "Publication year", "Venue"], "High"),
  e3: source("Personal website", "Elena Kovacs personal website", "https://example.org/kovacs", ["Research summary", "Education"], "Medium"),
  e4: source("Conference talk", "GTC speaker profile for Marco Stein", "https://example.org/stein-gtc", ["Current organisation", "CUDA focus"], "Medium"),
  e5: source("GitHub", "Marco Stein public repositories", "https://github.com/search?q=Marco+Stein+CUDA&type=users", ["Kernel optimisation activity"], "Medium"),
  e6: source("Academic profile", "Oxford research profile for Priya Natarajan", "https://example.org/oxford/natarajan", ["Current title", "Research topics"], "High"),
  e7: source("Publication record", "MLSys 2025 accepted papers", "https://example.org/natarajan-mlir", ["Publication evidence"], "High"),
  e8: source("Former employer profile", "Meta AI publication page", "https://example.org/meta/natarajan", ["Previous organisation"], "Medium"),
  e9: source("University profile", "EPFL robotics lab profile", "https://example.org/epfl/meyer", ["PhD status", "Research topic"], "High"),
  e10: source("Publication record", "ICRA paper page", "https://example.org/meyer-planning", ["Publication evidence"], "High"),
  e11: source("Publication record", "ACL Findings paper page", "https://example.org/bellini-rag-eval", ["Publication evidence"], "High"),
  e12: source("Company biography", "Amazon AGI public bio", "https://example.org/amazon/bellini", ["Current title", "Current organisation"], "Medium"),
  e13: source("Conference talk", "LLVM Dev Meeting talk", "https://example.org/weber-lowering", ["Compiler backend work"], "High"),
  e14: source("Company profile", "Graphcore engineering profile", "https://example.org/graphcore/weber", ["Current organisation"], "Medium"),
  e15: source("Academic profile", "INRIA profile for Amina Haddad", "https://example.org/inria/haddad", ["Current title", "Research topics"], "High"),
  e16: source("Publication record", "ECCV paper page", "https://example.org/haddad-probes", ["Publication evidence"], "High"),
  e17: source("Workshop page", "MLSys Workshop schedule", "https://example.org/pereira-jax", ["Relevant talk"], "Medium"),
  e18: source("Company biography", "DeepMind public biography", "https://example.org/deepmind/pereira", ["Current title", "Current organisation"], "Medium"),
  e19: source("University profile", "TU Munich research group profile", "https://example.org/tum/schulte", ["Group lead role", "Research area"], "High"),
  e20: source("Publication record", "RSS paper listing", "https://example.org/schulte-risk", ["Publication evidence"], "High"),
  e21: source("Company biography", "Noah's Ark Lab public profile", "https://example.org/huawei/tanaka", ["Current title", "Technical focus"], "Medium"),
  e22: source("Publication record", "arXiv preprint", "https://example.org/tanaka-fusion", ["Publication evidence"], "Medium"),
  e23: source("Company profile", "Microsoft Research profile", "https://example.org/msr/rossi", ["Current title", "Research focus"], "High"),
  e24: source("Publication record", "ACL paper page", "https://example.org/rossi-preference", ["Publication evidence"], "High"),
  e25: source("GitHub", "Oskar Lind public GitHub search", "https://github.com/search?q=Oskar+Lind+MLIR&type=users", ["Open source compiler work"], "Medium"),
  e26: source("Conference talk", "Open Source Summit session", "https://example.org/lind-mlir", ["Talk title", "Topic"], "Medium"),
  e27: source("Academic profile", "University of Amsterdam profile", "https://example.org/uva/zhang", ["Current title", "Research topics"], "High"),
  e28: source("Publication record", "CVPR paper page", "https://example.org/zhang-counterfactual", ["Publication evidence"], "High"),
  e29: source("Research center profile", "BSC profile for Rafael Ortiz", "https://example.org/bsc/ortiz", ["Current title", "HPC focus"], "Medium"),
  e30: source("Publication record", "PPoPP paper page", "https://example.org/ortiz-tiling", ["Publication evidence"], "High"),
};

Object.entries(SOURCE_RECORDS).forEach(([id, record]) => {
  record.id = id;
});
MOCK_CANDIDATES.forEach(hydrateCandidateSources);

function candidate(id, fullName, currentTitle, currentOrganisation, previousOrganisations, location, education, university, skills, researchTopics, summary, publications, sourceIds, missingInformation) {
  return {
    id,
    fullName,
    currentTitle,
    currentOrganisation,
    previousOrganisations,
    location,
    education,
    university,
    skills,
    researchTopics,
    summary,
    publications,
    sourceIds,
    githubUrl: "",
    personalWebsite: "",
    orcidUrl: "",
    linkedinSearchLink: "",
    scholarSearchLink: "",
    sourceRecords: [],
    timeline: buildTimeline(education, currentTitle, currentOrganisation, previousOrganisations),
    matchReasons: [
      { text: `Works on ${researchTopics.slice(0, 2).join(" and ")}.`, sourceIds: [sourceIds[0]] },
      { text: `Public evidence includes ${publications.length} relevant publication${publications.length === 1 ? "" : "s"}.`, sourceIds: [sourceIds[1] || sourceIds[0]] },
      { text: `Skills include ${skills.slice(0, 3).join(", ")}.`, sourceIds: [sourceIds[0]] },
      { text: education ? `Education evidence: ${education}.` : "Education evidence unavailable.", sourceIds: [sourceIds[2] || sourceIds[0]] },
    ],
    missingInformation,
    enteredManually: false,
    createdAt: TODAY,
    updatedAt: TODAY,
  };
}

function pub(title, year, venue, relevanceExplanation, sourceUrl, relevanceScore) {
  return { title, year, venue, abstract: "", sourceUrl, relevanceExplanation, relevanceScore };
}

function source(sourceType, sourceTitle, sourceUrl, extractedFacts, sourceConfidence) {
  return {
    sourceType,
    sourceTitle,
    sourceUrl,
    extractedFacts,
    sourceConfidence,
    retrievalDate: TODAY,
    enteredManually: false,
  };
}

function hydrateCandidateSources(candidateRecord) {
  candidateRecord.sourceRecords = candidateRecord.sourceIds.map((sourceId) => SOURCE_RECORDS[sourceId]).filter(Boolean);
  return candidateRecord;
}

function buildTimeline(education, currentTitle, currentOrganisation, previousOrganisations) {
  const timeline = [];
  if (education) timeline.push({ date: "Date not verified", label: education, source: "Education source" });
  previousOrganisations.forEach((org) => timeline.push({ date: "Date not verified", label: `Previous role, ${org}`, source: "Public profile" }));
  if (currentTitle || currentOrganisation) timeline.push({ date: "Date not verified", label: `${currentTitle || "Current role"}, ${currentOrganisation || "Evidence unavailable"}`, source: "Public profile" });
  return timeline;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    state.manualCandidates = saved.manualCandidates || [];
    state.projects = (saved.projects || []).map(normalizeProject);
    state.activeProjectId = saved.activeProjectId || state.projects[0]?.id || "";
    if (!state.projects.length && saved.candidateState) {
      state.projects = [normalizeProject({
        id: `project-${Date.now()}`,
        title: "Recovered research project",
        originalRequest: "",
        criteria: null,
        searchTerms: null,
        results: [],
        candidateState: saved.candidateState,
        status: "draft",
        createdAt: TODAY,
        updatedAt: TODAY,
      })];
      state.activeProjectId = state.projects[0].id;
    }
  } catch {
    state.manualCandidates = [];
    state.projects = [];
    state.activeProjectId = "";
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    projects: state.projects,
    activeProjectId: state.activeProjectId,
    manualCandidates: state.manualCandidates,
  }));
}

function normalizeProject(project) {
  return {
    id: project.id || `project-${Date.now()}`,
    title: project.title || "Untitled role",
    originalRequest: project.originalRequest || "",
    criteria: project.criteria || null,
    searchTerms: project.searchTerms || null,
    results: project.results || [],
    candidateState: project.candidateState || {},
    searchMode: project.searchMode || "openalex",
    candidateStage: project.candidateStage || "any",
    criteriaAnalysisMode: project.criteriaAnalysisMode || "Local rules",
    status: project.status || "draft",
    createdAt: project.createdAt || TODAY,
    updatedAt: project.updatedAt || TODAY,
  };
}

function activeProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) || null;
}

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function init() {
  loadState();
  bindEvents();
  renderStatusOptions();
  renderProjectList();
  renderActiveProject();
  renderShortlist();
}

function bindEvents() {
  $all(".nav-btn").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  $("#requirementInput").addEventListener("input", renderJdKeywordPreview);
  $("#analyseBtn").addEventListener("click", analyseRequirement);
  $("#newProjectBtn").addEventListener("click", newProjectDraft);
  $("#startResearchBtn").addEventListener("click", startResearch);
  $("#resetResearchBtn").addEventListener("click", resetResearch);
  $("#statusFilter").addEventListener("change", renderCandidates);
  $("#scoreFilter").addEventListener("input", () => {
    $("#scoreFilterValue").textContent = `${$("#scoreFilter").value}+`;
    renderCandidates();
  });
  $("#locationFilter").addEventListener("input", renderCandidates);
  $("#topicFilter").addEventListener("input", renderCandidates);
  $("#sortSelect").addEventListener("change", renderCandidates);
  $("#manualCandidateBtn").addEventListener("click", () => $("#manualDialog").showModal());
  $("#manualForm").addEventListener("submit", saveManualCandidate);
}

function newProjectDraft() {
  state.activeProjectId = "";
  $("#projectTitleInput").value = "";
  $("#searchModeSelect").value = "openalex";
  $("#candidateStageSelect").value = "any";
  $("#requirementInput").value = "";
  renderJdKeywordPreview();
  $("#criteriaSection").classList.add("is-hidden");
  $("#resultsSection").classList.add("is-hidden");
  resetFilters();
  renderProjectList();
  switchView("research");
  $("#projectTitleInput").focus();
}

function switchProject(projectId) {
  state.activeProjectId = projectId;
  saveState();
  renderProjectList();
  renderActiveProject();
  renderShortlist();
  switchView("research");
}

function renderProjectList() {
  const list = $("#projectList");
  if (!state.projects.length) {
    list.innerHTML = `<div class="project-empty">Create one project per role or hiring requirement.</div>`;
    return;
  }
  list.innerHTML = state.projects.map((project) => {
    const shortlistCount = Object.values(project.candidateState || {}).filter((record) => ["Shortlisted", "Strong Fit"].includes(record.status)).length;
    return `
      <button class="project-item ${project.id === state.activeProjectId ? "active" : ""}" type="button" data-project-id="${project.id}">
        <strong>${escapeHtml(project.title)}</strong>
        <small>${project.results.length} results · ${shortlistCount} shortlisted · ${escapeHtml(project.status)}</small>
      </button>
    `;
  }).join("");
  $all("[data-project-id]", list).forEach((button) => button.addEventListener("click", () => switchProject(button.dataset.projectId)));
}

function renderActiveProject() {
  const project = activeProject();
  $("#projectTitleInput").value = project?.title || "";
  $("#searchModeSelect").value = project?.searchMode || "openalex";
  $("#candidateStageSelect").value = project?.candidateStage || "any";
  $("#requirementInput").value = project?.originalRequest || "";
  renderJdKeywordPreview();
  if (!project?.criteria) {
    $("#criteriaSection").classList.add("is-hidden");
    $("#resultsSection").classList.add("is-hidden");
    return;
  }
  renderCriteria();
  renderCriteriaAnalysisMode();
  $("#criteriaSection").classList.remove("is-hidden");
  if (project.results.length) {
    renderStrategy();
    renderCandidates();
    $("#resultsSection").classList.remove("is-hidden");
  } else {
    $("#resultsSection").classList.add("is-hidden");
  }
}

function renderJdKeywordPreview() {
  const container = $("#jdKeywordPreview");
  if (!container) return;
  const input = $("#requirementInput").value.trim();
  if (!input) {
    container.innerHTML = `<span class="chip muted-chip">Enter a JD to detect search keywords.</span>`;
    return;
  }
  const terms = extractJdTerms(input);
  const detected = unique([
    ...terms.skills,
    ...terms.topics,
    ...terms.phrases,
    ...terms.universities,
    ...terms.locations,
    ...terms.languages.required,
    ...terms.languages.preferred,
    ...terms.degreeStage,
  ]).slice(0, 18);
  container.innerHTML = detected.length
    ? detected.map((term) => `<span class="chip">${escapeHtml(term)}</span>`).join("")
    : `<span class="chip muted-chip">No strong technical keywords detected yet.</span>`;
}

async function analyseRequirement() {
  const originalRequest = $("#requirementInput").value.trim();
  if (!originalRequest) {
    toast("Enter a talent requirement first.");
    return;
  }
  setLoading($("#analyseBtn"), "Analysing...");
  const nextTitle = $("#projectTitleInput").value.trim() || deriveProjectTitle(originalRequest);
  let project = activeProject() || findReusableProject(nextTitle, originalRequest);
  const isNewProject = !project;
  if (!project) {
    project = normalizeProject({
      id: `project-${Date.now()}`,
      createdAt: TODAY,
      candidateState: {},
    });
    state.projects.unshift(project);
    state.activeProjectId = project.id;
  } else {
    state.activeProjectId = project.id;
  }
  project.title = nextTitle;
  project.originalRequest = originalRequest;
  project.searchMode = $("#searchModeSelect").value;
  project.candidateStage = $("#candidateStageSelect").value;
  project.status = "criteria_review";
  project.updatedAt = TODAY;
  project.results = [];
  project.criteria = await llmService.extractCriteria(originalRequest);
  project.criteriaAnalysisMode = llmService.lastAnalysisMode;
  project.searchTerms = await llmService.expandResearchTerms(project.criteria);
  saveState();
  resetFilters();
  renderProjectList();
  renderCriteria();
  renderCriteriaAnalysisMode();
  $("#criteriaSection").classList.remove("is-hidden");
  $("#resultsSection").classList.add("is-hidden");
  clearLoading($("#analyseBtn"), "Analyse Requirement");
  toast(`Project ${isNewProject ? "created" : "updated"}: ${project.title}`);
}

function findReusableProject(title, originalRequest) {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedRequest = originalRequest.trim().toLowerCase();
  return state.projects.find((project) =>
    project.title.trim().toLowerCase() === normalizedTitle ||
    project.originalRequest.trim().toLowerCase() === normalizedRequest
  ) || null;
}

function renderCriteria() {
  const project = activeProject();
  if (!project?.criteria) return;
  const editor = $("#criteriaEditor");
  editor.innerHTML = "";
  Object.entries(project.criteria).forEach(([key, values]) => {
    const valueList = Array.isArray(values) ? values : [values].filter(Boolean);
    const card = document.createElement("article");
    card.className = "criterion-card";
    card.innerHTML = `
      <h3>${labelize(key)}</h3>
      <div class="chips">${valueList.map((value, index) => chipTemplate(key, value, index)).join("")}</div>
      <div class="add-row">
        <input aria-label="Add ${labelize(key)}" placeholder="Add criterion" />
        <button type="button">Add</button>
      </div>
    `;
    card.querySelector(".chips").addEventListener("click", (event) => {
      if (event.target.matches("button")) {
        removeCriterion(key, Number(event.target.dataset.index));
      }
    });
    card.querySelector(".add-row button").addEventListener("click", () => {
      const input = card.querySelector(".add-row input");
      addCriterion(key, input.value);
      input.value = "";
    });
    editor.append(card);
  });
}

function renderCriteriaAnalysisMode() {
  const project = activeProject();
  const mode = $("#criteriaAnalysisMode");
  if (!mode) return;
  const currentMode = project?.criteriaAnalysisMode || llmService.lastAnalysisMode;
  const isAi = currentMode === "AI analyzed";
  mode.textContent = isAi
    ? "AI-analyzed JD criteria. Edit before live OpenAlex research."
    : "Local rule-based fallback. Add OPENAI_API_KEY on the backend for true AI JD analysis.";
  mode.classList.toggle("ai-mode", isAi);
}

function chipTemplate(key, value, index) {
  return `<span class="chip">${escapeHtml(value)}<button type="button" data-key="${key}" data-index="${index}" aria-label="Remove ${escapeHtml(value)}">x</button></span>`;
}

function addCriterion(key, value) {
  const project = activeProject();
  if (!project?.criteria) return;
  const clean = value.trim();
  if (!clean) return;
  const current = Array.isArray(project.criteria[key]) ? project.criteria[key] : [project.criteria[key]].filter(Boolean);
  project.criteria[key] = unique([...current, clean]);
  project.updatedAt = TODAY;
  saveState();
  renderCriteria();
}

function removeCriterion(key, index) {
  const project = activeProject();
  if (!project?.criteria) return;
  const current = Array.isArray(project.criteria[key]) ? project.criteria[key] : [project.criteria[key]].filter(Boolean);
  project.criteria[key] = current.filter((_, itemIndex) => itemIndex !== index);
  project.updatedAt = TODAY;
  saveState();
  renderCriteria();
}

async function startResearch() {
  const project = activeProject();
  if (!project?.criteria) {
    toast("Create or select a project and review criteria first.");
    return;
  }
  setLoading($("#startResearchBtn"), project.searchMode === "swiss-campus" ? "Searching Swiss universities..." : "Searching OpenAlex...");
  project.searchTerms = await llmService.expandResearchTerms(project.criteria);
  try {
    setLoading($("#startResearchBtn"), "Searching public sources...");
    const [openAlexOutcome, githubOutcome] = await Promise.allSettled([
      openAlexSource.search(project.criteria, 16, { searchMode: project.searchMode, candidateStage: project.candidateStage }),
      githubSource.search(project.criteria, 8),
    ]);
    const sourceErrors = [openAlexOutcome, githubOutcome]
      .filter((outcome) => outcome.status === "rejected")
      .map((outcome) => outcome.reason?.message || "Source unavailable");
    const results = mergeCandidateResults([
      ...(openAlexOutcome.status === "fulfilled" ? openAlexOutcome.value : []),
      ...(githubOutcome.status === "fulfilled" ? githubOutcome.value : []),
    ]);
    project.results = await Promise.all(results.map(async (candidateRecord) => {
      const reasons = await llmService.explainCandidateMatch(candidateRecord, project.criteria, { total: candidateRecord.totalScore });
      return {
        ...candidateRecord,
        matchReasons: reasons.length ? reasons : candidateRecord.matchReasons,
        evidenceConfidence: computeConfidence(candidateRecord),
        reviewStatus: getCandidateState(candidateRecord.id).status,
      };
    }));
    if (sourceErrors.length) {
      toast(`Some sources were unavailable: ${sourceErrors.join("; ")}`);
    }
  } catch (error) {
    project.results = [];
    clearLoading($("#startResearchBtn"), "Start Research");
    toast(`Search failed: ${error.message}`);
    renderProjectList();
    return;
  }
  project.status = "researched";
  project.updatedAt = TODAY;
  saveState();
  renderProjectList();
  renderStrategy();
  renderCandidates();
  if (!project.results.length) {
    toast("No public-source candidates found. Try broader research terms.");
  }
  $("#resultsSection").classList.remove("is-hidden");
  $("#resultsSection").scrollIntoView({ behavior: "smooth", block: "start" });
  clearLoading($("#startResearchBtn"), "Start Research");
}

function renderStrategy() {
  const project = activeProject();
  $("#strategyTerms").innerHTML = Object.entries(project?.searchTerms || {}).map(([group, terms]) => `
    <div class="term-group">
      <strong>${labelize(group)}</strong>
      <div class="chips">${terms.map((term) => `<span class="chip">${escapeHtml(term)}</span>`).join("") || "<span class=\"chip\">Evidence unavailable</span>"}</div>
    </div>
  `).join("");
}

function renderStatusOptions() {
  $("#statusFilter").innerHTML = `<option value="all">All statuses</option>${STATUSES.map((status) => `<option value="${status}">${status}</option>`).join("")}`;
}

function renderCandidates() {
  const grid = $("#candidateGrid");
  const project = activeProject();
  if (!project) {
    grid.innerHTML = `<div class="empty-state">Create a project to start researching candidates.</div>`;
    return;
  }
  const filtered = getFilteredResults();
  const modeLabel = project.candidateStage === "early-career" ? "strict early-career public-source" : "public-source";
  $("#resultsSummary").textContent = `${filtered.length} ${modeLabel} candidate${filtered.length === 1 ? "" : "s"} shown for ${project.title}. OpenAlex and GitHub evidence are mixed and ranked by overall fit.`;
  grid.innerHTML = filtered.length ? filtered.map(candidateCardTemplate).join("") : `<div class="empty-state">No candidates match the current filters.</div>`;
  $all("[data-open-candidate]", grid).forEach((button) => button.addEventListener("click", () => openCandidate(button.dataset.openCandidate)));
}

function getFilteredResults() {
  const project = activeProject();
  if (!project) return [];
  const status = $("#statusFilter").value;
  const minimum = Number($("#scoreFilter").value);
  const location = $("#locationFilter").value.trim().toLowerCase();
  const topic = $("#topicFilter").value.trim().toLowerCase();
  const sort = $("#sortSelect").value;
  return project.results
    .filter((candidate) => status === "all" || getCandidateState(candidate.id).status === status)
    .filter((candidate) => candidate.totalScore >= minimum)
    .filter((candidate) => !location || candidate.location.toLowerCase().includes(location))
    .filter((candidate) => !topic || [...candidate.researchTopics, ...candidate.skills].some((item) => item.toLowerCase().includes(topic)))
    .sort((a, b) => {
      if (sort === "research") return b.scoreBreakdown.technical - a.scoreBreakdown.technical;
      if (sort === "recency") return latestPublicationYear(b) - latestPublicationYear(a);
      return b.totalScore - a.totalScore;
    });
}

function candidateCardTemplate(candidate) {
  const persisted = getCandidateState(candidate.id);
  const sourceBadges = evidenceSourceBadges(candidate);
  const verificationLinks = buildVerificationSearches(candidate, activeProject()?.criteria || fillEmptyCriteria({})).slice(0, 3);
  return `
    <article class="candidate-card">
      <div>
        <h3>${escapeHtml(candidate.fullName)}</h3>
        <ul class="card-meta">
          <li>${escapeHtml(candidate.currentTitle || "Evidence unavailable")} - ${escapeHtml(candidate.currentOrganisation || "Evidence unavailable")}</li>
          <li>${escapeHtml(candidate.location || "Evidence unavailable")}</li>
        </ul>
      </div>
      <div class="score-row">
        <span>Overall fit</span>
        <strong class="score">${candidate.totalScore}/100</strong>
      </div>
      <div class="chips evidence-badges">${sourceBadges.map((source) => `<span class="source-badge">${escapeHtml(source)}</span>`).join("")}</div>
      <div>
        <strong>Why relevant</strong>
        <ul class="tiny-list">${candidate.matchReasons.slice(0, 3).map((reason) => `<li>${escapeHtml(reason.text)}</li>`).join("")}</ul>
      </div>
      <div>
        <strong>Main expertise</strong>
        <p>${candidate.skills.slice(0, 4).map(escapeHtml).join(" · ") || "Evidence unavailable"}</p>
      </div>
      <div class="score-row">
        <span>${candidate.sourceRecords.length} evidence item${candidate.sourceRecords.length === 1 ? "" : "s"}</span>
        <span class="${confidenceClass(candidate.evidenceConfidence)}">Evidence confidence: ${candidate.evidenceConfidence}</span>
      </div>
      <div class="quick-links">
        ${verificationLinks.map((link) => `<a href="${link.url}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("")}
      </div>
      <span class="badge">Status: ${escapeHtml(persisted.status)}</span>
      <button class="primary" type="button" data-open-candidate="${candidate.id}">Open Candidate Brief</button>
    </article>
  `;
}

function openCandidate(candidateId) {
  const project = activeProject();
  const candidate = [...(project?.results || []), ...state.manualCandidates].find((item) => item.id === candidateId);
  if (!candidate) return;
  const persisted = getCandidateState(candidate.id);
  const links = linkProvider.searchLinks(candidate);
  $("#candidateBrief").innerHTML = briefTemplate(candidate, persisted, links);
  bindBriefEvents(candidate);
  $("#candidateDialog").showModal();
}

function briefTemplate(candidate, persisted, links) {
  const project = activeProject();
  const criteria = project?.criteria || fillEmptyCriteria({});
  const scoreBreakdown = candidate.scoreBreakdown || scoreCandidate(candidate, criteria).breakdown;
  const totalScore = candidate.totalScore || scoreCandidate(candidate, criteria).total;
  const confidence = candidate.evidenceConfidence || computeConfidence(candidate);
  const sources = candidate.sourceRecords || [];
  const sourceBadges = evidenceSourceBadges(candidate);
  const verificationLinks = buildVerificationSearches(candidate, criteria);
  return `
    <header class="brief-header">
      <div>
        <p class="eyebrow">${candidate.enteredManually ? "Recruiter-entered" : `Candidate Brief · ${escapeHtml(project?.title || "Selected project")}`}</p>
        <h2>${escapeHtml(candidate.fullName)}</h2>
        <p>${escapeHtml(candidate.currentTitle || "Evidence unavailable")} - ${escapeHtml(candidate.currentOrganisation || "Evidence unavailable")} - ${escapeHtml(candidate.location || "Evidence unavailable")}</p>
        <div class="chips">
          <span class="badge">Score: ${totalScore}/100</span>
          <span class="badge ${confidenceClass(confidence)}">Confidence: ${confidence}</span>
          ${sourceBadges.map((source) => `<span class="source-badge">${escapeHtml(source)}</span>`).join("")}
          ${candidate.enteredManually ? "<span class=\"manual-label\">Recruiter-entered</span>" : "<span class=\"ai-label\">AI-generated summary</span>"}
          ${project?.searchMode === "swiss-campus" ? "<span class=\"badge\">Swiss university evidence</span>" : ""}
        </div>
        ${project?.searchMode === "swiss-campus" ? "<p class=\"hint\">Campus mode filters by public Swiss university affiliation evidence only. It does not infer nationality, ethnicity, citizenship, or origin.</p>" : ""}
      </div>
      <button class="icon-btn" type="button" data-close-brief aria-label="Close">x</button>
    </header>

    <div class="brief-grid">
      <div class="brief-main">
        <section class="brief-section">
          <h3>Candidate Header</h3>
          <div class="facts-grid">
            ${fact("Highest relevant education", candidate.education)}
            ${fact("Main expertise", candidate.skills.join(", "))}
            ${fact("University", candidate.university)}
            ${fact("Previous organisation", candidate.previousOrganisations.join(", ") || "Evidence unavailable")}
          </div>
        </section>

        <section class="brief-section">
          <h3>Why this candidate may be relevant</h3>
          <ul class="tiny-list">${candidate.matchReasons.map((reason) => `<li>${escapeHtml(reason.text)} <small>${sourceRefs(reason.sourceIds, sources)}</small></li>`).join("")}</ul>
        </section>

        <section class="brief-section">
          <h3>Relevance score breakdown</h3>
          <ul class="score-list">
            <li>Technical and research-topic match: ${scoreBreakdown.technical}/30</li>
            <li>Publication relevance: ${scoreBreakdown.publications}/25</li>
            <li>Current and previous role relevance: ${scoreBreakdown.role}/20</li>
            <li>Education relevance: ${scoreBreakdown.education}/10</li>
            <li>Employer or industry relevance: ${scoreBreakdown.employer}/10</li>
            <li>Location relevance: ${scoreBreakdown.location}/5</li>
            ${scoreBreakdown.activity !== undefined ? `<li>Open-source activity: ${scoreBreakdown.activity}/25</li>` : ""}
            <li><strong>Total: ${totalScore}/100</strong></li>
          </ul>
          <p class="hint">Score is only for prioritising recruiter review. It is not a hiring or rejection recommendation.</p>
        </section>

        <section class="brief-section">
          <h3>Career timeline</h3>
          <ul class="timeline">${candidate.timeline.map((item) => `<li><strong>${escapeHtml(item.date)}</strong><br />${escapeHtml(item.label)}</li>`).join("") || "<li>Date not verified</li>"}</ul>
        </section>

        <section class="brief-section">
          <h3>Research and expertise</h3>
          <span class="ai-label">AI interpretation</span>
          <p>${escapeHtml(candidate.summary || "Evidence unavailable")}</p>
          <div class="chips">${[...candidate.researchTopics, ...candidate.skills].map((term) => `<span class="chip">${escapeHtml(term)}</span>`).join("")}</div>
        </section>

        <section class="brief-section">
          <h3>Relevant publications</h3>
          <ul class="publication-list">${candidate.publications.slice(0, 5).map(publicationTemplate).join("") || "<li>Evidence unavailable</li>"}</ul>
        </section>

        <section class="brief-section">
          <h3>Source evidence</h3>
          <ul class="evidence-list">${sources.map(sourceTemplate).join("") || "<li>Evidence unavailable</li>"}</ul>
        </section>

        <section class="brief-section">
          <h3>Suggested verification searches</h3>
          <div class="verification-link-grid">
            ${verificationLinks.map((link) => `<a href="${link.url}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("")}
          </div>
        </section>

        <section class="brief-section">
          <h3>Missing or uncertain information</h3>
          <ul class="tiny-list">${candidate.missingInformation.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>Evidence unavailable</li>"}</ul>
        </section>
      </div>

      <aside class="brief-side">
        <section class="brief-section action-stack">
          <h3>Recruiter actions</h3>
          <label><span>Status</span><select data-status-select>${STATUSES.map((status) => `<option ${persisted.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></label>
          <label><span>Notes</span><textarea data-notes rows="4">${escapeHtml(persisted.notes || "")}</textarea></label>
          <label><span>Tags</span><input data-tags value="${escapeHtml((persisted.tags || []).join(", "))}" placeholder="comma separated" /></label>
          <label><span>Rejection reason</span><select data-rejection><option value="">Not set</option>${REJECTION_REASONS.map((reason) => `<option ${persisted.rejectionReason === reason ? "selected" : ""}>${reason}</option>`).join("")}</select></label>
          <label><span>Public URL</span><input data-public-url value="${escapeHtml(persisted.publicUrl || "")}" placeholder="https://..." /></label>
          <label><span>Manually verified information</span><textarea data-verified-info rows="3">${escapeHtml(persisted.verifiedInfo || "")}</textarea></label>
          <label><span>Candidate correction</span><textarea data-correction rows="3">${escapeHtml(persisted.correction || "")}</textarea></label>
          <button class="primary" type="button" data-save-actions>Save Review Notes</button>
          <button class="secondary" type="button" data-shortlist>${persisted.status === "Shortlisted" ? "Already Shortlisted" : "Shortlist"}</button>
        </section>

        <section class="brief-section">
          <h3>Manual verification</h3>
          <div class="verification-list">
            ${["Identity confirmed", "Current employer confirmed", "Current title confirmed", "Education confirmed", "Research profile confirmed", "Public profile URL confirmed"].map((item) => `
              <label><input type="checkbox" data-verification="${item}" ${persisted.verifications?.includes(item) ? "checked" : ""} />${item}</label>
            `).join("")}
          </div>
          <div class="inline-actions">
            <a class="button-link" href="${links.linkedin}" target="_blank" rel="noreferrer"><button type="button">Verify on LinkedIn</button></a>
            <a class="button-link" href="${links.scholar}" target="_blank" rel="noreferrer"><button type="button">Search on Google Scholar</button></a>
            <a class="button-link" href="${links.company}" target="_blank" rel="noreferrer"><button type="button">Search Company Website</button></a>
            <a class="button-link" href="${links.github}" target="_blank" rel="noreferrer"><button type="button">Search on GitHub</button></a>
            <a class="button-link" href="${links.web}" target="_blank" rel="noreferrer"><button type="button">Search on the Web</button></a>
          </div>
        </section>

        <section class="brief-section">
          <h3>Similar candidates</h3>
          <button class="secondary" type="button" data-find-similar>Find Similar Candidates</button>
          <div data-similar-results class="similar-list"></div>
        </section>
      </aside>
    </div>
  `;
}

function bindBriefEvents(candidate) {
  $("#candidateBrief [data-close-brief]").addEventListener("click", () => $("#candidateDialog").close());
  $("#candidateBrief [data-save-actions]").addEventListener("click", () => saveCandidateActions(candidate.id));
  $("#candidateBrief [data-shortlist]").addEventListener("click", () => {
    const candidateState = getCandidateState(candidate.id);
    candidateState.status = "Shortlisted";
    setCandidateState(candidate.id, candidateState);
    saveState();
    toast("Candidate shortlisted.");
    renderCandidates();
    renderShortlist();
    renderProjectList();
    openCandidate(candidate.id);
  });
  $("#candidateBrief [data-find-similar]").addEventListener("click", () => renderSimilarCandidates(candidate));
}

function saveCandidateActions(candidateId) {
  const root = $("#candidateBrief");
  const candidateState = getCandidateState(candidateId);
  candidateState.status = $("[data-status-select]", root).value;
  candidateState.notes = $("[data-notes]", root).value;
  candidateState.tags = $("[data-tags]", root).value.split(",").map((tag) => tag.trim()).filter(Boolean);
  candidateState.rejectionReason = $("[data-rejection]", root).value;
  candidateState.publicUrl = $("[data-public-url]", root).value;
  candidateState.verifiedInfo = $("[data-verified-info]", root).value;
  candidateState.correction = $("[data-correction]", root).value;
  candidateState.verifications = $all("[data-verification]", root).filter((box) => box.checked).map((box) => box.dataset.verification);
  candidateState.updatedAt = TODAY;
  setCandidateState(candidateId, candidateState);
  saveState();
  renderCandidates();
  renderShortlist();
  renderProjectList();
  toast("Candidate review information saved.");
}

function renderSimilarCandidates(candidate) {
  const project = activeProject();
  const similar = [...(project?.results || []), ...state.manualCandidates]
    .filter((item) => item.id !== candidate.id)
    .map((item) => ({
      item,
      overlap: overlapCount([...candidate.researchTopics, ...candidate.skills, candidate.currentTitle, candidate.education], [...item.researchTopics, ...item.skills, item.currentTitle, item.education]),
    }))
    .filter((entry) => entry.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 5);
  const container = $("#candidateBrief [data-similar-results]");
  container.innerHTML = similar.length ? similar.map(({ item }) => `
    <article class="brief-section">
      <strong>${escapeHtml(item.fullName)}</strong>
      <span>${escapeHtml(item.currentTitle || "Evidence unavailable")} - ${escapeHtml(item.location || "Evidence unavailable")}</span>
      <p>Similar because both candidates share ${sharedTerms(candidate, item).slice(0, 3).join(", ")}.</p>
      <button type="button" data-open-candidate="${item.id}">Open Brief</button>
    </article>
  `).join("") : "<p class=\"hint\">No similar candidates in the current project results.</p>";
  $all("[data-open-candidate]", container).forEach((button) => button.addEventListener("click", () => openCandidate(button.dataset.openCandidate)));
}

function renderShortlist() {
  const project = activeProject();
  const subtitle = $("#shortlistSubtitle");
  if (subtitle) {
    subtitle.textContent = project ? `Candidates marked Shortlisted or Strong Fit for ${project.title}.` : "Select a project to see its shortlist.";
  }
  if (!project) {
    $("#shortlistGrid").innerHTML = `<div class="empty-state">Select or create a project first.</div>`;
    return;
  }
  const all = [...project.results, ...state.manualCandidates];
  const shortlist = uniqueById(all).filter((candidate) => ["Shortlisted", "Strong Fit"].includes(getCandidateState(candidate.id).status));
  $("#shortlistGrid").innerHTML = shortlist.length ? shortlist.map((candidate) => candidateCardTemplate({
    ...candidate,
    totalScore: candidate.totalScore || scoreCandidate(candidate, project.criteria || fillEmptyCriteria({})).total,
    scoreBreakdown: candidate.scoreBreakdown || scoreCandidate(candidate, project.criteria || fillEmptyCriteria({})).breakdown,
    evidenceConfidence: candidate.evidenceConfidence || computeConfidence(candidate),
  })).join("") : `<div class="empty-state">No shortlisted candidates yet for this project.</div>`;
  $all("[data-open-candidate]", $("#shortlistGrid")).forEach((button) => button.addEventListener("click", () => openCandidate(button.dataset.openCandidate)));
}

function saveManualCandidate(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.fullName.trim()) {
    toast("Full name is required.");
    return;
  }
  const now = TODAY;
  const manualSource = {
    id: `manual-source-${Date.now()}`,
    sourceType: "Manual input",
    sourceTitle: "Recruiter-entered candidate information",
    sourceUrl: data.publicUrl || "",
    extractedFacts: ["Recruiter-entered"],
    sourceConfidence: "Low",
    retrievalDate: now,
    enteredManually: true,
  };
  const manual = {
    id: `manual-${Date.now()}`,
    fullName: data.fullName.trim(),
    currentTitle: data.currentTitle.trim(),
    currentOrganisation: data.currentOrganisation.trim(),
    previousOrganisations: [],
    location: data.location.trim(),
    education: "Evidence unavailable",
    university: "Evidence unavailable",
    skills: [],
    researchTopics: [],
    summary: data.bio.trim() || "Recruiter-entered biography. Evidence must be verified manually.",
    publications: [],
    sourceIds: [manualSource.id],
    sourceRecords: [manualSource],
    githubUrl: data.githubUrl.trim(),
    personalWebsite: data.website.trim(),
    orcidUrl: "",
    linkedinSearchLink: data.linkedinUrl.trim(),
    scholarSearchLink: data.scholarUrl.trim(),
    timeline: [{ date: "Date not verified", label: data.currentTitle || "Recruiter-entered candidate", source: "Recruiter-entered" }],
    matchReasons: [{ text: "Recruiter-entered candidate. Evidence requires manual verification.", sourceIds: [manualSource.id] }],
    missingInformation: ["Public source evidence has not been verified.", "Education unavailable unless added by recruiter.", "Publication record unavailable unless added by recruiter."],
    enteredManually: true,
    createdAt: now,
    updatedAt: now,
  };
  state.manualCandidates.push(manual);
  if (activeProject()) {
    setCandidateState(manual.id, { ...getCandidateState(manual.id), notes: data.notes.trim(), status: "Reviewing" });
  }
  saveState();
  form.reset();
  $("#manualDialog").close();
  toast("Manual candidate saved as recruiter-entered information.");
  if (activeProject()?.results.length) {
    startResearch();
  }
  renderProjectList();
  renderShortlist();
}

function scoreCandidate(candidate, criteria) {
  const terms = unique(Object.values(criteria || {}).flat().map(String));
  const candidateTerms = [...candidate.skills, ...candidate.researchTopics, candidate.currentTitle, candidate.currentOrganisation, candidate.location, candidate.education, candidate.university, ...candidate.previousOrganisations].join(" ").toLowerCase();
  const matches = terms.filter((term) => candidateTerms.includes(term.toLowerCase()) || fuzzyIncludes(candidateTerms, term.toLowerCase()));
  const publicationMatch = candidate.publications.reduce((sum, publication) => sum + terms.filter((term) => `${publication.title} ${publication.relevanceExplanation}`.toLowerCase().includes(term.toLowerCase())).length, 0);
  const breakdown = {
    technical: clamp(Math.round(matches.filter((term) => [...candidate.skills, ...candidate.researchTopics].join(" ").toLowerCase().includes(term.toLowerCase())).length * 6), 0, 30),
    publications: clamp(Math.round(publicationMatch * 7 + Math.min(candidate.publications.length, 3) * 4), 0, 25),
    role: clamp(Math.round(matches.filter((term) => candidate.currentTitle.toLowerCase().includes(term.toLowerCase()) || candidate.previousOrganisations.join(" ").toLowerCase().includes(term.toLowerCase())).length * 7), 0, 20),
    education: clamp(Math.round(matches.filter((term) => `${candidate.education} ${candidate.university}`.toLowerCase().includes(term.toLowerCase())).length * 5), 0, 10),
    employer: clamp(Math.round(matches.filter((term) => `${candidate.currentOrganisation} ${candidate.previousOrganisations.join(" ")}`.toLowerCase().includes(term.toLowerCase())).length * 5), 0, 10),
    location: clamp(Math.round(matches.filter((term) => candidate.location.toLowerCase().includes(term.toLowerCase())).length * 5), 0, 5),
  };
  let total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  if (total < 35 && matches.length) total += Math.min(25, matches.length * 5);
  if (candidate.enteredManually) total = Math.max(total, 22);
  return { total: clamp(total, 0, 100), breakdown };
}

function scoreOpenAlexCandidate(candidate, criteria) {
  const terms = unique(Object.values(criteria || {}).flat().map(String));
  const topicText = [...candidate.skills, ...candidate.researchTopics, ...candidate.publications.map((publication) => publication.title)].join(" ").toLowerCase();
  const matchedTermCount = terms.filter((term) => topicText.includes(term.toLowerCase()) || fuzzyIncludes(topicText, term.toLowerCase())).length;
  const recentCount = candidate.publications.filter((publication) => Number(publication.year) >= 2023).length;
  const hasInstitution = candidate.currentOrganisation && candidate.currentOrganisation !== "Evidence unavailable";
  const earlyCareerSignal = (candidate._authorPositions || []).filter((position) => ["first", "middle"].includes(position)).length;
  const breakdown = {
    technical: clamp(matchedTermCount * 5 + earlyCareerSignal * 2, 0, 30),
    publications: clamp(candidate.publications.length * 5 + recentCount * 3, 0, 25),
    role: 10,
    education: 0,
    employer: hasInstitution ? 7 : 0,
    location: candidate.location && candidate.location !== "Evidence unavailable" ? 3 : 0,
  };
  const total = clamp(Object.values(breakdown).reduce((sum, value) => sum + value, 0), 25, 100);
  return { total, breakdown };
}

function scoreGitHubCandidate(candidate, repos, criteria) {
  const terms = unique([
    ...criteria.core_technical_skills,
    ...criteria.research_topics,
    ...criteria.related_terminology,
    ...criteria.jd_keywords,
  ]);
  const repoText = repos.map((repo) => `${repo.full_name} ${repo.description || ""} ${repo.language || ""}`).join(" ").toLowerCase();
  const matchedTermCount = terms.filter((term) => repoText.includes(term.toLowerCase()) || fuzzyIncludes(repoText, term.toLowerCase())).length;
  const stars = repos.reduce((sum, repo) => sum + Number(repo.stargazers_count || 0), 0);
  const recentRepos = repos.filter((repo) => repo.updated_at && new Date(repo.updated_at).getFullYear() >= 2024).length;
  const breakdown = {
    technical: clamp(matchedTermCount * 6, 0, 30),
    publications: 0,
    role: 8,
    education: 0,
    employer: candidate.currentOrganisation !== "Evidence unavailable" ? 5 : 0,
    location: candidate.location !== "Evidence unavailable" ? 4 : 0,
    activity: clamp(recentRepos * 5 + Math.log10(stars + 1) * 8, 0, 25),
  };
  const total = clamp(Object.values(breakdown).reduce((sum, value) => sum + value, 0) + 18, 20, 100);
  return { total, breakdown };
}

function mergeCandidateResults(candidates) {
  const merged = new Map();
  candidates.forEach((candidate) => {
    const key = normalizedCandidateKey(candidate);
    if (!merged.has(key)) {
      merged.set(key, candidate);
      return;
    }
    const existing = merged.get(key);
    existing.sourceRecords = uniqueBy([...(existing.sourceRecords || []), ...(candidate.sourceRecords || [])], (record) => record.sourceUrl || record.sourceTitle);
    existing.sourceIds = existing.sourceRecords.map((record) => record.id);
    existing.skills = unique([...(existing.skills || []), ...(candidate.skills || [])]).slice(0, 10);
    existing.researchTopics = unique([...(existing.researchTopics || []), ...(candidate.researchTopics || [])]).slice(0, 10);
    existing.matchReasons = [...(existing.matchReasons || []), ...(candidate.matchReasons || [])].slice(0, 6);
    existing.publications = uniqueBy([...(existing.publications || []), ...(candidate.publications || [])], (publication) => publication.sourceUrl || publication.title).slice(0, 6);
    existing.githubUrl = existing.githubUrl || candidate.githubUrl;
    existing.personalWebsite = existing.personalWebsite || candidate.personalWebsite;
    existing.totalScore = clamp(Math.max(existing.totalScore || 0, candidate.totalScore || 0) + 6, 0, 100);
    existing.evidenceConfidence = computeConfidence(existing);
  });
  return [...merged.values()];
}

function normalizedCandidateKey(candidate) {
  const name = String(candidate.fullName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const github = String(candidate.githubUrl || "").toLowerCase().replace(/^https?:\/\/github\.com\//, "").split("/")[0];
  return github || name || candidate.id;
}

function buildGitHubQueries(criteria) {
  return unique([
    ...criteria.core_technical_skills,
    ...criteria.research_topics,
    ...criteria.related_terminology,
    ...criteria.jd_keywords,
  ])
    .filter((term) => term.length > 2 && !["not specified", "Research Scientist", "Applied Scientist"].includes(term))
    .slice(0, 6);
}

function inferGitHubSkills(repos, criteria) {
  const repoText = repos.map((repo) => `${repo.full_name} ${repo.description || ""} ${repo.language || ""}`).join(" ").toLowerCase();
  return unique([
    ...criteria.core_technical_skills.filter((term) => repoText.includes(term.toLowerCase()) || fuzzyIncludes(repoText, term.toLowerCase())),
    ...repos.map((repo) => repo.language).filter(Boolean),
  ]).slice(0, 8);
}

function isExcludedByCandidateStage(candidate, options = {}) {
  if (options.candidateStage !== "early-career") return false;
  const positions = candidate.authorPositions || [];
  const hasFirstAuthorEvidence = positions.includes("first");
  const hasLastAuthorEvidence = positions.includes("last");
  const hasSeniorMetricSignal =
    Number(candidate.openAlexWorksCount || 0) >= 45 ||
    Number(candidate.openAlexCitedByCount || 0) >= 2500 ||
    Number(candidate.openAlexHIndex || 0) >= 18;
  if (!hasFirstAuthorEvidence) return true;
  if (hasSeniorMetricSignal) return true;
  return hasLastAuthorEvidence && positions.filter((position) => position === "first").length < 2;
}

function buildOpenAlexQueries(criteria, options = {}) {
  const highSignal = unique([
    ...criteria.publication_keywords,
    ...criteria.research_topics,
    ...criteria.core_technical_skills,
  ])
    .filter((term) => term.length > 2 && !["not specified", "Research Scientist", "Applied Scientist"].includes(term));
  const compound = [];
  if (criteria.research_topics[0] && criteria.core_technical_skills[0]) {
    compound.push(`${criteria.research_topics[0]} ${criteria.core_technical_skills[0]}`);
  }
  if (criteria.research_topics[0] && criteria.location[0]) {
    compound.push(`${criteria.research_topics[0]} ${criteria.location[0]}`);
  }
  if (options.searchMode === "swiss-campus") {
    const base = highSignal[0] || criteria.research_topics[0] || criteria.core_technical_skills[0] || "computer science";
    compound.push(`${base} ETH Zurich`);
    compound.push(`${base} EPFL`);
    compound.push(`${base} Switzerland university`);
  }
  if (options.candidateStage === "early-career") {
    const base = highSignal[0] || criteria.research_topics[0] || criteria.core_technical_skills[0] || "computer science";
    compound.push(`${base} PhD candidate`);
    compound.push(`${base} recent PhD`);
    compound.push(`${base} postdoctoral researcher`);
  }
  return unique([...compound, ...highSignal]).slice(0, 6);
}

function extractWorkTopics(work) {
  return unique([
    ...(work.topics || []).map((topic) => topic.display_name),
    work.primary_topic?.display_name,
  ]).slice(0, 8);
}

function extractWorkKeywords(work) {
  return unique((work.keywords || []).map((keyword) => keyword.display_name)).slice(0, 8);
}

function mostCommon(values) {
  const counts = values.filter(Boolean).reduce((map, value) => {
    map.set(value, (map.get(value) || 0) + 1);
    return map;
  }, new Map());
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function hasSwissUniversityEvidence(authorship) {
  const institutions = authorship.institutions || [];
  return institutions.some((institution) => {
    const name = String(institution.display_name || "").toLowerCase();
    const type = String(institution.type || "").toLowerCase();
    return institution.country_code === "CH" && (
      type === "education" ||
      /eth zurich|epfl|university|universität|universite|università|institute|institut|eawag|idsia|cern/.test(name)
    );
  });
}

function extractJdTerms(input) {
  const text = input.toLowerCase();
  const skills = extractKnownTerms(text, TECHNICAL_TERM_LIBRARY);
  const topics = extractResearchTopics(text);
  const phrases = extractTechnicalPhrases(input);
  const criteriaSentences = extractCriteriaSentences(input);
  const languages = extractLanguageCriteria(input);
  const organisations = extractCapitalizedPhrases(input, /(lab|labs|research|systems|technologies|university|institute|inc|corp|corporation|group|gmbh|ag|sa|llc|ltd)/i).slice(0, 8);
  const universities = organisations.filter((item) => /(university|institute|eth|epfl|mit|stanford|cambridge|oxford)/i.test(item));
  const companies = unique([
    ...extractKnownTerms(text, KNOWN_COMPANY_NAMES),
    ...organisations.filter((item) => isCompanyLikeName(item)),
  ]).filter((item) => !isUniversityLikeName(item) && !isGenericOrganisationToken(item));
  const locations = extractKnownTerms(text, ["Europe", "Switzerland", "Zurich", "Germany", "UK", "London", "France", "Paris", "Netherlands", "United States", "China", "Singapore", "Canada"]);
  const degreeStage = extractDegreeStage(text);
  const availability = extractAvailability(input);
  const manualVerification = unique([
    ...(languages.required.length || languages.preferred.length ? ["Language ability must be verified manually; OpenAlex cannot prove spoken languages."] : []),
    ...(degreeStage.length ? ["Current enrollment, graduation date, and degree stage require manual verification."] : []),
    ...(text.includes("visa") || text.includes("work permit") ? ["Visa or work authorization must be verified manually."] : []),
  ]);
  return { skills, topics, phrases, organisations, universities, companies, locations, languages, degreeStage, availability, manualVerification, ...criteriaSentences };
}

function extractLanguageCriteria(input) {
  const text = input.toLowerCase();
  const languageMap = {
    english: "English",
    英语: "English",
    german: "German",
    deutsch: "German",
    德语: "German",
    french: "French",
    francais: "French",
    français: "French",
    法语: "French",
    italian: "Italian",
    意大利语: "Italian",
    chinese: "Chinese",
    mandarin: "Mandarin Chinese",
    中文: "Chinese",
    普通话: "Mandarin Chinese",
  };
  const required = [];
  const preferred = [];
  Object.entries(languageMap).forEach(([needle, label]) => {
    if (!text.includes(needle)) return;
    const nearby = languageClause(input, needle).toLowerCase();
    if (/\b(preferred|nice to have|bonus|plus|optional)\b|优先|加分|最好/i.test(nearby)) {
      preferred.push(label);
    } else if (/\b(required|must|need|fluent|native|mandatory|excellent|proficient)\b|必须|需要|流利/i.test(nearby)) {
      required.push(label);
    } else {
      preferred.push(label);
    }
  });
  return { required: unique(required), preferred: unique(preferred) };
}

function languageClause(input, needle) {
  const nearby = nearbyText(input, needle, 45);
  return nearby
    .split(/[,;。\n]/)
    .find((part) => part.toLowerCase().includes(needle.toLowerCase())) || nearby;
}

function nearbyText(input, needle, radius) {
  const lower = input.toLowerCase();
  const index = lower.indexOf(needle.toLowerCase());
  if (index < 0) return "";
  return input.slice(Math.max(0, index - radius), Math.min(input.length, index + needle.length + radius));
}

function extractDegreeStage(text) {
  const stages = [];
  if (/\bbachelor|undergraduate|本科/.test(text)) stages.push("Bachelor");
  if (/\bmaster|msc|研究生|硕士/.test(text)) stages.push("Master");
  if (/\bphd|doctoral|博士/.test(text)) stages.push("PhD");
  if (/\bpostdoc|postdoctoral/.test(text)) stages.push("Postdoc");
  if (/\bintern|internship|实习|校招|campus/.test(text)) stages.push("Intern / campus hire");
  return unique(stages);
}

function extractAvailability(input) {
  const matches = input.match(/\b(?:20\d{2}|Q[1-4]\s*20\d{2}|summer|fall|autumn|spring|winter)\b/gi) || [];
  return unique(matches).slice(0, 6);
}

function isCompanyLikeName(value) {
  return /(inc|corp|corporation|llc|ltd|limited|gmbh|ag|sa|technologies|systems|labs|group)$/i.test(value.trim());
}

function isUniversityLikeName(value) {
  return /(university|universität|universite|università|institute|institut|eth|epfl|mit|stanford|cambridge|oxford)/i.test(value);
}

function isGenericOrganisationToken(value) {
  return /^(AI|ML|LLM|NLP|CV|Research|Systems|Technologies|Group|Lab|Labs)$/i.test(value.trim());
}

function extractTechnicalPhrases(input) {
  const stop = new Set(["with", "from", "that", "this", "have", "will", "role", "team", "work", "working", "experience", "candidate", "engineer", "researcher", "scientist", "looking", "strong", "excellent", "ability"]);
  const normalized = input.replace(/[^a-zA-Z0-9+.#-]+/g, " ");
  const words = normalized.split(/\s+/).filter((word) => word.length > 2 && !stop.has(word.toLowerCase()));
  const phrases = [];
  for (let index = 0; index < words.length - 1; index += 1) {
    const pair = `${words[index]} ${words[index + 1]}`;
    if (/(model|learning|vision|language|compiler|robot|planning|kernel|evaluation|multimodal|cuda|llm|graph|distributed|inference|training|retrieval|benchmark)/i.test(pair)) {
      phrases.push(pair);
    }
    if (index < words.length - 2) {
      const triple = `${words[index]} ${words[index + 1]} ${words[index + 2]}`;
      if (/(vision|language|large|foundation|robotic|distributed|retrieval|compiler|kernel|model|learning|evaluation|benchmark)/i.test(triple)) {
        phrases.push(triple);
      }
    }
  }
  return unique(phrases).slice(0, 14);
}

function extractCriteriaSentences(input) {
  const sentences = input
    .split(/[\n.;•]+/)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length > 8 && sentence.length < 180);
  return {
    required: unique(sentences.filter((sentence) => /\b(required|must|need|needs|minimum|essential|responsible for|should have)\b/i.test(sentence)).map(cleanCriterionSentence)).slice(0, 8),
    preferred: unique(sentences.filter((sentence) => /\b(preferred|nice to have|bonus|plus|ideally|familiarity|advantage)\b/i.test(sentence)).map(cleanCriterionSentence)).slice(0, 8),
    exclusions: unique(sentences.filter((sentence) => /\b(exclude|not looking|not relevant|avoid|without|no need)\b/i.test(sentence)).map(cleanCriterionSentence)).slice(0, 6),
  };
}

function cleanCriterionSentence(sentence) {
  return sentence
    .replace(/^(requirements?|responsibilities|preferred qualifications?|nice to have|must have|we need|we are looking for)\s*:?\s*/i, "")
    .trim();
}

function extractCapitalizedPhrases(input, qualifier) {
  const matches = input.match(/\b[A-Z][A-Za-z&.-]*(?:\s+[A-Z][A-Za-z&.-]*){0,4}\b/g) || [];
  return unique(matches.filter((phrase) => qualifier.test(phrase)));
}

function extractResearchTopics(text) {
  const topicMap = {
    multimodal: ["multimodal foundation models", "vision-language models", "multimodal evaluation"],
    "llm evaluation": ["LLM evaluation", "model evaluation", "benchmarking"],
    cuda: ["GPU kernels", "CUDA kernel optimisation"],
    kernel: ["kernel optimisation", "GPU computing"],
    compiler: ["AI compilers", "machine learning compilers", "tensor compiler optimisation"],
    "ai compiler": ["AI compilers", "machine learning compilers", "compiler infrastructure"],
    mlir: ["MLIR", "compiler infrastructure"],
    tvm: ["TVM", "tensor compiler"],
    triton: ["Triton", "kernel fusion"],
    robotic: ["robotic planning", "motion planning"],
    planning: ["robotic planning", "autonomous systems"],
    "computer vision": ["computer vision", "visual recognition", "image understanding"],
    "natural language": ["natural language processing", "language models"],
    nlp: ["natural language processing", "language models"],
    rag: ["retrieval augmented generation", "information retrieval"],
    retrieval: ["retrieval augmented generation", "information retrieval"],
    "distributed training": ["distributed training", "large-scale model training"],
    inference: ["model inference", "model serving", "AI systems"],
    "foundation model": ["foundation models", "large language models"],
    transformer: ["transformers", "attention models"],
    graph: ["graph neural networks", "graph learning"],
    speech: ["speech recognition", "audio-language models"],
  };
  return unique(Object.entries(topicMap).flatMap(([needle, topics]) => text.includes(needle) ? topics : []));
}

function expandTerms(terms) {
  const expansion = {
    "AI compilers": ["MLIR", "LLVM", "TVM", "XLA", "Triton", "tensor compiler", "kernel fusion", "compiler optimisation"],
    "machine learning compilers": ["MLIR", "TVM", "XLA", "tensor programs"],
    "multimodal foundation models": ["VLM", "vision-language learning", "image-text models", "multimodal representation learning"],
    "LLM evaluation": ["benchmarking", "model evaluation", "robustness evaluation", "human preference evaluation"],
    "CUDA": ["GPU kernels", "warp-level optimisation", "Triton", "profiling"],
    "robotic planning": ["motion planning", "task planning", "learning-based control", "ROS"],
  };
  return unique(terms.flatMap((term) => expansion[term] || []));
}

function extractKnownTerms(text, terms) {
  return terms.filter((term) => text.includes(term.toLowerCase()));
}

function pickByText(text, mapping, fallback) {
  const values = Object.entries(mapping).flatMap(([needle, result]) => text.includes(needle) ? result : []);
  return unique(values.length ? values : fallback);
}

function pickIndustries(text) {
  if (text.includes("robot")) return ["Robotics", "Autonomous systems", "Industrial AI"];
  if (text.includes("cuda") || text.includes("kernel")) return ["Semiconductors", "AI infrastructure", "High performance computing"];
  if (text.includes("compiler") || text.includes("mlir") || text.includes("tvm")) return ["AI infrastructure", "Developer tooling", "Accelerators"];
  return ["AI research", "Foundation models", "Applied machine learning"];
}

function fillEmptyCriteria(criteria) {
  const defaults = {
    target_roles: [],
    seniority: "not specified",
    core_technical_skills: [],
    research_topics: [],
    related_terminology: [],
    publication_keywords: [],
    target_companies: [],
    relevant_industries: [],
    universities: [],
    academic_background: [],
    location: [],
    languages_required: [],
    languages_preferred: [],
    degree_stage: [],
    availability: [],
    manually_verify: [],
    required_criteria: [],
    preferred_criteria: [],
    exclusion_criteria: [],
    jd_keywords: [],
  };
  return { ...defaults, ...criteria };
}

function getCandidateState(candidateId) {
  const project = activeProject();
  return project?.candidateState?.[candidateId] || {
    status: "New",
    notes: "",
    tags: [],
    rejectionReason: "",
    publicUrl: "",
    verifiedInfo: "",
    correction: "",
    verifications: [],
    updatedAt: TODAY,
  };
}

function setCandidateState(candidateId, value) {
  const project = activeProject();
  if (!project) return;
  project.candidateState[candidateId] = value;
  project.updatedAt = TODAY;
}

function computeConfidence(candidate) {
  const high = candidate.sourceRecords.filter((record) => record.sourceConfidence === "High").length;
  if (candidate.enteredManually) return "Low";
  if (high >= 2) return "High";
  if (candidate.sourceRecords.length >= 2) return "Medium";
  return "Low";
}

function confidenceClass(confidence) {
  return `confidence-${String(confidence).toLowerCase()}`;
}

function publicationTemplate(publication) {
  return `
    <li>
      <strong>${escapeHtml(publication.title)}</strong><br />
      ${publication.year || "Date not verified"} - ${escapeHtml(publication.venue || "Evidence unavailable")}<br />
      ${escapeHtml(publication.relevanceExplanation || "Evidence unavailable")}<br />
      ${publication.sourceUrl ? `<a class="source-link" href="${publication.sourceUrl}" target="_blank" rel="noreferrer">Source link</a>` : "Evidence unavailable"}
    </li>
  `;
}

function sourceTemplate(record) {
  return `
    <li>
      <strong>${escapeHtml(record.sourceType)}: ${escapeHtml(record.sourceTitle)}</strong><br />
      ${record.sourceUrl ? `<a class="source-link" href="${record.sourceUrl}" target="_blank" rel="noreferrer">${escapeHtml(record.sourceUrl)}</a>` : "Evidence unavailable"}<br />
      Retrieval date: ${escapeHtml(record.retrievalDate || "Date not verified")} - Confidence: ${escapeHtml(record.sourceConfidence || "Evidence unavailable")}<br />
      Extracted facts: ${record.extractedFacts.map(escapeHtml).join(", ") || "Evidence unavailable"}
    </li>
  `;
}

function evidenceSourceBadges(candidate) {
  const sources = new Set();
  (candidate.sourceRecords || []).forEach((record) => {
    const type = String(record.sourceType || "").toLowerCase();
    if (type.includes("openalex") || type.includes("publication")) sources.add("OpenAlex");
    if (type.includes("github")) sources.add("GitHub");
    if (type.includes("patent")) sources.add("Patent");
    if (type.includes("manual")) sources.add("Manual");
    if (!sources.size && type) sources.add(record.sourceType);
  });
  if (candidate.githubUrl) sources.add("GitHub");
  if (!sources.size) sources.add("Web");
  return [...sources].slice(0, 5);
}

function buildVerificationSearches(candidate, criteria) {
  const terms = unique([
    ...criteria.core_technical_skills,
    ...criteria.research_topics,
    ...criteria.target_companies,
    ...criteria.universities,
  ]).slice(0, 4).join(" ");
  const person = `${candidate.fullName || ""} ${candidate.currentOrganisation || ""}`.trim();
  const technical = `${person} ${terms}`.trim();
  return [
    { label: "LinkedIn", url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(technical)}` },
    { label: "GitHub", url: candidate.githubUrl || `https://github.com/search?q=${encodeURIComponent(technical)}&type=users` },
    { label: "Patents", url: `https://patents.google.com/?q=${encodeURIComponent(technical)}` },
    { label: "Web", url: `https://www.google.com/search?q=${encodeURIComponent(technical)}` },
    { label: "Company pages", url: `https://www.google.com/search?q=${encodeURIComponent(`${technical} site:*.com profile OR team OR staff`)}` },
  ];
}

function fact(label, value) {
  return `<div class="fact"><span>${label}</span><strong>${escapeHtml(value || "Evidence unavailable")}</strong></div>`;
}

function sourceRefs(sourceIds, sources) {
  const refs = (sourceIds || []).map((sourceId) => sources.find((source) => source.id === sourceId)).filter(Boolean);
  return refs.length ? refs.map((ref) => `[${escapeHtml(ref.sourceType)}]`).join(" ") : "[Evidence unavailable]";
}

function hasSource(candidate, sourceIds) {
  return (sourceIds || []).some((sourceId) => candidate.sourceRecords.some((source) => source.id === sourceId));
}

function latestPublicationYear(candidate) {
  return Math.max(0, ...candidate.publications.map((publication) => Number(publication.year) || 0));
}

function overlapCount(left, right) {
  return sharedTerms({ skills: left, researchTopics: [] }, { skills: right, researchTopics: [] }).length;
}

function sharedTerms(left, right) {
  const leftTerms = unique([...(left.skills || []), ...(left.researchTopics || [])].map((term) => String(term).toLowerCase()));
  const rightTerms = unique([...(right.skills || []), ...(right.researchTopics || [])].map((term) => String(term).toLowerCase()));
  return leftTerms.filter((term) => rightTerms.some((other) => term.includes(other) || other.includes(term)));
}

function resetResearch() {
  newProjectDraft();
}

function resetFilters() {
  $("#statusFilter").value = "all";
  $("#scoreFilter").value = "0";
  $("#scoreFilterValue").textContent = "0+";
  $("#locationFilter").value = "";
  $("#topicFilter").value = "";
  $("#sortSelect").value = "total";
}

function getAiCriteriaEndpoint() {
  const configured = localStorage.getItem(AI_CRITERIA_ENDPOINT_KEY);
  if (configured === "off") return "";
  return configured || DEFAULT_AI_CRITERIA_ENDPOINT;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

function normalizeCriteria(criteria, fallback = fillEmptyCriteria({})) {
  const aliases = {
    target_roles: ["target_roles", "role_titles", "roles"],
    seniority: ["seniority"],
    core_technical_skills: ["core_technical_skills", "must_have_keywords", "skills", "technical_skills"],
    research_topics: ["research_topics", "research_areas", "topics"],
    related_terminology: ["related_terminology", "synonyms", "expanded_terms"],
    publication_keywords: ["publication_keywords", "search_keywords", "openalex_keywords"],
    target_companies: ["target_companies", "companies"],
    relevant_industries: ["relevant_industries", "industries"],
    universities: ["universities", "target_universities", "schools"],
    academic_background: ["academic_background", "education"],
    location: ["location", "locations"],
    languages_required: ["languages_required", "required_languages"],
    languages_preferred: ["languages_preferred", "preferred_languages"],
    degree_stage: ["degree_stage", "candidate_stage", "degree_levels"],
    availability: ["availability", "start_date", "graduation_timeline"],
    manually_verify: ["manually_verify", "manual_verification", "needs_manual_check"],
    required_criteria: ["required_criteria", "must_haves"],
    preferred_criteria: ["preferred_criteria", "nice_to_haves"],
    exclusion_criteria: ["exclusion_criteria", "exclusions"],
    jd_keywords: ["jd_keywords", "keywords"],
  };
  const normalized = fillEmptyCriteria({});
  Object.entries(aliases).forEach(([key, keyAliases]) => {
    const value = keyAliases.map((alias) => criteria?.[alias]).find((item) => item !== undefined && item !== null);
    if (key === "seniority") {
      normalized[key] = String(value || fallback[key] || "not specified").trim() || "not specified";
    } else {
      normalized[key] = unique(flattenCriteriaValue(value)).length ? unique(flattenCriteriaValue(value)) : unique(flattenCriteriaValue(fallback[key]));
    }
  });
  normalized.target_companies = normalized.target_companies.filter((item) => !isUniversityLikeName(item) && !isGenericOrganisationToken(item));
  normalized.publication_keywords = unique([
    ...normalized.publication_keywords,
    ...normalized.research_topics,
    ...normalized.core_technical_skills,
    ...normalized.jd_keywords,
  ]).slice(0, 14);
  return normalized;
}

function flattenCriteriaValue(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(flattenCriteriaValue);
  if (typeof value === "object") return Object.values(value).flatMap(flattenCriteriaValue);
  return [String(value)];
}

function deriveProjectTitle(originalRequest) {
  const clean = originalRequest.replace(/\s+/g, " ").trim();
  return clean.length > 58 ? `${clean.slice(0, 58)}...` : clean;
}

function switchView(view) {
  state.activeView = view;
  $all(".nav-btn").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  $all(".view").forEach((panel) => panel.classList.toggle("active", panel.id === `${view}View`));
  if (view === "shortlist") renderShortlist();
}

function setLoading(button, label) {
  button.dataset.originalLabel = button.textContent;
  button.textContent = label;
  button.disabled = true;
}

function clearLoading(button, label) {
  button.textContent = label || button.dataset.originalLabel;
  button.disabled = false;
}

function toast(message) {
  const toastEl = $("#toast");
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.setTimeout(() => toastEl.classList.remove("show"), 2800);
}

function labelize(key) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim()).map((value) => String(value).trim()))];
}

function uniqueById(values) {
  const seen = new Set();
  return values.filter((value) => {
    if (seen.has(value.id)) return false;
    seen.add(value.id);
    return true;
  });
}

function uniqueBy(values, keyFn) {
  const seen = new Set();
  return values.filter((value) => {
    const key = keyFn(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fuzzyIncludes(haystack, needle) {
  return needle.split(/\s+/).filter(Boolean).some((part) => part.length > 3 && haystack.includes(part));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", init);
