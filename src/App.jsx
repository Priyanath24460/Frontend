import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CaseAnalysisProvider } from "./contexts/CaseAnalysisContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ContractRiskAnalysis from "./pages/ContractRiskAnalysis";

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
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Upload = React.lazy(() => import("./pages/Upload"));
const ScenarioFinder = React.lazy(() => import("./pages/Scenario_Based_Case_Finder"));
const ComprehensiveAnalysis = React.lazy(() => import("./pages/ComprehensiveAnalysis"));
const FRViolationScreener = React.lazy(() => import("./pages/FR_Violation_Screener"));
const CaseAnalysis = React.lazy(() => import("./pages/summarizer/CaseAnalysis"));
const CaseDetailPage = React.lazy(() => import("./pages/summarizer/CaseDetailPage"));
const RAGUploadPage = React.lazy(() => import("./pages/summarizer/RAGUploadPage"));
const ContractRiskRetestPage = React.lazy(() => import("./pages/ContractRiskRetestPage"));

const Fallback = () => (
  <div style={{ padding: 32, textAlign: "center", color: "#888", fontFamily: "sans-serif" }}>
    <div style={{ fontSize: 32 }}>⏳</div>
    <p>Loading...</p>
  </div>
);

export default function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <AuthProvider>
          <CaseAnalysisProvider>
            <Router>
              <React.Suspense fallback={<Fallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected Routes - Require Authentication */}
                  <Route 
                    path="/upload" 
                    element={
                      <ProtectedRoute>
                        <Upload />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/Scenario_Based_Case_Finder" 
                    element={
                      <ProtectedRoute>
                        <ScenarioFinder />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/analysis" 
                    element={
                      <ProtectedRoute>
                        <ComprehensiveAnalysis />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/fr-violation-screener" 
                    element={
                      <ProtectedRoute>
                        <FRViolationScreener />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/case-summarizer" 
                    element={
                      <ProtectedRoute>
                        <CaseAnalysis lang="en" />
                      </ProtectedRoute>
                    } 
                  /> 
                  <Route 
                    path="/comprehensive_Analysis" 
                    element={
                      <ProtectedRoute>
                        <ComprehensiveAnalysis />
                      </ProtectedRoute>
                    } 
                  />
                  <Route
                    path="/contract-risk-analysis"
                    element={
                      <ProtectedRoute>
                        <ContractRiskAnalysis />
                      </ProtectedRoute>
                    }
                  />
                <Route
                path="/contract-risk-retest"
                element={
                  <ProtectedRoute>
                    <ContractRiskRetestPage />
                  </ProtectedRoute>
                }
              />
              </Routes>
              </React.Suspense>
            </Router>
          </CaseAnalysisProvider>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}
