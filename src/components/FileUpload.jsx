import React, { useState, useRef } from 'react';

export default function FileUpload({ onUpload, label = 'Upload PDF Contract', compact = false }){
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if(!file){ setError('Please select a PDF file first'); return; }
    try{
      setLoading(true);
      await onUpload(file);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }catch(err){ 
      setError(err.message || 'Upload failed'); 
    }
    finally{ setLoading(false); }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <input 
          ref={fileInputRef}
          type="file" 
          accept="application/pdf" 
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {label}
        </button>
        {file && (
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-sm text-stone-700 font-medium truncate flex-1">{file.name}</span>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="ml-3 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        )}
        {error && (
          <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        ref={fileInputRef}
        type="file" 
        accept="application/pdf" 
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {!file ? (
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={loading}
          className="w-full bg-white border-3 border-dashed border-amber-400 hover:border-orange-500 hover:bg-amber-50 rounded-2xl p-12 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-stone-800 mb-1">Click to Select PDF Contract</p>
              <p className="text-sm text-gray-600">or drag and drop your file here</p>
            </div>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-600 font-semibold mb-1">Selected File:</p>
                <p className="text-lg font-bold text-stone-800 truncate">{file.name}</p>
                <p className="text-xs text-stone-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={triggerFileInput}
                className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
              >
                Change
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Analyzing Contract...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Start Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-red-800 font-bold text-sm">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
    </form>
  );
}
