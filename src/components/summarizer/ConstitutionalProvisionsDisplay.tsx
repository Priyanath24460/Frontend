import React from "react";
import { BookOpenIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import "./ConstitutionalProvisionsDisplay.css";

interface ConstitutionalProvision {
  article: string;
  matched_text: string;
  method: string;
  score: number;
  article_title?: string;
  constitutional_provision?: string;
  explanation?: string;
  context?: string;
  document?: string;
}

interface ConstitutionalProvisionsDisplayProps {
  provisions: ConstitutionalProvision[];
}

const ConstitutionalProvisionsDisplay: React.FC<
  ConstitutionalProvisionsDisplayProps
> = ({ provisions }) => {
  if (!provisions || provisions.length === 0) {
    return (
      <div className="provisions-container">
        <h2>
          <BookOpenIcon className="w-7 h-7 inline-block mr-2" style={{verticalAlign: 'middle'}} />
          Constitutional Provisions
        </h2>
        <p className="no-data">No constitutional provisions detected.</p>
      </div>
    );
  }

  // Deduplicate provisions by article number (keep highest score)
  const deduplicatedProvisions = provisions.reduce((acc, provision) => {
    const article = provision.article || "Unknown";
    if (!acc[article] || provision.score > acc[article].score) {
      acc[article] = provision;
    }
    return acc;
  }, {} as Record<string, ConstitutionalProvision>);

  const uniqueProvisions = Object.values(deduplicatedProvisions);

  return (
    <div className="provisions-container">
      <h2>
        <BookOpenIcon className="w-6 h-6 inline-block mr-2" style={{verticalAlign: 'middle'}} />
        Constitutional Provisions ({uniqueProvisions.length} unique articles
        detected)
      </h2>
      <p className="description">
        References to constitutional articles and provisions found in this case.
      </p>

      {uniqueProvisions.map((provision, idx) => (
        <div key={idx} className={`provision-box ${provision.method}`}>
          <div className="provision-header">
            <h3 className="article-title">
              {typeof provision.article_title === 'object' 
                ? (provision.article_title as any).title || JSON.stringify(provision.article_title)
                : provision.article_title || 
                  `Article ${typeof provision.article === 'object' ? (provision.article as any).article_number || JSON.stringify(provision.article) : provision.article}`
              }
            </h3>
            <div className="badges">
              <span className="method-badge">
                {provision.method === "explicit_mention"
                  ? "📌 Explicit"
                  : "Semantic"}
              </span>
              {provision.score && provision.method !== "explicit_mention" && (
                <span className="score-badge">
                  {(provision.score * 100).toFixed(0)}% match
                </span>
              )}
            </div>
          </div>

          <div className="matched-text">
            <strong>Matched Text:</strong>
            <p className="text-snippet">"{typeof provision.matched_text === 'object' ? JSON.stringify(provision.matched_text) : provision.matched_text}"</p>
          </div>

          {provision.explanation && (
            <details className="provision-details" open>
              <summary>📖 Explanation</summary>
              <p className="explanation-text">{typeof provision.explanation === 'object' ? JSON.stringify(provision.explanation) : provision.explanation}</p>
            </details>
          )}

          {provision.constitutional_provision && (
            <details className="provision-details">
              <summary>📜 Constitutional Reference</summary>
              <p className="constitution-text">
                {typeof provision.constitutional_provision === 'object' ? JSON.stringify(provision.constitutional_provision) : provision.constitutional_provision}
              </p>
              {provision.document && (
                <p className="source-doc">
                  <small>Source: {typeof provision.document === 'object' ? JSON.stringify(provision.document) : provision.document}</small>
                </p>
              )}
            </details>
          )}

          {provision.context &&
            provision.context !== provision.matched_text && (
              <details className="provision-details">
                <summary>
                  <MagnifyingGlassIcon className="w-4 h-4 inline-block mr-1" style={{verticalAlign: 'middle'}} />
                  Context
                </summary>
                <p className="context-text">{typeof provision.context === 'object' ? JSON.stringify(provision.context) : provision.context}</p>
              </details>
            )}
        </div>
      ))}
    </div>
  );
};

export default ConstitutionalProvisionsDisplay;
