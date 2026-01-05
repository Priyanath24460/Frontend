# LawKnow - AI-Powered Legal Assistant for Sri Lanka

React + Vite frontend for accessing Sri Lankan legal information through AI analysis.

## 🎯 Overview

LawKnow makes legal information accessible to everyone through 4 AI-powered components:

1. **Scenario-Based Case Finder** - Find similar cases from NLR/SLR
2. **Fundamental Rights Violation Screener** - Check constitutional rights violations
3. **Case Summarizer** - Understand complex legal judgments simply
4. **Contract Risk Analysis** - Analyze contracts for risks

**Problem**: Legal consultation is expensive and legal documents are complex. Many Sri Lankans can't understand their rights or interpret legal documents.

**Solution**: Free AI-powered analysis making legal information accessible to everyone.

## 🛠 Tech Stack

- React 19+, Vite, Tailwind CSS, React Router, Axios

## 📁 Structure

```
Frontend/
├── src/
│   ├── pages/                              # 4 main features
│   │   ├── Scenario_Based_Case_Finder.jsx
│   │   ├── FR_Violation_Screener.jsx
│   │   ├── ComprehensiveAnalysis.jsx
│   │   ├── Upload.jsx
│   │   └── Home.jsx
│   ├── components/                         # Reusable UI
│   ├── config/api.js                       # Backend API
│   └── assets/
├── .env.development
├── package.json
└── README.md
```

## 🚀 Setup & Run

### Install
```bash
cd Frontend
npm install
```

### Environment
Create `.env.development`:
```
VITE_FR_API_URL=http://localhost:8016
VITE_API_URL=http://localhost:5000
```

### Run
```bash
npm run dev
```
Access at: `http://localhost:5173`

### Build
```bash
npm run build
```

## 📄 4 Components

| Component | What It Does | Input | Output |
|-----------|-------------|-------|--------|
| **Case Finder** | Find similar cases | Your situation (text) | NLR/SLR cases + explanations |
| **FR Screener** | Check constitutional rights | Your scenario | Violations detected + guidance |
| **Case Summarizer** | Explain legal judgments | Court documents (PDF) | Simple explanation + key points |
| **Contract Analysis** | Identify contract risks | Contract (PDF/text) | Risk assessment + guidance |

