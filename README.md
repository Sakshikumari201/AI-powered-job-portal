# AI Resume Analyzer, Job Match & Career Planner Platform

A full-stack MERN application that analyzes resumes (PDF/DOCX), calculates ATS scores based on NLP heuristics, identifies missing skills based on job requirements, and recommends jobs using terminology-aware matching. 

Recently enhanced with **Generative AI** capabilities, including tailored Cover Letter generation and AI Mock Interviews, alongside a fully interactive ATS-friendly Resume Builder and a Kanban-style Application Tracker.

## Architecture & Tech Stack
- **Frontend**: React.js, Tailwind CSS, Vite, Recharts, drag-and-drop (`lucide-react`, standard HTML5 dnd)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Generative AI**: Google Gemini AI (`@google/generative-ai`)
- **Document Generation**: `html2pdf.js` for client-side PDF export
- **Document Parsing**: `pdf-parse`, `mammoth`
- **NLP & Analysis**: `natural`, `compromise`
- **Logging**: `pino` + `pino-pretty` (structured JSON logging)
- **Background Workers**: `node-cron` (scheduled job pre-fetching)

## Core Features

### 🧠 Advanced Job Matching Engine
- **Corpus-level TF-IDF Scoring** — rare skills (kubernetes, terraform) weigh more than common terms (team, experience)
- **Precomputed Job Vectors** — TF-IDF vectors stored in DB; only the resume vector is computed at runtime.
- **Hybrid Matching Engine** (70% Cosine Similarity + 30% Skill Overlap) with smoothed IDF.

### 🤖 Generative AI Integrations (Powered by Google Gemini)
- **AI Cover Letter Builder**: Automatically generates a highly customized, professional 3-4 paragraph cover letter. It securely sends the candidate's parsed resume data and the specific Adzuna job description to the Gemini API (`gemini-2.5-flash`), crafting a narrative about why the candidate is a perfect fit. 
- **AI Mock Interview Simulator**: Interactive chat interface that conducts a realistic mock interview. The Gemini model assumes the persona of a strict technical interviewer, asks targeted questions based on the candidate's skills and the specific job title, and grades the user's typed responses in real-time.

### 📊 End-to-End Career Tracking
- **Job Tracker (Kanban Board)**: Drag-and-drop application pipeline manager allowing users to track job applications across states ("Saved", "Applied", "Interviewing", "Offers", "Rejected"). 
- **Interactive Resume Builder (WYSIWYG)**: Live dynamic A4-resume preview tool. Users edit their Personal Info, Experience, Education, and Skills in real-time, instantly rendering a professionally formatted ATS-friendly document that can be exported directly to PDF using `html2pdf.js`.

### 📄 Comprehensive Analysis Pipeline
- **One-Shot Analyze Endpoint** (`POST /api/analyze`) returning ATS + Jobs + Gaps in a single response via `Promise.all`.
- **Skill Gap Analysis** (Matched vs Missing Skills visually rendered).
- **Industry Template + Weighted Readiness** (Software Development, Data Science, DevOps).

### 🛠 Production-Ready Infrastructure
- **System Metrics Endpoint** (`GET /api/system/metrics`) returns cache hit ratio, avg analyze time, P95 latency.
- **Structured Logging** with `pino` (parse, ATS, match, total durations).
- **Background Job Worker** via `node-cron` pre-fetches industry jobs every 6 hours.
- MongoDB TTL Index auto-deletes expired jobs after 6 hours.

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or MongoDB Atlas)
- Adzuna API credentials (optional, fallback to cached DB jobs)
- Google Gemini API Key (required for Cover Letters & Mock Interviews)

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
GEMINI_API_KEY=your-gemini-api-key
```

## How it works

1. **Upload & Analyze**: Upload PDF/DOCX. The platform parses the resume into structured data, computes the ATS score, loads industry templates, and fetches real-time jobs from Adzuna (with cache fallback) in a highly parallelized pipeline.
2. **Review Metrics**: Check visual metrics of your resume's strength and industry readiness.
3. **Explore Job Matches**: View recommended jobs ranked by hybrid cosine/overlap scoring. 
4. **Generate Cover Letters & Interview Prep**: Directly from the Job Matches dashboard, trigger the Gemini AI to write a custom cover letter or launch a mock interview session for a specific role.
5. **Manage Applications**: Save your interested jobs to the Job Tracker Kanban board to visually drag-and-drop your progress.
6. **Build Custom Resumes**: Use the interactive Resume Builder to craft new resumes optimized against the AI's feedback.

## API Endpoints Overview

### Analyze & AI
- `POST /api/analyze`: Upload resume -> returns ATS score, extracted skills, industry readiness, gaps, and job matches.
- `POST /api/cover-letter/generate`: Expects `resumeData` and `jobData`, returns a plain-text generative AI cover letter.
- `POST /api/interview/simulate`: Expects `jobTitle`, `skills`, and chat `history`, returns interviewer response & grading.

### Job Tracking (CRUD)
- `GET /api/applications`: Get user's application board.
- `POST /api/applications`: Add a new application to the board.
- `PUT /api/applications/:id`: Update state (e.g. dragging across kanban columns).
- `DELETE /api/applications/:id`: Delete an application.

### Legacy & Core
- `GET /api/system/metrics`: System performance metrics.
- `POST /api/users/login`, `POST /api/users/register`: JWT Handlers.

## Services Overview
- `services/analyzeService.js` — Parallelized orchestrator for parsing, scoring, and fetching.
- `services/matchingService.js` — Corpus TF-IDF, cosine similarity, hybrid scoring.
- `services/coverLetterService.js` — Google Gemini prompt constructor and requestor for customized job pitches.
- `services/interviewService.js` — AI Mock Interview state manager and evaluator.
- `services/jobFetchService.js` — Adzuna API fetching + Vector caching.
- `workers/jobCron.js` — Periodic background job fetcher.

## License
ISC
