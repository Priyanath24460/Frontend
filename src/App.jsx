import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Scenario_Based_Case_Finder from "./pages/Scenario_Based_Case_Finder";
import ComprehensiveAnalysis from "./pages/ComprehensiveAnalysis";
import FR_Violation_Screener from "./pages/FR_Violation_Screener";
import CaseAnalysis from "./pages/summarizer/CaseAnalysis";
import { CaseAnalysisProvider } from "./contexts/CaseAnalysisContext";

import "./App.css";

export default function App() {
  return (
    <div className="App">
      <CaseAnalysisProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/Scenario_Based_Case_Finder" element={<Scenario_Based_Case_Finder />} />
            <Route path="/analysis" element={<ComprehensiveAnalysis />} />
            <Route path="/fr-violation-screener" element={<FR_Violation_Screener />} />
            <Route path="/case-summarizer" element={<CaseAnalysis />} />
            <Route path="/comprehensive_Analysis" element={<ComprehensiveAnalysis />} />
          </Routes>
        </Router>
      </CaseAnalysisProvider>
    </div>
  );
}
