import React, { useState } from "react";
import { 
  ClipboardDocumentListIcon, 
  DocumentTextIcon, 
  BookOpenIcon 
} from '@heroicons/react/24/outline';
import { BACKEND_BASE } from '../../config/api';
import "./MultiLevelSummary.css";


interface SectionSummary {
  summary: string;
  word_count: number;
  sentence_count?: number;
  original_word_count?: number;
  citations?: string[];
}

interface SummaryData {
  summary: string;
  type: string;
  word_count: number;
  target_range: string;
  citations?: string[];
  section_summaries?: { [key: string]: SectionSummary };
}

interface PlainLanguageData {
  plain_summary: string;
  terms_simplified: number;
}

interface MultiLevelSummaryProps {
  documentId: number;
  documentName?: string;
}

type SummaryLevel = "executive" | "detailed" | "sections";

const MultiLevelSummary: React.FC<MultiLevelSummaryProps> = ({
  documentId,
  documentName,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<SummaryLevel>("executive");
  const [plainLanguage, setPlainLanguage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [executiveSummary, setExecutiveSummary] = useState<SummaryData | null>(
    null
  );
  const [detailedSummary, setDetailedSummary] = useState<SummaryData | null>(
    null
  );
  const [sectionSummaries, setSectionSummaries] = useState<{
    [key: string]: SectionSummary;
  } | null>(null);

  const [plainExecutive, setPlainExecutive] =
    useState<PlainLanguageData | null>(null);
  const [plainDetailed, setPlainDetailed] = useState<PlainLanguageData | null>(
    null
  );
  const [glossary, setGlossary] = useState<
    Array<{ term: string; definition: string; occurrences: number }>
  >([]);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);
  const [summarySource, setSummarySource] = useState<string | null>(null);

  const fetchSummaries = async (includePlain: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_BASE}/api/analysis/summarize/multi-level/${documentId}?include_plain_language=${includePlain}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch summaries: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.summaries) {
        setExecutiveSummary(data.summaries.executive);
        setDetailedSummary(data.summaries.detailed);
        setSectionSummaries(data.summaries.section_specific);
        setUsingFallback(!!data.using_fallback);
        setSummarySource(data.summary_source ?? null);

        if (includePlain && data.summaries.plain_language) {
          setPlainExecutive(data.summaries.plain_language.executive);
          setPlainDetailed(data.summaries.plain_language.detailed);
          setGlossary(data.summaries.plain_language.glossary || []);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load summaries");
      console.error("Summary fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSummaries(plainLanguage);
  }, [documentId, plainLanguage]);

  const handleLevelChange = (level: SummaryLevel) => {
    setSelectedLevel(level);
  };

  const handlePlainLanguageToggle = () => {
    setPlainLanguage(!plainLanguage);
  };

  const renderExecutiveSummary = () => {
    if (!executiveSummary) return <p>No executive summary available</p>;

    const summary =
      plainLanguage && plainExecutive
        ? plainExecutive.plain_summary
        : executiveSummary.summary;

    return (
      <div className="summary-content">
        <div className="summary-header">
          <h3>
            <ClipboardDocumentListIcon className="w-6 h-6 inline-block mr-2" style={{verticalAlign: 'middle'}} />
            Executive Summary
          </h3>
          <div className="summary-meta">
            <span className="word-count">
              {executiveSummary.word_count} words
            </span>
            <span className="target-range">
              {executiveSummary.target_range}
            </span>
            {plainLanguage && glossary.length > 0 && (
              <span className="terms-simplified">
                ✓ {glossary.length} terms simplified
              </span>
            )}
          </div>
        </div>
        <div className="summary-text">{summary || "No summary available"}</div>
        {executiveSummary.citations &&
          executiveSummary.citations.length > 0 && (
            <div className="citations">
              <strong>Citations:</strong>{" "}
              {executiveSummary.citations.join(", ")}
            </div>
          )}
      </div>
    );
  };

  /** Parse detailed summary into sections by **LABEL:** or plain "LABEL:" headers so both API and fallback show section-wise */
  const parseDetailedSummarySections = (text: string): Array<{ label: string; body: string }> => {
    if (!text?.trim()) return [];
    const sections: Array<{ label: string; body: string }> = [];
    const lines = text.split(/\r?\n/);
    let currentLabel: string | null = null;
    let currentBody: string[] = [];
    const reBold = /^\s*\*\*(.+?):\*\*\s*$/;
    const plainSectionLabels = /^\s*(FACTS|ISSUES|DECISION|PROCEDURAL POSTURE|PETITIONER'S ARGUMENTS|RESPONDENT'S ARGUMENTS|COURT'S ANALYSIS|REASONING|HOLDING):\s*(.*)$/i;
    const flush = () => {
      if (currentLabel !== null) {
        const body = currentBody.join("\n").replace(/\*\*/g, "").trim();
        if (body) sections.push({ label: currentLabel, body });
      }
    };
    for (const line of lines) {
      const boldMatch = line.match(reBold);
      const plainMatch = line.match(plainSectionLabels);
      if (boldMatch) {
        flush();
        currentLabel = boldMatch[1].trim();
        currentBody = [];
      } else if (plainMatch) {
        flush();
        currentLabel = plainMatch[1].trim().toUpperCase();
        currentBody = plainMatch[2].trim() ? [plainMatch[2]] : [];
      } else {
        if (currentLabel !== null) currentBody.push(line);
        else if (line.trim()) {
          currentLabel = "";
          currentBody.push(line);
        }
      }
    }
    flush();
    if (sections.length === 0 && text.trim()) sections.push({ label: "", body: text.replace(/\*\*/g, "").trim() });
    return sections;
  };

  const DETAIL_LABEL_COLORS: Record<string, string> = {
    "FACTS": "#0d9488",
    "ISSUES": "#7c3aed",
    "PROCEDURAL POSTURE": "#6d28d9",
    "PETITIONER'S ARGUMENTS": "#c2410c",
    "RESPONDENT'S ARGUMENTS": "#b45309",
    "COURT'S ANALYSIS": "#0369a1",
    "HOLDING": "#15803d",
    "REASONING": "#0f766e",
    "DECISION": "#15803d",
  };

  const renderDetailedSummary = () => {
    if (!detailedSummary) return <p>No detailed summary available</p>;

    const summary =
      plainLanguage && plainDetailed
        ? plainDetailed.plain_summary
        : detailedSummary.summary;

    const sections = parseDetailedSummarySections(summary || "");

    return (
      <div className="summary-content">
        <div className="summary-header">
          <h3>
            <DocumentTextIcon className="w-6 h-6 inline-block mr-2" style={{verticalAlign: 'middle'}} />
            Detailed Summary
          </h3>
          <div className="summary-meta">
            <span className="word-count">
              {detailedSummary.word_count} words
            </span>
            <span className="target-range">{detailedSummary.target_range}</span>
            {plainLanguage && glossary.length > 0 && (
              <span className="terms-simplified">
                ✓ {glossary.length} terms simplified
              </span>
            )}
          </div>
        </div>
        <div className="summary-text detailed">
          {sections.length > 0 ? (
            <div className="detailed-summary-sections">
              {sections.map(({ label, body }, i) => (
                <div key={i} className="detailed-summary-section">
                  {label && (
                    <div
                      className="detailed-summary-section__label"
                      style={{
                        color: DETAIL_LABEL_COLORS[label.toUpperCase()] || "#374151",
                        borderLeftColor: DETAIL_LABEL_COLORS[label.toUpperCase()] || "#374151",
                      }}
                    >
                      {label}
                    </div>
                  )}
                  <div className="detailed-summary-section__body">{body}</div>
                </div>
              ))}
            </div>
          ) : (
            (summary || "No summary available").replace(/\*\*/g, "")
          )}
        </div>
        {detailedSummary.citations && detailedSummary.citations.length > 0 && (
          <div className="citations">
            <strong>Citations:</strong> {detailedSummary.citations.join(", ")}
          </div>
        )}
      </div>
    );
  };

  const renderSectionSummaries = () => {
    if (!sectionSummaries || Object.keys(sectionSummaries).length === 0) {
      return <p>No section summaries available</p>;
    }

    const sectionOrder = [
      "Case Identification",
      "Statutory Provisions",
      "Legal Issue",
      "Facts",
      "Procedural History",
      "Arguments",
      "Court’s Reasoning",
      "Decision / Holding",
      "Rule of Law",
      "Key Takeaways"
    ];
    const sortedSections = Object.keys(sectionSummaries).sort((a, b) => {
      const indexA = sectionOrder.indexOf(a);
      const indexB = sectionOrder.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    return (
      <div className="summary-content sections">
        <div className="summary-header">
          <h3>📂 Section-Specific Summaries</h3>
        </div>
        <div className="section-summaries-grid">
          {sortedSections.map((section) => {
            const sectionData = sectionSummaries[section];
            return (
              <div key={section} className="section-summary-card">
                <div className="section-header">
                  <h4>{section.replace(/_/g, " ")}</h4>
                  <span className="section-word-count">
                    {sectionData.word_count} words
                  </span>
                </div>
                <div className="section-text">
                  {sectionData.summary || "No summary available"}
                </div>
                {sectionData.citations && sectionData.citations.length > 0 && (
                  <div className="section-citations">
                    <strong>Citations:</strong>{" "}
                    {sectionData.citations.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGlossary = () => {
    if (!plainLanguage || glossary.length === 0) return null;
    // Show all glossary terms (no artificial limit) so users see every simplified term
    const totalTerms = glossary.length;

    return (
      <div className="glossary-panel">
        <h4>
          <BookOpenIcon className="w-5 h-5 inline-block mr-2" style={{verticalAlign: 'middle'}} />
          Legal Terms Glossary
          <span className="glossary-count"> ({totalTerms} term{totalTerms !== 1 ? "s" : ""})</span>
        </h4>
        <div className="glossary-list">
          {glossary.map((entry, index) => (
            <div key={index} className="glossary-item">
              <span className="glossary-term">{entry.term}</span>
              <span className="glossary-arrow">→</span>
              <span className="glossary-definition">{entry.definition}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="multi-level-summary">
      <div className="summary-controls">
        <div className="level-selector">
          <button
            className={`level-btn ${
              selectedLevel === "executive" ? "active" : ""
            }`}
            onClick={() => handleLevelChange("executive")}
          >
            <ClipboardDocumentListIcon className="w-5 h-5 inline-block mr-1" />
            Executive
          </button>
          <button
            className={`level-btn ${
              selectedLevel === "detailed" ? "active" : ""
            }`}
            onClick={() => handleLevelChange("detailed")}
          >
            <DocumentTextIcon className="w-5 h-5 inline-block mr-1" />
            Detailed
          </button>
          <button
            className={`level-btn ${
              selectedLevel === "sections" ? "active" : ""
            }`}
            onClick={() => handleLevelChange("sections")}
          >
            📂 Sections
          </button>
        </div>

        <div className="plain-language-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={plainLanguage}
              onChange={handlePlainLanguageToggle}
            />
            <span className="toggle-text">🗣️ Plain Language</span>
          </label>
        </div>
      </div>

      {loading && (
        <div className="summary-loading">
          <div className="spinner"></div>
          <p>Generating summaries...</p>
        </div>
      )}

      {error && (
        <div className="summary-error">
          <p>Error: {error}</p>
          <button onClick={() => fetchSummaries(plainLanguage)}>Retry</button>
        </div>
      )}

      {!loading && !error && summarySource && (
        <div className="summary-source-badge" title="How this summary was generated">
          Source: {summarySource === "llm" ? "AI (OpenAI/Google)" : summarySource === "flan_t5" ? "AI (local FLAN-T5)" : summarySource === "regex_fallback" ? "Fallback (API failed)" : "Fallback (extractive)"}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="summary-display">
            {selectedLevel === "executive" && renderExecutiveSummary()}
            {selectedLevel === "detailed" && renderDetailedSummary()}
            {selectedLevel === "sections" && renderSectionSummaries()}
          </div>

          {renderGlossary()}
        </>
      )}
    </div>
  );
};

export default MultiLevelSummary;
