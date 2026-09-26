# 🧠 RepoMind — AI-Powered Codebase Analysis & Architecture Assistant

> **OJT Project Design Specification**  
> **Student Name:** Subhechha Maiti  
> **Roll No:** 251810700219  
> **Year & Section:** 1st Year  
> **Project Type:** Application Development  

---

## 🚀 Overview

**RepoMind** is an advanced AI Codebase Doctor & Architecture Assistant designed to automatically analyze complex software repositories, identify technical debt, diagnose architectural bottlenecks (circular dependencies, tightly coupled modules), detect critical security exposures (SQL injection, hardcoded secrets, CVE supply-chain advisories), and generate actionable AI refactoring diffs.

---

## 🛠️ Complete Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, React Flow, Recharts, Lucide Icons, Axios, Canvas Confetti
- **Backend:** Python 3.13, FastAPI, Uvicorn, Pydantic, SQLAlchemy, JWT Authentication, NetworkX (Graph Algorithms), SQLite/PostgreSQL
- **Analysis Engine:** Python AST Parser, Static Rule Matcher, Dependency Vulnerability Auditor, Regex Security Guard
- **AI / LLM:** Google Gemini API / OpenAI API integration + Built-in Agentic AI Reasoning Engine
- **Reports:** Client-side Printable PDF View, Markdown (.md), and JSON (.json) Export

---

## 🖥️ All 12 Application Screens Flow

| # | Screen | Purpose & Capabilities |
| :--- | :--- | :--- |
| 1 | 🏠 **Landing / Home** | Project introduction, interactive capabilities, architecture highlights, and instant demo launcher. |
| 2 | 🔐 **Login / Register** | JWT authentication, validation, GitHub connection, and 1-Click Instant Demo Login. |
| 3 | 📊 **Dashboard** | Project overview cards (Healthy, At Risk, Critical), recent repositories, and quick actions. |
| 4 | ➕ **Add Project** | GitHub URL import, branch selection, and 1-Click preloaded vulnerable test repos (e.g., Campus Management). |
| 5 | 🔍 **Analysis Progress** | Live stage-by-stage pipeline checklist (AST -> Security -> Dependencies -> Architecture -> AI Health). |
| 6 | ❤️ **Codebase Health** | Circular health score gauge (0–100), category breakdown bars, codebase stats, and historical progression chart. |
| 7 | 🚨 **Issues & Findings** | Multi-facet filtering by Severity (Critical/High/Medium/Low), Category, Status, and Search. |
| 8 | 🔎 **Issue Details** | Line-by-line code snippet highlighting, "Why It Matters" AI explanation, and direct "Generate AI Fix" trigger. |
| 9 | 🏗️ **Architecture View** | Interactive React Flow dependency diagram with animated edges, cycle loops highlight, and coupling scores. |
| 10 | 🤖 **AI Codebase Chat** | RAG-powered conversational assistant with context source citations and preset questions. |
| 11 | 🛠️ **Fix Center** | Interactive Side-by-Side and Unified Before/After code diffs with 1-click patch approval. |
| 12 | 📄 **Reports** | Executive summaries, category scores, and downloadable audit reports in PDF, Markdown, and JSON. |

---

## ⚡ Quick Start (Run Locally on Localhost)

### 1. Run Everything in One Command

**Using PowerShell:**
```powershell
.\run_dev.ps1
```

**Using Windows Batch / CMD:**
```cmd
run_dev.bat
```

---

### 2. Manual Startup (Separate Terminals)

#### Terminal 1 — Backend (FastAPI)
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Run backend server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be live at: **`http://localhost:8000`**  
Interactive Swagger Docs: **`http://localhost:8000/docs`**

#### Terminal 2 — Frontend (React + Vite)
```bash
cd frontend

# 1. Install dependencies (if not already done)
npm install

# 2. Run development server
npm run dev
```
Frontend Web App will be live at: **`http://localhost:5173`**

---

## 🧪 Testing & Verification

Run the comprehensive end-to-end integration test suite:
```bash
python -m backend.test_app
```

**Output:**
```
[SUCCESS] All 9 Core RepoMind Backend Pipeline Integration Tests Passed Successfully!
```

---

## 🌐 Deployment Guide

### Frontend Deployment (Vercel / Netlify)
1. Push the code to GitHub.
2. Connect your repository on [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Set environment variable `VITE_API_URL` pointing to your deployed backend.

### Backend Deployment (Render / Railway)
1. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set Build Command: `pip install -r backend/requirements.txt`
3. Set Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Optionally configure `GEMINI_API_KEY` in Environment Variables.

---

*Designed & developed for OJT Project Design by Subhechha Maiti.*
