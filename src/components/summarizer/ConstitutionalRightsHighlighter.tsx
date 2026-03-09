import React from "react";
import { ScaleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import "./ConstitutionalRightsHighlighter.css";

interface FundamentalRight {
  article: string;
  article_title?: string;
  matched_text: string;
  explanation?: string;
  context?: string;
  method?: string;
  score?: number;
}

interface ConstitutionalRightsHighlighterProps {
  rights: FundamentalRight[];
}

const ConstitutionalRightsHighlighter: React.FC<
  ConstitutionalRightsHighlighterProps
> = ({ rights }) => {
  if (!rights || rights.length === 0) {
    return (
      <div className="rights-container">
        <h2>
          <ScaleIcon className="w-7 h-7 inline-block mr-2" style={{verticalAlign: 'middle'}} />
          Fundamental Rights (Articles 10–18)
        </h2>
        <p className="no-data">
          No fundamental rights detected in this document.
        </p>
      </div>
    );
  }

  // Deduplicate by article number - keep highest score
  const deduplicatedRights = rights.reduce((acc, right) => {
    const article = right.article;
    if (!acc[article] || right.score! > (acc[article].score || 0)) {
      acc[article] = right;
    }
    return acc;
  }, {} as Record<string, FundamentalRight>);

  const uniqueRights = Object.values(deduplicatedRights);

  return (
    <div className="rights-container">
      <h2>
        <ScaleIcon className="w-6 h-6 inline-block mr-2" style={{verticalAlign: 'middle'}} />
        Fundamental Rights ({uniqueRights.length} unique articles detected)
      </h2>
      <p className="description">
        Fundamental rights protected under Chapter III of the Constitution of
        Sri Lanka (Articles 10-18).
      </p>

      {uniqueRights.map((right, idx) => (
        <div key={idx} className="right-box">
          <div className="right-header">
            <h3 className="right-title">
              {typeof right.article_title === 'object' 
                ? (right.article_title as any).title || JSON.stringify(right.article_title)
                : right.article_title || 
                  `Article ${typeof right.article === 'object' ? (right.article as any).article_number || JSON.stringify(right.article) : right.article}`
              }
            </h3>
            {right.method && (
              <span className="method-badge">
                {right.method === "explicit_mention"
                  ? "📌 Explicit"
                  : "Detected"}
              </span>
            )}
          </div>

          <div className="matched-text">
            <strong>Matched Text:</strong>
            <p className="text-snippet">"{typeof right.matched_text === 'object' ? JSON.stringify(right.matched_text) : right.matched_text}"</p>
          </div>

          {right.explanation && (
            <details className="right-details" open>
              <summary>📖 Explanation</summary>
              <p className="explanation-text">{typeof right.explanation === 'object' ? JSON.stringify(right.explanation) : right.explanation}</p>
            </details>
          )}

          {right.context && right.context !== right.matched_text && (
            <details className="right-details">
              <summary>
                <MagnifyingGlassIcon className="w-4 h-4 inline-block mr-1" style={{verticalAlign: 'middle'}} />
                Context
              </summary>
              <p className="context-text">{typeof right.context === 'object' ? JSON.stringify(right.context) : right.context}</p>
            </details>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConstitutionalRightsHighlighter;
