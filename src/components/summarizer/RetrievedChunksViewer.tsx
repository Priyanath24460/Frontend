import React, { useState } from 'react';
import './RetrievedChunksViewer.css';

const SECTION_COLORS: Record<string, string> = {
    ISSUES: '#dc2626', REASONING: '#2563eb', JUDGMENT: '#16a34a',
    LEGAL_ANALYSIS: '#7c3aed', FACTS: '#d97706', ORDERS: '#0891b2', OTHER: '#64748b',
};

interface Props {
    data: {
        query: string;
        retrieved_count: number;
        chunks: Array<{
            chunk_id: number;
            document_id: number;
            chunk_index: number;
            text: string;
            section_type: string;
            article_refs: string[];
            citation_refs: string[];
            similarity: number;
            case_name?: string;
            court?: string;
            year?: number;
        }>;
    };
}

const RetrievedChunksViewer: React.FC<Props> = ({ data }) => {
    const [expanded, setExpanded] = useState<number | null>(null);
    const [filter, setFilter] = useState<string>('ALL');

    const sections = ['ALL', ...new Set(data.chunks.map(c => c.section_type))];
    const filtered = filter === 'ALL' ? data.chunks : data.chunks.filter(c => c.section_type === filter);

    return (
        <div className="chunks-viewer">
            <div className="chunks-header">
                <div className="chunks-count">{data.retrieved_count} chunks retrieved</div>
                <div className="chunks-filters">
                    {sections.map(s => (
                        <button
                            key={s}
                            className={`chunks-filter-btn ${filter === s ? 'active' : ''}`}
                            style={filter === s && s !== 'ALL' ? { background: SECTION_COLORS[s], color: '#fff' } : {}}
                            onClick={() => setFilter(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chunks-list">
                {filtered.map((chunk, i) => (
                    <div key={chunk.chunk_id} className="chunk-card">
                        <div className="chunk-card-header">
                            <div className="chunk-meta">
                                <span
                                    className="chunk-section-badge"
                                    style={{ background: SECTION_COLORS[chunk.section_type] || '#64748b' }}
                                >
                                    {chunk.section_type}
                                </span>
                                <span className="chunk-idx">Chunk #{chunk.chunk_index}</span>
                                {chunk.case_name && (
                                    <span className="chunk-case">{chunk.case_name.slice(0, 35)}…</span>
                                )}
                            </div>
                            <div className="chunk-sim-badge">{(chunk.similarity * 100).toFixed(1)}%</div>
                        </div>

                        <div className="chunk-text">
                            {expanded === i ? chunk.text : chunk.text.slice(0, 200) + (chunk.text.length > 200 ? '...' : '')}
                        </div>

                        {chunk.text.length > 200 && (
                            <button className="chunk-expand-btn" onClick={() => setExpanded(expanded === i ? null : i)}>
                                {expanded === i ? 'Show less' : 'Show full text'}
                            </button>
                        )}

                        {(chunk.article_refs.length > 0 || chunk.citation_refs.length > 0) && (
                            <div className="chunk-refs">
                                {chunk.article_refs.map(a => (
                                    <span key={a} className="chunk-ref art">Art.{a}</span>
                                ))}
                                {chunk.citation_refs.slice(0, 2).map((c, ci) => (
                                    <span key={ci} className="chunk-ref cit">{c.slice(0, 30)}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="chunks-empty">No chunks for this section filter.</div>
                )}
            </div>
        </div>
    );
};

export default RetrievedChunksViewer;
