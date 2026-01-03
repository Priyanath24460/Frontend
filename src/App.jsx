import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Scenario_Based_Case_Finder from "./pages/Scenario_Based_Case_Finder";
import ComprehensiveAnalysis from "./pages/ComprehensiveAnalysis";
import "./App.css";

export default function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/Scenario_Based_Case_Finder" element={<Scenario_Based_Case_Finder />} />
          <Route path="/contract-analysis" element={<ComprehensiveAnalysis />} />
        </Routes>
      </Router>
    </div>
  );
}
