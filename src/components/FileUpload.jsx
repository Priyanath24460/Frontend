import React, { useState } from 'react';

export default function FileUpload({ onUpload, label = 'Upload PDF Contract', compact = false }){
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if(!file){ setError('Please select a PDF file'); return; }
    try{
      setLoading(true);
      await onUpload(file);
    }catch(err){ setError(err.message || 'Upload failed'); }
    finally{ setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? '' : ''}>
      {!compact && <h3 className="text-sm font-semibold text-slate-900 mb-3">{label}</h3>}
      <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
        <label className="cursor-pointer flex flex-col items-center justify-center">
          <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm font-medium text-slate-700">
            {file ? file.name : 'Click to upload or drag and drop'}
          </span>
          <span className="text-xs text-slate-500 mt-1">PDF files only</span>
        </label>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={(e)=>setFile(e.target.files?.[0]||null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="mt-4 flex gap-3 items-center">
        <button 
          type="submit" 
          disabled={loading || !file}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${ 
            loading || !file 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Uploading...' : 'Analyze'}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
