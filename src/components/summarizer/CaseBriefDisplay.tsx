import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  DocumentTextIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  ScaleIcon,
  LightBulbIcon,
  SparklesIcon,
  DocumentIcon,
  BookOpenIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import './CaseBriefDisplay.css';

interface CaseBriefProps {
  documentId: number;
  autoLoad?: boolean;
}

interface CaseBrief {
  case_identification: {
    case_name: string;
    court: string;
    year: string | number;
    citation: string;
  };
  executive_summary?: string;
  facts: string;
  issues: string[];
  holding: string;
  reasoning: string;
  ratio_decidendi: string[];
  procedural_principles: {
    statutory_provisions?: string[];
    procedural_rules?: string[];
    note?: string;
  };
  key_takeaways: string[];
  final_order: string;
}

const CaseBriefDisplay: React.FC<CaseBriefProps> = ({ documentId, autoLoad = false }) => {
  const [brief, setBrief] = useState<CaseBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrief = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://127.0.0.1:8000/api/analysis/case-brief/${documentId}`
      );
      
      setBrief(response.data.case_brief);
    } catch (err: any) {
      console.error('Failed to load case brief:', err);
      setError(err.response?.data?.detail || 'Failed to generate case brief');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad && documentId) {
      loadBrief();
    }
  }, [documentId, autoLoad]);

  if (loading) {
    return (
      <div className="case-brief-loading">
        <div className="spinner"></div>
        <p>Generating structured case brief...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="case-brief-error">
        <p>{error}</p>
        <button onClick={loadBrief} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (!brief && !autoLoad) {
    return (
      <div className="case-brief-prompt">
        <button onClick={loadBrief} className="generate-brief-btn">
          <DocumentTextIcon className="icon" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
          Generate Structured Case Brief
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Create a professional case brief with facts, issues, holding, and ratio decidendi
        </p>
      </div>
    );
  }

  if (!brief) return null;

  return (
    <div className="case-brief-container">
      {/* Case Citation Header */}
      {brief.case_identification && (
        <div className="brief-header">
          <h2 className="case-name">
            {brief.case_identification.case_name || 'Case Name Not Available'}
          </h2>
          <div className="citation-details">
            <span className="court">{brief.case_identification.court || 'N/A'}</span>
            <span className="separator">•</span>
            <span className="year">{brief.case_identification.year || 'N/A'}</span>
            {brief.case_identification.citation && brief.case_identification.citation !== 'N/A' && (
              <>
                <span className="separator">•</span>
                <span className="citation">{brief.case_identification.citation}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Executive Summary */}
      {brief.executive_summary && (
        <div className="brief-section executive-summary">
          <h3 className="section-title">
            <DocumentTextIcon className="icon" />
            Executive Summary
          </h3>
          <p className="summary-text">{brief.executive_summary}</p>
        </div>
      )}

      {/* Facts */}
      {brief.facts && (
        <div className="brief-section facts">
          <h3 className="section-title">
            <PencilSquareIcon className="icon" />
            Facts
          </h3>
          <p className="section-content">{brief.facts}</p>
        </div>
      )}

      {/* Issues */}
      {brief.issues && Array.isArray(brief.issues) && brief.issues.length > 0 && (
        <div className="brief-section issues">
          <h3 className="section-title">
            <QuestionMarkCircleIcon className="icon" />
            Legal Issues
          </h3>
          <ul className="issues-list">
            {brief.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Holding/Decision */}
      {brief.holding && (
        <div className="brief-section holding">
          <h3 className="section-title">
            <ScaleIcon className="icon" />
            Holding / Decision
          </h3>
          <p className="section-content">{brief.holding}</p>
        </div>
      )}

      {/* Reasoning */}
      {brief.reasoning && (
        <div className="brief-section reasoning">
          <h3 className="section-title">
            <LightBulbIcon className="icon" />
            Reasoning
          </h3>
          <p className="section-content">{brief.reasoning}</p>
        </div>
      )}

      {/* Ratio Decidendi */}
      {brief.ratio_decidendi && Array.isArray(brief.ratio_decidendi) && brief.ratio_decidendi.length > 0 && (
        <div className="brief-section ratio">
          <h3 className="section-title">
            <SparklesIcon className="icon" />
            Ratio Decidendi (Legal Principles)
          </h3>
          <ul className="ratio-list">
            {brief.ratio_decidendi.map((principle, idx) => (
              <li key={idx}><strong>•</strong> {principle}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Procedural Principles */}
      {brief.procedural_principles && (
        <div className="brief-section procedural">
          <h3 className="section-title">
            <DocumentIcon className="icon" />
            Procedural / Evidentiary Principles
          </h3>
          {brief.procedural_principles.statutory_provisions && 
           brief.procedural_principles.statutory_provisions.length > 0 ? (
            <ul className="principles-list">
              {brief.procedural_principles.statutory_provisions.map((principle: string, idx: number) => (
                <li key={idx}>{principle}</li>
              ))}
            </ul>
          ) : (
            <p className="section-content">
              {brief.procedural_principles.note || 'No specific procedural principles cited.'}
            </p>
          )}
        </div>
      )}

      {/* Key Takeaways */}
      {brief.key_takeaways && Array.isArray(brief.key_takeaways) && brief.key_takeaways.length > 0 && (
        <div className="brief-section takeaways">
          <h3 className="section-title">
            <BookOpenIcon className="icon" />
            Key Takeaways
          </h3>
          <ul className="takeaways-list">
            {brief.key_takeaways.map((takeaway: string, idx: number) => (
              <li key={idx}>{takeaway}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Final Order */}
      {brief.final_order && (
        <div className="brief-section final-order">
          <h3 className="section-title">
            <CheckCircleIcon className="icon" />
            Final Order
          </h3>
          <p className="order-text">{brief.final_order}</p>
        </div>
      )}
    </div>
  );
};

export default CaseBriefDisplay;
