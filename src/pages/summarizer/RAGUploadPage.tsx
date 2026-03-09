import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../config/api';
import RAGResultsPage from './RAGResultsPage';
import './RAGUploadPage.css';

const API_BASE = API.RAG;


const STAGES = [
  { key: 'queued', label: 'Queued', icon: '📋', pct: 0 },
  { key: 'chunking', label: 'Chunking Document', icon: '✂️', pct: 25 },
  { key: 'embedding', label: 'Generating Embeddings', icon: '🔢', pct: 60 },
  { key: 'indexing', label: 'Indexing', icon: '📑', pct: 90 },
  { key: 'done', label: 'Complete', icon: '✅', pct: 100 },
];

function getStageIndex(progress: number): number {
  if (progress >= 100) return 4;
  if (progress >= 80) return 3;
  if (progress >= 50) return 2;
  if (progress >= 10) return 1;
  return 0;
}

interface JobStatus {
  job_id: number;
  document_id: number;
  status: string;
  progress: number;
  current_stage: string;
  chunk_count: number;
}

const RAGUploadPage: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  // Poll status
  useEffect(() => {
    if (!jobStatus || jobStatus.status === 'DONE' || jobStatus.status === 'FAILED') return;

    const interval = setInterval(async () => {
      try {
        const resp = await axios.get<JobStatus>(`${API_BASE}/process/${jobStatus.job_id}`);
        setJobStatus(resp.data);
        if (resp.data.status === 'DONE') {
          setDocumentId(resp.data.document_id);
          setDone(true);
          clearInterval(interval);
        }
        if (resp.data.status === 'FAILED') {
          setError(resp.data.current_stage || 'Processing failed');
          clearInterval(interval);
        }
      } catch { /* keep polling */ }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobStatus?.job_id, jobStatus?.status]);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported');
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const form = new FormData();
    form.append('file', file);

    try {
      const resp = await axios.post(`${API_BASE}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setJobStatus({
        job_id: resp.data.job_id,
        document_id: resp.data.document_id,
        status: 'PENDING',
        progress: 0,
        current_stage: 'Queued',
        chunk_count: 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Is the backend running?');
      setUploading(false);
    }
  };

  // Show results when done
  if (done && documentId) {
    return <RAGResultsPage documentId={documentId} />;
  }

  const stageIdx = jobStatus ? getStageIndex(jobStatus.progress) : -1;

  return (
    <div className="rag-upload-root">
      <div className="rag-upload-header">
        <div className="rag-upload-badge">RAG PIPELINE</div>
        <h1>Legal Document Analysis</h1>
        <p>Upload a Sri Lankan legal judgment (NLR/SLR) for AI-powered analysis</p>
      </div>

      {!uploading && !jobStatus && (
        <div
          className={`rag-dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('rag-file-input')?.click()}
        >
          <input
            id="rag-file-input"
            type="file"
            accept=".pdf"
            hidden
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="rag-dropzone-icon">{file ? '📄' : '⬆️'}</div>
          {file ? (
            <>
              <div className="rag-dropzone-filename">{file.name}</div>
              <div className="rag-dropzone-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </>
          ) : (
            <>
              <div className="rag-dropzone-text">Drag & drop a PDF here</div>
              <div className="rag-dropzone-sub">or click to browse files</div>
            </>
          )}
        </div>
      )}

      {error && <div className="rag-error">⚠️ {error}</div>}

      {file && !uploading && !jobStatus && (
        <button className="rag-upload-btn" onClick={handleUpload}>
          🚀 Start Analysis
        </button>
      )}

      {/* Progress UI */}
      {jobStatus && (
        <div className="rag-progress-card">
          <div className="rag-progress-title">
            Processing: <span>{file?.name}</span>
          </div>

          <div className="rag-progress-bar-outer">
            <div
              className="rag-progress-bar-inner"
              style={{ width: `${jobStatus.progress}%` }}
            />
          </div>
          <div className="rag-progress-pct">{jobStatus.progress}%</div>

          <div className="rag-stages">
            {STAGES.map((stage, i) => (
              <div
                key={stage.key}
                className={`rag-stage ${i < stageIdx ? 'done' : ''} ${i === stageIdx ? 'active' : ''}`}
              >
                <div className="rag-stage-icon">{stage.icon}</div>
                <div className="rag-stage-label">{stage.label}</div>
              </div>
            ))}
          </div>

          <div className="rag-progress-stage-text">{jobStatus.current_stage}</div>

          {jobStatus.chunk_count > 0 && (
            <div className="rag-chunk-info">
              {jobStatus.chunk_count} text chunks created
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RAGUploadPage;
