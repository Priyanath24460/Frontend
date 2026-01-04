import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Scenario_Based_Case_Finder from "./pages/Scenario_Based_Case_Finder";
import ComprehensiveAnalysis from "./pages/ComprehensiveAnalysis";
import CaseAnalysis from "./pages/summarizer/CaseAnalysis";
import "./App.css";

export default function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/Scenario_Based_Case_Finder" element={<Scenario_Based_Case_Finder />} />
          <Route path="/analysis" element={<ComprehensiveAnalysis />} />
          <Route path="/case-summarizer" element={<CaseAnalysis />} />
        </Routes>
      </Router>
    </div>
  );
}
