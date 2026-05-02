# AI Resume Matcher & Career Hub

This is a full-stack job portal project I built using the MERN stack. It uses NLP and AI to help people understand how their resumes stack up against job requirements and manage their application process.

The main goal was to build something that actually helps in the job search by identifying skill gaps and matching resumes to real-world job listings using some cool matching logic.

## What's under the hood?
- **Frontend**: React (Vite) + Tailwind for the UI.
- **Backend**: Node/Express for the API.
- **Database**: MongoDB for storing users, resumes, and job data.
- **AI Stuff**: Integrated Google Gemini for things like cover letter generation and mock interviews.
- **NLP**: Using `natural` and `compromise` libraries to handle the text analysis.
- **Parsing**: `pdf-parse` and `mammoth` for reading those annoying PDF and Word docs.

## Key Features
- **Smart Matching**: Uses TF-IDF and Cosine Similarity to match resumes to jobs (basically, it looks at how unique your skills are compared to the job pool).
- **AI Prep**: Use Gemini to generate a cover letter based on your resume or practice with a mock interview bot.
- **Job Tracker**: A simple Kanban board to keep track of where you've applied.
- **Resume Builder**: A live editor to create ATS-friendly resumes that you can export to PDF.
- **Skill Gap Analysis**: Shows you exactly what's missing from your resume for a specific job.

## Getting Started

### 1. Prerequisites
You'll need Node.js and a MongoDB instance (local or Atlas) running.

### 2. Backend Setup
```bash
cd server
npm install
node seeder.js # loads some sample data
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 4. Config (.env)
Make sure to set up your `.env` in the `server` folder:
- `MONGO_URI`: your mongo connection string
- `JWT_SECRET`: something random for auth
- `GEMINI_API_KEY`: get this from Google AI Studio
- `ADZUNA_APP_ID` / `KEY`: (optional) for real-time job fetching

## Project Structure
- `server/services`: This is where the heavy lifting happens (matching logic, AI prompts, etc).
- `client/src/context`: Auth and Theme state management.
- `client/src/pages`: All the main views.

## TODO / Future Ideas
- [ ] Add more resume templates to the builder.
- [ ] Improve the mock interview feedback logic.
- [ ] Add social login (GitHub/LinkedIn).

## License
ISC
