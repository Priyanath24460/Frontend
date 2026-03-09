import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CaseAnalysisProvider } from "./contexts/CaseAnalysisContext";
import "./App.css";

// ── Error Boundary ─────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, i) { console.error("Crash:", e, i); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, background: "#1a0000", color: "#ff6b6b", minHeight: "100vh", fontFamily: "monospace" }}>
          <h2>⚠️ App Error</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Lazy imports to isolate crashes ────────────────────────────────────
const Home = React.lazy(() => import("./pages/Home"));
const Upload = React.lazy(() => import("./pages/Upload"));
const ScenarioFinder = React.lazy(() => import("./pages/Scenario_Based_Case_Finder"));
const ComprehensiveAnalysis = React.lazy(() => import("./pages/ComprehensiveAnalysis"));
const CaseAnalysis = React.lazy(() => import("./pages/summarizer/CaseAnalysis"));
const CaseDetailPage = React.lazy(() => import("./pages/summarizer/CaseDetailPage"));
const RAGUploadPage = React.lazy(() => import("./pages/summarizer/RAGUploadPage"));

const Fallback = () => (
  <div style={{ padding: 32, textAlign: "center", color: "#888", fontFamily: "sans-serif" }}>
    <div style={{ fontSize: 32 }}>⏳</div>
    <p>Loading...</p>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <CaseAnalysisProvider>
        <Router>
          <React.Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/Scenario_Based_Case_Finder" element={<ScenarioFinder />} />
              <Route path="/analysis" element={<ComprehensiveAnalysis />} />
              <Route path="/case-summarizer" element={<CaseAnalysis />} />
              <Route path="/case-summarizer/:id" element={<CaseDetailPage />} />
              <Route path="/rag-upload" element={<RAGUploadPage />} />
              <Route path="/rag" element={<RAGUploadPage />} />
            </Routes>
          </React.Suspense>
        </Router>
      </CaseAnalysisProvider>
    </ErrorBoundary>
  );
}
