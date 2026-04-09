import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CaseDetailPage.css';
import Header from "./components/Header";
import { BACKEND_BASE } from './config/api';

interface CaseData {
  document_id: number;
  file_name: string;
  court: string;
  year: number;
  case_number: string;
  uploaded_at: string;
  file_path?: string; // Add this to get PDF URL
  text: {
    cleaned: string;
    full_length: number;
  };
  metadata: {
    has_embedding: boolean;
    embedding_dimension: number;
  };
  analysis: {
    rights_detected: number;
    citations_found: number;
    entities_extracted: number;
  };
  rights: Array<{
    article_number: number;
    matched_text: string;
    explanation_en: string;
  }>;
  citations: string[];
  entities: Record<string, Array<{ text: string; context: string }>>;
}

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/analysis/case/${id}`);  // Relative URL with proxy
        setCaseData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load case');
        console.error('Error loading case:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCase();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="case-detail-loading">
          <div className="spinner"></div>
          <p>Loading case details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="case-detail-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-link">← Back</button>
        </div>
      </>
    );
  }

  if (!caseData) {
    return (
      <>
        <Header />
        <div className="case-detail-error">
          <h2>Case Not Found</h2>
          <button onClick={() => navigate(-1)} className="back-link">← Back</button>
        </div>
      </>
    );
  }

  const isPDF = caseData.file_name.toLowerCase().endsWith('.pdf');

  return (
    <>
      <Header />
      <div className="case-detail-page">
        <div className="case-detail-header">
          <button onClick={() => navigate(-1)} className="back-link">← Back</button>
          <h1>{caseData.file_name}</h1>
        </div>

        <div className="case-metadata-card">
          <h2>Case Metadata</h2>
          <div className="metadata-grid">
            <div className="metadata-item">
              <strong>Court:</strong>
              <span>{caseData.court || 'N/A'}</span>
            </div>
            <div className="metadata-item">
              <strong>Year:</strong>
              <span>{caseData.year || 'N/A'}</span>
            </div>
            <div className="metadata-item">
              <strong>Case Number:</strong>
              <span>{caseData.case_number || 'N/A'}</span>
            </div>
            <div className="metadata-item">
              <strong>Uploaded:</strong>
              <span>
                {caseData.uploaded_at
                  ? new Date(caseData.uploaded_at).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="case-analysis-summary">
          <h2>Analysis Summary</h2>
          <div className="analysis-stats">
            <div className="stat-card">
              <span className="stat-value">{caseData.analysis.rights_detected}</span>
              <span className="stat-label">Rights Detected</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{caseData.analysis.citations_found}</span>
              <span className="stat-label">Citations Found</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{caseData.analysis.entities_extracted}</span>
              <span className="stat-label">Entities Extracted</span>
            </div>
          </div>
        </div>

        {caseData.rights && caseData.rights.length > 0 && (
          <div className="rights-section">
            <h2>Constitutional Rights Detected</h2>
            <div className="rights-list">
              {caseData.rights.map((right, idx) => (
                <div key={idx} className="right-card">
                  <div className="right-header">
                    <strong>Article {right.article_number}</strong>
                  </div>
                  <p className="right-matched">{right.matched_text}</p>
                  <p className="right-explanation">{right.explanation_en}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {caseData.citations && caseData.citations.length > 0 && (
          <div className="citations-section">
            <h2>Citations</h2>
            <ul className="citations-list">
              {caseData.citations.map((citation, idx) => (
                <li key={idx}>{citation}</li>
              ))}
            </ul>
          </div>
        )}

        {caseData.entities && Object.keys(caseData.entities).length > 0 && (
          <div className="entities-section">
            <h2>Extracted Entities</h2>
            {Object.entries(caseData.entities).map(([type, entities]) => (
              <div key={type} className="entity-group">
                <h3>{type.replace('_', ' ')}</h3>
                <div className="entity-tags">
                  {entities.map((entity, idx) => (
                    <span key={idx} className="entity-tag" title={entity.context}>
                      {entity.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="case-text-section">
          <div className="text-header">
            <h2>{isPDF ? 'Case Document' : 'Case Text'}</h2>
            {!isPDF && (
              <button
                className="toggle-text-btn"
                onClick={() => setShowFullText(!showFullText)}
              >
                {showFullText ? 'Show Less' : 'Show Full Text'}
              </button>
            )}
          </div>
          <div className="case-text-content">
            {isPDF && caseData.file_path ? (
              <iframe
                src={`${BACKEND_BASE}${caseData.file_path}`}

                className="pdf-viewer"
                title="Case PDF"
              />
            ) : (
              <>
                <pre>{showFullText ? caseData.text.cleaned : caseData.text.cleaned.substring(0, 5000)}</pre>
                {!showFullText && caseData.text.full_length > 5000 && (
                  <p className="text-truncated-notice">
                    Showing first 5000 characters. Click "Show Full Text" to see more.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseDetailPage;