import React, { useState } from 'react';
import './ConstitutionalAnalysisPanel.css';

interface ArticleMatch {
    article_number: string;
    title: string;
    explanation: string;
    similarity: number;
    matched_text: string;
    is_fundamental_right: boolean;
    occurrence_count?: number;
}

interface Props {
    data: {
        constitutional_analysis: string;
        matched_articles: ArticleMatch[];
        has_constitutional_issues: boolean;
        case_name: string;
    };
}

const ConstitutionalAnalysisPanel: React.FC<Props> = ({ data }) => {
    const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

    if (!data.has_constitutional_issues || data.matched_articles.length === 0) {
        return (
            <div className="const-empty">
                <div className="const-empty-icon">⚖️</div>
                <div>No constitutional issues detected in the retrieved case content.</div>
            </div>
        );
    }

    return (
        <div className="const-panel">
            {/* AI Analysis Text */}
            {data.constitutional_analysis && (
                <div className="const-analysis-box">
                    <div className="const-section-label">AI Constitutional Analysis</div>
                    <div className="const-analysis-text">
                        {data.constitutional_analysis.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Article cards */}
            <div className="const-section-label" style={{ marginBottom: 12 }}>
                Matched Articles ({data.matched_articles.length})
            </div>

            <div className="const-articles-grid">
                {data.matched_articles.map(article => (
                    <div
                        key={article.article_number}
                        className={`const-article-card ${article.is_fundamental_right ? 'fr' : 'proc'}`}
                    >
                        <div className="const-article-header">
                            <div>
                                <div className="const-article-number">Article {article.article_number}</div>
                                <div className="const-article-title">{article.title}</div>
                            </div>
                            <div className="const-article-sim">{(article.similarity * 100).toFixed(0)}%</div>
                        </div>

                        {article.is_fundamental_right && (
                            <span className="const-fr-badge">Fundamental Right</span>
                        )}

                        <div className="const-article-matched">
                            <span className="const-matched-label">Matched text: </span>
                            "{article.matched_text}"
                        </div>

                        <button
                            className="const-expand-btn"
                            onClick={() =>
                                setExpandedArticle(expandedArticle === article.article_number ? null : article.article_number)
                            }
                        >
                            {expandedArticle === article.article_number ? '▼ Hide article text' : '▶ View article text'}
                        </button>

                        {expandedArticle === article.article_number && (
                            <div className="const-article-explanation">{article.explanation}</div>
                        )}

                        {article.occurrence_count && article.occurrence_count > 1 && (
                            <div className="const-occurrence">Referenced in {article.occurrence_count} chunks</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConstitutionalAnalysisPanel;
