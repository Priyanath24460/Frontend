import React from "react";
import "./ConstitutionalRightsHighlighter.css";
import { ScaleIcon, MapPinIcon, MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/react/24/outline';

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
        <h2 className="flex items-center gap-2">
          <ScaleIcon className="w-6 h-6" />
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
      <h2 className="flex items-center gap-2">
        <ScaleIcon className="w-6 h-6" />
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
              {right.article_title || `Article ${right.article}`}
            </h3>
            {right.method && (
              <span className="method-badge flex items-center gap-1">
                {right.method === "explicit_mention"
                  ? <><MapPinIcon className="w-4 h-4" /> Explicit</>
                  : <><MagnifyingGlassIcon className="w-4 h-4" /> Detected</>}
              </span>
            )}
          </div>

          <div className="matched-text">
            <strong>Matched Text:</strong>
            <p className="text-snippet">"{right.matched_text}"</p>
          </div>

          {right.explanation && (
            <details className="right-details" open>
              <summary className="flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4" />
                Explanation
              </summary>
              <p className="explanation-text">{right.explanation}</p>
            </details>
          )}

          {right.context && right.context !== right.matched_text && (
            <details className="right-details">
              <summary className="flex items-center gap-2">
                <MagnifyingGlassIcon className="w-4 h-4" />
                Context
              </summary>
              <p className="context-text">{right.context}</p>
            </details>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConstitutionalRightsHighlighter;
