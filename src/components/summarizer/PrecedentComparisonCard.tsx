import React, { useState } from 'react';
import './PrecedentComparisonCard.css';

interface Props {
    caseData: {
        document_id: number;
        case_name: string;
        case_number?: string;
        court?: string;
        year?: string;
        similarity_score: number;
        weighted_score: number;
        court_weight: number;
        binding: boolean;
        authority_type: string;
        shared_constitutional_articles: string[];
        matching_sections: string[];
        section_snippets: Record<string, string>;
        match_count: number;
        recency?: number;
    };
    rank: number;
}

const SECTION_COLORS: Record<string, string> = {
    ISSUES: '#dc2626', REASONING: '#2563eb', JUDGMENT: '#16a34a',
    LEGAL_ANALYSIS: '#7c3aed', FACTS: '#d97706', ORDERS: '#0891b2', OTHER: '#64748b',
};

const PrecedentComparisonCard: React.FC<Props> = ({ caseData, rank }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`precedent-card ${caseData.binding ? 'binding' : 'persuasive'}`}>
            <div className="precedent-card-header">
                <div className="precedent-rank">#{rank}</div>
                <div className="precedent-info">
                    <div className="precedent-name">{caseData.case_name}</div>
                    <div className="precedent-meta">
                        {caseData.court && <span className="pcard-chip court">{caseData.court}</span>}
                        {caseData.year && <span className="pcard-chip year">{caseData.year}</span>}
                        <span className={`pcard-chip authority ${caseData.binding ? 'binding' : 'persuasive'}`}>
                            {caseData.authority_type}
                        </span>
                    </div>
                </div>
                <div className="precedent-score-block">
                    <div className="precedent-sim">{caseData.similarity_score}%</div>
                    <div className="precedent-sim-label">similarity</div>
                </div>
            </div>

            {/* Score bars */}
            <div className="precedent-bars">
                <div className="pbar-row">
                    <span>Semantic similarity</span>
                    <div className="pbar-outer"><div className="pbar-inner" style={{ width: `${caseData.similarity_score}%`, background: '#2563eb' }} /></div>
                    <span>{caseData.similarity_score}%</span>
                </div>
                <div className="pbar-row">
                    <span>Court weight</span>
                    <div className="pbar-outer"><div className="pbar-inner" style={{ width: `${caseData.court_weight}%`, background: '#16a34a' }} /></div>
                    <span>{caseData.court_weight}%</span>
                </div>
                <div className="pbar-row">
                    <span>Weighted score</span>
                    <div className="pbar-outer"><div className="pbar-inner" style={{ width: `${caseData.weighted_score}%`, background: '#7c3aed' }} /></div>
                    <span>{caseData.weighted_score}%</span>
                </div>
            </div>

            {/* Matching sections */}
            {caseData.matching_sections.length > 0 && (
                <div className="precedent-sections">
                    <span className="precedent-sections-label">Matching sections:</span>
                    {caseData.matching_sections.map(sec => (
                        <span key={sec} className="sec-badge" style={{ background: SECTION_COLORS[sec] || '#64748b' }}>
                            {sec}
                        </span>
                    ))}
                </div>
            )}

            {/* Constitutional articles */}
            {caseData.shared_constitutional_articles.length > 0 && (
                <div className="precedent-articles">
                    <span className="precedent-articles-label">Constitutional articles:</span>
                    {caseData.shared_constitutional_articles.map(a => (
                        <span key={a} className="article-badge">Art. {a}</span>
                    ))}
                </div>
            )}

            {/* Expand snippets */}
            {Object.keys(caseData.section_snippets || {}).length > 0 && (
                <>
                    <button className="precedent-expand-btn" onClick={() => setExpanded(!expanded)}>
                        {expanded ? '▼ Hide reasoning comparison' : '▶ Show reasoning comparison'}
                    </button>
                    {expanded && (
                        <div className="precedent-snippets">
                            {Object.entries(caseData.section_snippets).map(([sec, text]) => (
                                <div key={sec} className="snippet-block">
                                    <div className="snippet-sec" style={{ color: SECTION_COLORS[sec] || '#64748b' }}>{sec}</div>
                                    <div className="snippet-text">{text}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PrecedentComparisonCard;
