import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  DocumentTextIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  ScaleIcon,
  SparklesIcon,
  DocumentIcon,
  BookOpenIcon,
  CheckCircleIcon,
  LinkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import './CaseBriefDisplay.css';
import { BACKEND_BASE } from '../../config/api';

interface CaseBriefProps {
  documentId: number;
  fileName?: string;
  autoLoad?: boolean;
}

interface CaseBrief {
  case_identification: {
    case_name: string;
    court: string;
    year: string | number;
    citation: string;
    judges?: string;
  };
  area_of_law?: string;
  facts: string;
  issues?: string[];
  holding?: string;
  reasoning?: string;
  final_order?: string;
  ratio_decidendi?: string[];
  procedural_principles?: {
    statutory_provisions?: string[];
    procedural_rules?: string[];
    note?: string;
  };
  executive_summary?: string;
  related_cases?: string[];
  key_takeaways?: string[];
}

const UNIDENTIFIED = ['Not identified', 'Case name not identified', 'N/A', 'Unknown Case'];
const isUnidentified = (val?: string) => !val || UNIDENTIFIED.some(u => val.trim().startsWith(u));

const CaseBriefDisplay: React.FC<CaseBriefProps> = ({ documentId, fileName, autoLoad = false }) => {
  const [brief, setBrief] = useState<CaseBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrief = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${BACKEND_BASE}/api/analysis/case-brief/${documentId}`,
        { timeout: 120000 }
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
    if (autoLoad && documentId) loadBrief();
  }, [documentId, autoLoad]);

  if (loading) {
    return (
      <div className="case-brief-loading">
        <div className="spinner"></div>
        <p>Generating structured case brief…</p>
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

  const ci = brief.case_identification || {};
  // Display the case name — fall back to the file name prop if still unidentified
  const displayCaseName = isUnidentified(ci.case_name)
    ? (fileName || 'Case Name Not Available')
    : ci.case_name;

  // Normalize a value to a plain string, handling both old string[] and new object[] shapes
  const toStr = (v: unknown): string => {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      // statutory provision object: {statute_and_section, context, relevance}
      if (o.statute_and_section) return `${o.statute_and_section}${o.context ? ' — ' + o.context : ''}`;
      // related case object: {case_name, citation, how_related, key_holding, relevance_score}
      if (o.case_name)           return `${o.case_name}${o.citation ? ' (' + o.citation + ')' : ''}${o.how_related ? ' — ' + o.how_related : ''}`;
      // constitutional provision object: {article, context_in_judgment, relevance}
      if (o.article)             return `Article ${o.article}${o.context_in_judgment ? ': ' + o.context_in_judgment : ''}`;
      return JSON.stringify(o);
    }
    return String(v ?? '');
  };

  const statues = [
    ...(brief.procedural_principles?.statutory_provisions || []),
  ].filter((v, i, a) => a.indexOf(v) === i); 

  const legalIssues = brief.issues || [];
  const ruleOfLaw = brief.ratio_decidendi || [];
  const holdingText = brief.holding || '';
  const reasoningText = brief.reasoning || '';
  const proceduralNote = brief.procedural_principles?.note || 
    (brief.procedural_principles?.procedural_rules?.length ? brief.procedural_principles.procedural_rules.join('; ') : null);

  return (
    <div className="case-brief-container">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="brief-header">
        <h2 className="case-name">{displayCaseName}</h2>
        <div className="citation-details">
          {ci.court && <span className="court">{ci.court}</span>}
          {ci.court && ci.year && <span className="separator">•</span>}
          {ci.year && <span className="year">{ci.year}</span>}
          {ci.citation && ci.citation !== 'N/A' && (
            <>
              <span className="separator">•</span>
              <span className="citation">{ci.citation}</span>
            </>
          )}
          {ci.judges && ci.judges !== 'N/A' && (
            <>
              <span className="separator">•</span>
              <span className="judges">Judges: {ci.judges}</span>
            </>
          )}
          {brief.area_of_law && brief.area_of_law !== 'N/A' && (
            <>
              <span className="separator">•</span>
              <span className="area-of-law" style={{ color: '#b45309', fontStyle: 'italic' }}>
                {brief.area_of_law}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Statutory Provisions ───────────────────────────────────────── */}
      {statues.length > 0 && (
        <div className="brief-section procedural">
          <h3 className="section-title">
            <DocumentIcon className="icon" />
            Statutory Provisions
          </h3>
          <ul className="principles-list">
            {statues.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* ── Facts ─────────────────────────────────────────────────────── */}
      {brief.facts && (
        <div className="brief-section facts">
          <h3 className="section-title">
            <PencilSquareIcon className="icon" />
            Facts
          </h3>
          <p className="section-content">{brief.facts}</p>
        </div>
      )}

      {/* ── Issues ────────────────────────────────────────────────────── */}
      {legalIssues.length > 0 && (
        <div className="brief-section issues">
          <h3 className="section-title">
            <QuestionMarkCircleIcon className="icon" />
            Legal Issues
          </h3>
          <ul className="issues-list">
            {legalIssues.map((issue, idx) => <li key={idx}>{issue}</li>)}
          </ul>
        </div>
      )}

      {/* ── Holding ───────────────────────────────────────────────────── */}
      {holdingText && (
        <div className="brief-section holding">
          <h3 className="section-title">
            <ScaleIcon className="icon" />
            Holding / Decision
          </h3>
          <p className="section-content">{holdingText}</p>
        </div>
      )}

      {/* ── Reasoning ────────────────────────── */}
      {reasoningText && (
        <div className="brief-section reasoning">
          <h3 className="section-title">
            <BookOpenIcon className="icon" />
            Judicial Reasoning
          </h3>
          <p className="section-content">{reasoningText}</p>
        </div>
      )}

      {/* ── Final Order ───────────────────────────────────────────────── */}
      {brief.final_order && (
        <div className="brief-section final-order">
          <h3 className="section-title">
            <CheckCircleIcon className="icon" />
            Final Order
          </h3>
          <p className="order-text">{brief.final_order}</p>
        </div>
      )}

      {/* ── Ratio Decidendi ───────────────────────────────────────────── */}
      {ruleOfLaw.length > 0 && (
        <div className="brief-section ratio">
          <h3 className="section-title">
            <SparklesIcon className="icon" />
            Ratio Decidendi
          </h3>
          <ul className="ratio-list">
            {ruleOfLaw.map((principle, idx) => (
              <li key={idx}><strong>•</strong> {principle}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Procedural Principles ─────────────────────────────────── */}
      {proceduralNote && proceduralNote !== 'Not a primarily procedural case.' && (
        <div className="brief-section procedural">
          <h3 className="section-title">
            <DocumentTextIcon className="icon" />
            Procedural & Evidentiary Principles
          </h3>
          <p className="section-content">{proceduralNote}</p>
        </div>
      )}

      {/* ── Key Takeaways ────────────────────── */}
      {brief.key_takeaways && brief.key_takeaways.length > 0 && (
        <div className="brief-section takeaways">
          <h3 className="section-title">
            <BookOpenIcon className="icon" />
            Key Takeaways
          </h3>
          <ul className="takeaways-list">
            {brief.key_takeaways.map((t, idx) => <li key={idx}>{t}</li>)}
          </ul>
        </div>
      )}

    </div>
  );
};

export default CaseBriefDisplay;
