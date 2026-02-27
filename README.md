# AI Resume Analyzer & Skill Gap Job Match Platform

A full-stack MERN application that analyzes resumes (PDF/DOCX), calculates ATS scores based on NLP heuristics, identifies missing skills based on job requirements, and recommends jobs using terminology-aware matching.

## Architecture & Tech Stack
- **Frontend**: React.js, Tailwind CSS, Vite, Recharts, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Document Parsing**: `pdf-parse`, `mammoth`
- **NLP & Analysis**: `natural`, `compromise`
- **Logging**: `pino` + `pino-pretty` (structured JSON logging)
- **Background Workers**: `node-cron` (scheduled job pre-fetching)

## Features
- JWT Authentication & Authorization
- File Upload for PDF and DOCX Resumes
- NLP-based Entity Extraction (Skills, Experience, Education)
- AI ATS Score Calculator (out of 100)
- Industry Template + Weighted Readiness (Software Development, Data Science, DevOps)
- Real-Time Job Fetching + Caching (Adzuna API)
- **Corpus-level TF-IDF Scoring** — rare skills (kubernetes, terraform) weigh more than common terms (team, experience)
- **Precomputed Job Vectors** — TF-IDF vectors stored in DB; only the resume vector is computed at runtime
- **Hybrid Matching Engine** (70% Cosine Similarity + 30% Skill Overlap) with smoothed IDF
- Skill Gap Analysis (Matched vs Missing Skills)
- One-Shot Analyze Endpoint (`POST /api/analyze`) returning ATS + Jobs + Gaps in a single response
- **Parallelized Pipeline** — Resume parsing and job fetching run concurrently via `Promise.all`
- **Resume Version History** — stores last 20 analysis snapshots with ATS/readiness trends
- **Background Job Worker** — `node-cron` pre-fetches industry jobs every 6 hours
- **System Metrics Endpoint** — `GET /api/system/metrics` returns cache hit ratio, avg analyze time, P95 latency, total resumes analyzed
- **Structured Logging** — per-service timing instrumentation with pino (parse, ATS, match, total durations)
- Rate limiting and timeout/fallback for production safety
- MongoDB TTL Index auto-deletes expired jobs after 6 hours

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or MongoDB Atlas)
- Adzuna API credentials (optional, fallback to cached DB jobs)

### Installation

1. **Clone & Setup Database**
Ensure MongoDB is running locally on port `27017` or update the `MONGO_URI` in `server/.env`.

2. **Backend Setup**
```bash
cd server
npm install
node seeder.js  # Seed sample jobs
npm run dev     # Starts backend on http://localhost:5000
```

3. **Frontend Setup**
```bash
cd client
npm install
npm run dev     # Starts frontend on http://localhost:5173
```

4. **Environment Variables (server/.env)**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/resume-analyzer
JWT_SECRET=your-secret-key
NODE_ENV=development
ADZUNA_APP_ID=your-adzuna-app-id
ADZUNA_APP_KEY=your-adzuna-app-key
LOG_LEVEL=info
```

## How it works
1. Register an account and login.
2. Go to **Upload Resume**.
   - Upload your PDF or DOCX file.
   - Optionally select an Industry (Software Development, Data Science, DevOps).
   - Optionally provide a target role/keyword and location.
3. Click **Upload & Analyze**.
   - The platform parses the resume into structured data.
   - Computes ATS score.
   - Loads industry template (if selected) and calculates weighted industry readiness.
   - Fetches real-time jobs from Adzuna (with cache fallback).
   - Ranks jobs using hybrid cosine/overlap scoring with corpus-level TF-IDF.
   - Returns a single structured response with ATS, industry readiness, and ranked jobs.
   - Stores an analysis snapshot in the user's history.
4. Go to **ATS Score & Gap** to see visual metrics of your resume's strength and industry readiness.
5. Go to **Job Matches** to see which jobs fit your profile best, graded by match percentage and visual skill gaps.

## Engineering Architecture

### Parallelized Analysis Pipeline
```
┌──────────────────┐
│  Upload Resume   │
└────────┬─────────┘
         │
    ┌────▼────┐
    │ Promise │
    │  .all   │
    └────┬────┘
    ┌────┴────────────────┐
    │                     │
┌───▼──────┐    ┌────────▼────────┐
│  Parse   │    │  Fetch Jobs     │
│ Resume   │    │  (Adzuna/Cache) │
└───┬──────┘    └────────┬────────┘
    │                     │
    └────────┬────────────┘
             │
    ┌────────▼────────┐
    │  Compute Corpus  │
    │  TF-IDF Stats    │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  Rank Jobs with  │
    │  Precomputed     │
    │  Vectors         │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  Return Unified  │
    │  Response        │
    └──────────────────┘
```

### TF-IDF Weighting
- **Smoothed IDF**: `log((N+1)/(df+1)) + 1` prevents zero-weight terms
- **Corpus-level DF**: computed across all jobs in DB at query time
- **Precomputed vectors**: stored in `Job.vector` (Map of skill → TF-IDF weight)
- **Runtime cost**: only the user's vector is computed per request

### Background Worker
- **Schedule**: Every 6 hours (`0 */6 * * *`)
- **Coverage**: 11 industry keywords (React, Node.js, Python, Data Science, DevOps, etc.)
- **Startup**: Initial pre-fetch runs 10s after server boot
- **Rate-respectful**: 500ms delay between sequential API calls

## API Endpoints

### Core Analyze
- `POST /api/analyze` (protected)
  - Upload resume + optional industry/keyword/location
  - Returns ATS score, extracted skills, industry readiness, skill gaps, ranked jobs, and performance timings

### System
- `GET /api/system/metrics` — Returns cache hit ratio, avg analyze time, P95 latency, total resumes analyzed, DB stats, uptime

### Users
- `POST /api/users/register` — Register new user
- `POST /api/users/login` — Login and get JWT
- `GET /api/users/profile` (protected) — Returns profile + resumeData + analysisHistory

### Legacy (still supported)
- `POST /api/resumes/upload` (protected)
- `GET /api/resumes/analysis` (protected)
- `GET /api/jobs/recommendations` (protected)
- `GET /api/jobs/search` (protected)

## Services Overview
- `services/parsingService.js` — Resume text extraction and skill/entity extraction
- `services/atsService.js` — ATS scoring heuristics (6 weighted categories)
- `services/industryTemplateService.js` — Industry templates with skill weights
- `services/industryReadinessService.js` — Weighted industry readiness computation
- `services/matchingService.js` — Corpus TF-IDF, cosine similarity, precomputed vectors, hybrid scoring
- `services/jobFetchService.js` — Adzuna API fetching + MongoDB caching + vector precomputation
- `services/analyzeService.js` — Parallelized orchestrator for `POST /api/analyze`
- `workers/jobCron.js` — Background cron worker for periodic job pre-fetching

## Production Considerations
- Rate limiting on `/api/analyze` (10 req/min)
- Adzuna API timeout (2.5s) with DB fallback
- 6-hour job cache with MongoDB TTL index (auto-deletion)
- Background job pre-fetching every 6 hours via node-cron
- Structured JSON logging with pino (per-stage timing instrumentation)
- System metrics endpoint for monitoring
- Resume version history (last 20 analysis snapshots)
- Precomputed TF-IDF job vectors reduce per-request compute
- Input validation and sanitization
- Keep `.env` out of version control

## License
ISC
