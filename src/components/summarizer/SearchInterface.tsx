import React, { useState } from 'react';
import axios from 'axios';
import { API } from '../../config/api';
import SearchResultsPage from '../../pages/summarizer/SearchResultsPage';
import './SearchInterface.css';

const API_BASE = API.SEARCH;


const COURTS = ['', 'Supreme Court', 'Court of Appeal', 'High Court', 'District Court'];
const ARTICLES = ['10', '11', '12', '13', '14', '14A', '15', '16', '17', '18'];

export interface SearchFilters {
    query: string;
    court: string;
    year_from: string;
    year_to: string;
    rights_articles: string[];
    judge: string;
}

const SearchInterface: React.FC = () => {
    const [filters, setFilters] = useState<SearchFilters>({
        query: '', court: '', year_from: '', year_to: '', rights_articles: [], judge: '',
    });
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const toggleArticle = (a: string) => {
        setFilters(prev => ({
            ...prev,
            rights_articles: prev.rights_articles.includes(a)
                ? prev.rights_articles.filter(x => x !== a)
                : [...prev.rights_articles, a],
        }));
    };

    const handleQueryChange = async (val: string) => {
        setFilters(prev => ({ ...prev, query: val }));
        if (val.length >= 3) {
            try {
                const r = await axios.get(`${API_BASE}/suggest`, { params: { prefix: val } });
                setSuggestions(r.data.suggestions || []);
            } catch { setSuggestions([]); }
        } else {
            setSuggestions([]);
        }
    };

    const handleSearch = async (page = 1) => {
        if (!filters.query.trim()) { setError('Please enter a search term'); return; }
        setLoading(true); setError(null); setSuggestions([]);
        try {
            const r = await axios.post(`${API_BASE}/documents`, {
                ...filters,
                year_from: filters.year_from ? parseInt(filters.year_from) : null,
                year_to: filters.year_to ? parseInt(filters.year_to) : null,
                page,
            });
            setResults(r.data);
        } catch (e: any) {
            const msg = e.response?.data?.detail || e.response?.data?.error || 'Search failed';
            setError(msg);
        } finally { setLoading(false); }
    };

    return (
        <div className="search-root">
            <div className="search-header">
                <h2>🔍 Legal Case Search</h2>
                <p>Full-text search over Sri Lankan legal judgments (NLR/SLR)</p>
            </div>

            {/* Main search bar */}
            <div className="search-bar-wrap">
                <div className="search-bar">
                    <input
                        className="search-input"
                        placeholder="Search cases by keyword, legal issue, or citation..."
                        value={filters.query}
                        onChange={e => handleQueryChange(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="search-btn" onClick={() => handleSearch()} disabled={loading}>
                        {loading ? '...' : '🔍 Search'}
                    </button>
                </div>
                {suggestions.length > 0 && (
                    <div className="search-suggestions">
                        {suggestions.map((s, i) => (
                            <div key={i} className="search-suggestion" onClick={() => {
                                setFilters(prev => ({ ...prev, query: s.split(' (')[0] }));
                                setSuggestions([]);
                            }}>
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button className="search-advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? '▼ Hide filters' : '▶ Advanced filters'}
            </button>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="search-filters">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Court</label>
                            <select value={filters.court} onChange={e => setFilters(prev => ({ ...prev, court: e.target.value }))}>
                                {COURTS.map(c => <option key={c} value={c}>{c || 'All courts'}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Year from</label>
                            <input type="number" placeholder="1978" value={filters.year_from}
                                onChange={e => setFilters(prev => ({ ...prev, year_from: e.target.value }))} />
                        </div>
                        <div className="filter-group">
                            <label>Year to</label>
                            <input type="number" placeholder="2024" value={filters.year_to}
                                onChange={e => setFilters(prev => ({ ...prev, year_to: e.target.value }))} />
                        </div>
                        <div className="filter-group">
                            <label>Judge name</label>
                            <input placeholder="e.g. Fernando J" value={filters.judge}
                                onChange={e => setFilters(prev => ({ ...prev, judge: e.target.value }))} />
                        </div>
                    </div>
                    <div className="filter-articles">
                        <label>Rights Articles</label>
                        <div className="filter-articles-grid">
                            {ARTICLES.map(a => (
                                <button
                                    key={a}
                                    className={`art-filter-btn ${filters.rights_articles.includes(a) ? 'selected' : ''}`}
                                    onClick={() => toggleArticle(a)}
                                >
                                    Art. {a}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="search-error">⚠️ {error}</div>}

            {/* Results */}
            {results && (
                <SearchResultsPage
                    results={results}
                    onPageChange={(page) => handleSearch(page)}
                />
            )}
        </div>
    );
};

export default SearchInterface;
