import React from 'react';
import './SearchResultsPage.css';

interface Hit {
    document_id: number;
    file_name: string;
    case_number?: string;
    court?: string;
    year?: number;
    score: number;
    highlights: Record<string, string[]>;
    rights_articles: string[];
    executive_summary: string;
}

interface Props {
    results: {
        hits: Hit[];
        total: number;
        page: number;
        page_size: number;
        error?: string;
    };
    onPageChange: (page: number) => void;
}

const SearchResultsPage: React.FC<Props> = ({ results, onPageChange }) => {
    const totalPages = Math.ceil(results.total / results.page_size);

    if (results.error) {
        return (
            <div className="sr-error">
                ⚠️ {results.error}
                {results.error.includes('not available') && (
                    <div className="sr-es-hint">
                        Start Elasticsearch: <code>docker run -p 9200:9200 elasticsearch:8.11.0</code>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="sr-root">
            <div className="sr-summary">
                {results.total === 0
                    ? 'No results found. Try different keywords or fewer filters.'
                    : `${results.total.toLocaleString()} result${results.total !== 1 ? 's' : ''} (page ${results.page} of ${totalPages})`
                }
            </div>

            <div className="sr-list">
                {results.hits.map(hit => (
                    <div key={hit.document_id} className="sr-card">
                        <div className="sr-card-header">
                            <div>
                                <div className="sr-case-name">{hit.file_name}</div>
                                <div className="sr-meta">
                                    {hit.court && <span className="sr-chip court">{hit.court}</span>}
                                    {hit.year && <span className="sr-chip year">{hit.year}</span>}
                                    {hit.case_number && <span className="sr-chip case">{hit.case_number}</span>}
                                </div>
                            </div>
                            <div className="sr-score">Score: {hit.score}</div>
                        </div>

                        {/* Rights articles */}
                        {hit.rights_articles.length > 0 && (
                            <div className="sr-articles">
                                {hit.rights_articles.map(a => (
                                    <span key={a} className="sr-article-badge">Art. {a}</span>
                                ))}
                            </div>
                        )}

                        {/* Highlighted text snippets */}
                        {hit.highlights && Object.values(hit.highlights).flat().length > 0 && (
                            <div className="sr-highlights">
                                {Object.values(hit.highlights).flat().slice(0, 2).map((hl, i) => (
                                    <div
                                        key={i}
                                        className="sr-highlight"
                                        dangerouslySetInnerHTML={{ __html: `...${hl}...` }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Executive summary fallback */}
                        {(!hit.highlights || Object.values(hit.highlights).flat().length === 0)
                            && hit.executive_summary && (
                                <div className="sr-summary-text">{hit.executive_summary}</div>
                            )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="sr-pagination">
                    <button
                        className="sr-page-btn"
                        disabled={results.page <= 1}
                        onClick={() => onPageChange(results.page - 1)}
                    >
                        ← Prev
                    </button>
                    <span className="sr-page-info">Page {results.page} / {totalPages}</span>
                    <button
                        className="sr-page-btn"
                        disabled={results.page >= totalPages}
                        onClick={() => onPageChange(results.page + 1)}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;
