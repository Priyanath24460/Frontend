/**
 * Constitutional tab: single source of truth from GET /api/analysis/constitutional/{document_id}.
 * Displays fundamental rights and constitutional articles with exact text from
 * processed_constitutions.json (100% accurate for SLR/NLR uploads).
 */
import React, { useState, useEffect } from "react";
import { ScaleIcon, BookOpenIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { BACKEND_BASE } from "../../config/api";
import "./ConstitutionalTab.css";

export interface FundamentalRightItem {
  id?: number;
  article_number: string;
  matched_text: string;
  explanation_en?: string | null;
  explanation_si?: string | null;
  explanation_ta?: string | null;
  constitution_provision_text?: string[];
  constitution_source_documents?: string[];
}

export interface ConstitutionalArticleItem {
  article_number: string;
  article_title?: string;
  matched_text?: string;
  context?: string;
  method?: string;
  score?: number;
  explanation?: string;
  constitution_provision_text?: string[];
  constitution_source_documents?: string[];
}

export interface ConstitutionalApiResponse {
  document_id: number;
  file_name?: string;
  court?: string;
  year?: number;
  has_constitutional_issues: boolean;
  fundamental_rights: FundamentalRightItem[];
  constitutional_articles: ConstitutionalArticleItem[];
  constitutional_analysis?: string | null;
  matched_articles?: Array<{ article_number: string; title?: string; similarity?: number; matched_text?: string }>;
}

interface ConstitutionalTabProps {
  documentId: number;
}

const ConstitutionalTab: React.FC<ConstitutionalTabProps> = ({ documentId }) => {
  const [data, setData] = useState<ConstitutionalApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_BASE}/api/analysis/constitutional/${documentId}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText || "Failed to load constitutional data");
        return res.json();
      })
      .then((json: ConstitutionalApiResponse) => {
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Network error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  if (loading) {
    return (
      <div className="const-tab const-tab--loading">
        <div className="const-tab__spinner" aria-hidden />
        <p className="const-tab__loading-text">Loading constitutional analysis…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="const-tab const-tab--error">
        <p className="const-tab__error-text">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="const-tab const-tab--empty">
        <p>No data available.</p>
      </div>
    );
  }

  const hasRights = data.fundamental_rights?.length > 0;
  const hasArticles = data.constitutional_articles?.length > 0;
  const hasAnalysis = !!data.constitutional_analysis?.trim();

  if (!data.has_constitutional_issues && !hasRights && !hasArticles && !hasAnalysis) {
    return (
      <div className="const-tab const-tab--empty">
        <div className="const-tab__empty-icon">⚖️</div>
        <h3 className="const-tab__empty-title">No constitutional issues detected</h3>
        <p className="const-tab__empty-desc">
          This document does not reference fundamental rights (Articles 10–18) or other constitutional provisions in our corpus.
        </p>
      </div>
    );
  }

  const analysisText = (data.constitutional_analysis ?? "").trim();
  const isQuotaOrErrorNotice =
    analysisText.includes("quota") ||
    analysisText.includes("could not be generated") ||
    analysisText.includes("try again later");

  return (
    <div className="const-tab">
      {hasAnalysis && (
        <section className="const-tab__section const-tab__analysis">
          <h2 className="const-tab__section-title">
            <DocumentTextIcon className="const-tab__icon" />
            Constitutional analysis
          </h2>
          {isQuotaOrErrorNotice ? (
            <div className="const-tab__notice const-tab__notice--warning" role="alert">
              <p className="const-tab__notice-title">Temporarily unavailable</p>
              <p>{analysisText}</p>
            </div>
          ) : (
            <div className="const-tab__analysis-body">
              {analysisText.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </section>
      )}

      {hasRights && (
        <section className="const-tab__section">
          <h2 className="const-tab__section-title">
            <ScaleIcon className="const-tab__icon" />
            Fundamental rights (Articles 10–18)
          </h2>
          <p className="const-tab__section-desc">
            Provisions from Chapter III of the Constitution of Sri Lanka, with exact text from the official corpus.
          </p>
          <ul className="const-tab__list">
            {data.fundamental_rights.map((right, idx) => (
              <li key={right.id ?? idx} className="const-tab__card const-tab__card--right">
                <header className="const-tab__card-header">
                  <span className="const-tab__article-num">Article {right.article_number}</span>
                  <span className="const-tab__badge const-tab__badge--fr">Fundamental right</span>
                </header>
                {right.matched_text && (
                  <div className="const-tab__matched">
                    <span className="const-tab__label">Cited in document:</span>
                    <blockquote className="const-tab__quote">"{right.matched_text}"</blockquote>
                  </div>
                )}
                {(right.constitution_provision_text?.length ?? 0) > 0 && (
                  <div className="const-tab__provision">
                    <span className="const-tab__label">Constitution text (source of truth):</span>
                    {right.constitution_provision_text!.map((text, i) => (
                      <blockquote key={i} className="const-tab__constitution-quote">
                        {text}
                      </blockquote>
                    ))}
                    {(right.constitution_source_documents?.length ?? 0) > 0 && (
                      <p className="const-tab__source">
                        Source: {right.constitution_source_documents!.join(", ")}
                      </p>
                    )}
                  </div>
                )}
                {right.explanation_en && (
                  <p className="const-tab__explanation">{right.explanation_en}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasArticles && (
        <section className="const-tab__section">
          <h2 className="const-tab__section-title">
            <BookOpenIcon className="const-tab__icon" />
            Other constitutional provisions
          </h2>
          <p className="const-tab__section-desc">
            Additional articles cited in the case, with exact text from the constitution corpus.
          </p>
          <ul className="const-tab__list">
            {data.constitutional_articles.map((art, idx) => (
              <li key={idx} className="const-tab__card">
                <header className="const-tab__card-header">
                  <span className="const-tab__article-num">Article {art.article_number}</span>
                  {art.article_title && (
                    <span className="const-tab__article-title">{art.article_title}</span>
                  )}
                  <span className={`const-tab__badge const-tab__badge--${art.method === "explicit_mention" ? "explicit" : "semantic"}`}>
                    {art.method === "explicit_mention" ? "Explicit cite" : "Semantic"}
                  </span>
                  {art.score != null && art.method !== "explicit_mention" && (
                    <span className="const-tab__score">{(art.score * 100).toFixed(0)}% match</span>
                  )}
                </header>
                {art.matched_text && (
                  <div className="const-tab__matched">
                    <span className="const-tab__label">Cited in document:</span>
                    <blockquote className="const-tab__quote">"{art.matched_text}"</blockquote>
                  </div>
                )}
                {(art.constitution_provision_text?.length ?? 0) > 0 && (
                  <div className="const-tab__provision">
                    <span className="const-tab__label">Constitution text (source of truth):</span>
                    {art.constitution_provision_text!.map((text, i) => (
                      <blockquote key={i} className="const-tab__constitution-quote">
                        {text}
                      </blockquote>
                    ))}
                    {(art.constitution_source_documents?.length ?? 0) > 0 && (
                      <p className="const-tab__source">
                        Source: {art.constitution_source_documents!.join(", ")}
                      </p>
                    )}
                  </div>
                )}
                {art.explanation && (
                  <p className="const-tab__explanation">{art.explanation}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ConstitutionalTab;
