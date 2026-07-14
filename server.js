"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8011);
const HOST = process.env.HOST || "127.0.0.1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === "POST" && url.pathname === "/api/analyze-jd") {
      await handleAnalyzeJd(request, response);
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }
    serveStatic(url.pathname, response, request.method === "HEAD");
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`AI Talent Research server listening on http://${HOST}:${PORT}`);
});

async function handleAnalyzeJd(request, response) {
  const body = await readJson(request);
  const jobDescription = String(body.job_description || "").trim();
  if (!jobDescription) {
    sendJson(response, 400, { error: "job_description is required" });
    return;
  }
  if (!OPENAI_API_KEY) {
    sendJson(response, 503, { error: "OPENAI_API_KEY is not configured" });
    return;
  }
  const criteria = await analyzeWithOpenAI(jobDescription);
  sendJson(response, 200, { mode: "ai", model: OPENAI_MODEL, criteria });
}

async function analyzeWithOpenAI(jobDescription) {
  const prompt = [
    "You are an expert technical recruiting analyst.",
    "Convert the job description into strict JSON only.",
    "Do not infer or classify protected characteristics such as nationality, ethnicity, race, gender, age, religion, citizenship, or origin.",
    "For language ability, current enrollment, graduation date, visa, or availability, put requirements in criteria but mark them as manual verification when public data cannot prove them.",
    "Keep target_companies to real company names only. Put universities in universities, never in target_companies.",
    "Use short, searchable terms for OpenAlex publication search.",
    "",
    "Return exactly this JSON object shape:",
    JSON.stringify({
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
    }),
    "",
    "Job description:",
    jobDescription,
  ].join("\n");

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: prompt,
      temperature: 0.1,
    }),
  });
  if (!openAiResponse.ok) {
    const text = await openAiResponse.text();
    throw new Error(`OpenAI API error ${openAiResponse.status}: ${text.slice(0, 300)}`);
  }
  const payload = await openAiResponse.json();
  const text = extractResponseText(payload);
  return JSON.parse(stripCodeFence(text));
}

function extractResponseText(payload) {
  if (payload.output_text) return payload.output_text;
  const parts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function stripCodeFence(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function serveStatic(pathname, response, headOnly) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(ROOT, decodeURIComponent(cleanPath)));
  if (!filePath.startsWith(ROOT)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(response, 404, { error: "Not found" });
      return;
    }
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    if (!headOnly) response.end(data);
    else response.end();
  });
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 120000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
