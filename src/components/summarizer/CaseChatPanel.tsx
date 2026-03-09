import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API from '../../config/api';
import './CaseChatPanel.css';

const API_BASE = API.RAG;

interface Message {
    role: 'user' | 'assistant';
    text: string;
    chunks?: any[];
}

interface Props {
    documentId: number;
    caseName: string;
    onClose: () => void;
}

const CaseChatPanel: React.FC<Props> = ({ documentId, caseName, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            text: `I can answer questions about **${caseName}** using the retrieved case text. Ask me anything about the facts, legal issues, constitutional rights, or outcome.`,
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedChunks, setExpandedChunks] = useState<number | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async () => {
        const question = input.trim();
        if (!question || loading) return;

        setMessages(prev => [...prev, { role: 'user', text: question }]);
        setInput('');
        setLoading(true);

        try {
            const resp = await axios.post(`${API_BASE}/chat`, {
                doc_id: documentId,
                question,
                top_k: 5,
            });
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    text: resp.data.answer,
                    chunks: resp.data.retrieved_chunks,
                },
            ]);
        } catch (e: any) {
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    text: `Error: ${e.response?.data?.detail || 'Failed to get answer. Is the backend running?'}`,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const EXAMPLE_QUESTIONS = [
        'What was the main legal issue?',
        'What did the court hold?',
        'Which constitutional articles were cited?',
        'Who were the parties?',
    ];

    return (
        <div className="chat-overlay">
            <div className="chat-panel">
                {/* Header */}
                <div className="chat-header">
                    <div>
                        <div className="chat-header-title">💬 Case Q&A</div>
                        <div className="chat-header-sub" title={caseName}>
                            {caseName.length > 40 ? caseName.slice(0, 40) + '...' : caseName}
                        </div>
                    </div>
                    <button className="chat-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-msg ${msg.role}`}>
                            <div className="chat-msg-bubble">{msg.text}</div>
                            {msg.chunks && msg.chunks.length > 0 && (
                                <button
                                    className="chat-sources-btn"
                                    onClick={() => setExpandedChunks(expandedChunks === i ? null : i)}
                                >
                                    {expandedChunks === i ? '▼ Hide sources' : `▶ ${msg.chunks.length} source chunk${msg.chunks.length > 1 ? 's' : ''}`}
                                </button>
                            )}
                            {expandedChunks === i && msg.chunks && (
                                <div className="chat-sources">
                                    {msg.chunks.map((chunk: any, ci: number) => (
                                        <div key={ci} className="chat-source-chunk">
                                            <div className="chat-source-meta">
                                                <span className="chat-section-badge">{chunk.section_type}</span>
                                                <span className="chat-sim">{(chunk.similarity * 100).toFixed(0)}% match</span>
                                            </div>
                                            <div className="chat-source-text">{chunk.text.slice(0, 200)}...</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-msg assistant">
                            <div className="chat-msg-bubble chat-typing">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Example questions */}
                {messages.length <= 1 && (
                    <div className="chat-examples">
                        {EXAMPLE_QUESTIONS.map((q, i) => (
                            <button key={i} className="chat-example-btn" onClick={() => { setInput(q); }}>
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="chat-input-row">
                    <input
                        className="chat-input"
                        value={input}
                        placeholder="Ask about this case..."
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && send()}
                        disabled={loading}
                    />
                    <button className="chat-send-btn" onClick={send} disabled={loading || !input.trim()}>
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CaseChatPanel;
