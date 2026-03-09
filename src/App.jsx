import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Scenario_Based_Case_Finder from "./pages/Scenario_Based_Case_Finder";
import ComprehensiveAnalysis from "./pages/ComprehensiveAnalysis";
import FR_Violation_Screener from "./pages/FR_Violation_Screener";
// import CaseAnalysis from "./pages/summarizer/CaseAnalysis";
// import { CaseAnalysisProvider } from "./contexts/CaseAnalysisContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
        {/* <CaseAnalysisProvider> */}
          <Router>
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
                    <Scenario_Based_Case_Finder />
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
                    <FR_Violation_Screener />
                  </ProtectedRoute>
                } 
              />
              {/* <Route 
                path="/case-summarizer" 
                element={
                  <ProtectedRoute>
                    <CaseAnalysis />
                  </ProtectedRoute>
                } 
              /> */}
              <Route 
                path="/comprehensive_Analysis" 
                element={
                  <ProtectedRoute>
                    <ComprehensiveAnalysis />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        {/* </CaseAnalysisProvider> */}
      </AuthProvider>
    </div>
  );
}
