import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CaseAnalysisProvider } from './contexts/CaseAnalysisContext';
import CaseAnalysis from './pages/summarizer/CaseAnalysis';
import CaseDetailPage from './pages/summarizer/CaseDetailPage';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <CaseAnalysisProvider>
        <Routes>
          <Route path="/case-summarizer" element={<CaseAnalysis lang="en" />} />
          <Route path="/case-summarizer/:id" element={<CaseDetailPage />} />
          <Route path="/" element={<CaseAnalysis lang="en" />} />
        </Routes>
      </CaseAnalysisProvider>
    </Router>
  );
};

export default AppRoutes;
