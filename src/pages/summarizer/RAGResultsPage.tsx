import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../../config/api';
import PrecedentComparisonCard from '../../components/summarizer/PrecedentComparisonCard';
import ConstitutionalAnalysisPanel from '../../components/summarizer/ConstitutionalAnalysisPanel';
import RetrievedChunksViewer from '../../components/summarizer/RetrievedChunksViewer';
import CaseChatPanel from '../../components/summarizer/CaseChatPanel';
import './RAGResultsPage.css';

const API_BASE = API.RAG;

type TabKey = 'summary' | 'constitutional' | 'precedents' | 'chunks';

interface Props {
    documentId: number;
}

const TABS = [
    { key: 'summary' as TabKey, label: '📄 Summary', },
    { key: 'constitutional' as TabKey, label: '⚖️ Constitutional', },
    { key: 'precedents' as TabKey, label: '🔗 Precedents', },
    { key: 'chunks' as TabKey, label: '📦 Chunks', },
];

const RAGResultsPage: React.FC<Props> = ({ documentId }) => {
    const [activeTab, setActiveTab] = useState<TabKey>('summary');
    const [summaryData, setSummaryData] = useState<any>(null);
    const [constData, setConstData] = useState<any>(null);
    const [precedentsData, setPrecedentsData] = useState<any>(null);
    const [chunksData, setChunksData] = useState<any>(null);
    const [loading, setLoading] = useState<Record<TabKey, boolean>>({
        summary: false, constitutional: false, precedents: false, chunks: false,
    });
    const [errors, setErrors] = useState<Record<TabKey, string | null>>({
        summary: null, constitutional: null, precedents: null, chunks: null,
    });
    const [chatOpen, setChatOpen] = useState(false);

    const setLoad = (tab: TabKey, v: boolean) =>
        setLoading(prev => ({ ...prev, [tab]: v }));
    const setErr = (tab: TabKey, v: string | null) =>
        setErrors(prev => ({ ...prev, [tab]: v }));

    // Lazy-load tab data
    useEffect(() => {
        if (activeTab === 'summary' && !summaryData) fetchSummary();
        if (activeTab === 'constitutional' && !constData) fetchConstitutional();
        if (activeTab === 'precedents' && !precedentsData) fetchPrecedents();
        if (activeTab === 'chunks' && !chunksData) fetchChunks();
    }, [activeTab]);

    const fetchSummary = async () => {
        setLoad('summary', true); setErr('summary', null);
        try {
            const r = await axios.get(`${API_BASE}/summarize/${documentId}`);
            setSummaryData(r.data);
        } catch (e: any) {
            setErr('summary', e.response?.data?.detail || 'Failed to load summary');
        } finally { setLoad('summary', false); }
    };

    const fetchConstitutional = async () => {
        setLoad('constitutional', true); setErr('constitutional', null);
        try {
            const r = await axios.get(`${API_BASE}/constitutional/${documentId}`);
            setConstData(r.data);
        } catch (e: any) {
            setErr('constitutional', e.response?.data?.detail || 'Failed to load constitutional analysis');
        } finally { setLoad('constitutional', false); }
    };

    const fetchPrecedents = async () => {
        setLoad('precedents', true); setErr('precedents', null);
        try {
            const r = await axios.get(`${API_BASE}/compare/${documentId}`);
            setPrecedentsData(r.data);
        } catch (e: any) {
            setErr('precedents', e.response?.data?.detail || 'Failed to load precedents');
        } finally { setLoad('precedents', false); }
    };

    const fetchChunks = async () => {
        setLoad('chunks', true); setErr('chunks', null);
        try {
            const r = await axios.post(`${API_BASE}/retrieve`, {
                query: 'legal issues facts reasoning judgment',
                doc_id: documentId,
                top_k: 10,
            });
            setChunksData(r.data);
        } catch (e: any) {
            setErr('chunks', e.response?.data?.detail || 'Failed to load chunks');
        } finally { setLoad('chunks', false); }
    };

    const isLoading = loading[activeTab];

    return (
        <div className="rag-results-root">
            {/* Header */}
            <div className="rag-results-header">
                <div className="rag-results-badge">ANALYSIS COMPLETE</div>
                <h2>{summaryData?.case_name || `Document #${documentId}`}</h2>
                <div className="rag-results-meta">
                    {summaryData?.court && <span className="rag-meta-chip court">{summaryData.court}</span>}
                    {summaryData?.year && <span className="rag-meta-chip year">{summaryData.year}</span>}
                    {summaryData?.total_chunks && (
                        <span className="rag-meta-chip chunks">{summaryData.total_chunks} chunks</span>
                    )}
                </div>
                <button className="rag-chat-btn" onClick={() => setChatOpen(true)}>
                    💬 Chat with this Case
                </button>
            </div>

            {/* Tabs */}
            <div className="rag-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`rag-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="rag-tab-content">
                {isLoading && (
                    <div className="rag-loading">
                        <div className="rag-spinner" />
                        <span>Loading {activeTab}...</span>
                    </div>
                )}

                {errors[activeTab] && (
                    <div className="rag-error">⚠️ {errors[activeTab]}</div>
                )}

                {/* Summary Tab */}
                {activeTab === 'summary' && summaryData && !isLoading && (
                    <div className="rag-summary-tab">
                        <div className="rag-summary-section">
                            <div className="rag-summary-label">Executive Summary</div>
                            <p className="rag-summary-text">{summaryData.executive_summary}</p>
                        </div>
                        <div className="rag-summary-section">
                            <div className="rag-summary-label">Detailed Analysis</div>
                            <div className="rag-summary-detailed">
                                {summaryData.detailed_summary?.split('\n').map((line: string, i: number) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                        <div className="rag-llm-mode">
                            Generated by: <strong>{summaryData.llm_mode}</strong>
                        </div>
                    </div>
                )}

                {/* Constitutional Tab */}
                {activeTab === 'constitutional' && constData && !isLoading && (
                    <ConstitutionalAnalysisPanel data={constData} />
                )}

                {/* Precedents Tab */}
                {activeTab === 'precedents' && precedentsData && !isLoading && (
                    <div className="rag-precedents-tab">
                        {precedentsData.similar_cases?.length === 0 && (
                            <div className="rag-empty">No similar cases found in the database yet. Upload more documents to enable precedent matching.</div>
                        )}
                        {precedentsData.similar_cases?.map((c: any, i: number) => (
                            <PrecedentComparisonCard key={i} caseData={c} rank={i + 1} />
                        ))}
                    </div>
                )}

                {/* Chunks Tab */}
                {activeTab === 'chunks' && chunksData && !isLoading && (
                    <RetrievedChunksViewer data={chunksData} />
                )}
            </div>

            {/* Chat Panel */}
            {chatOpen && (
                <CaseChatPanel
                    documentId={documentId}
                    caseName={summaryData?.case_name || `Document #${documentId}`}
                    onClose={() => setChatOpen(false)}
                />
            )}
        </div>
    );
};

export default RAGResultsPage;
