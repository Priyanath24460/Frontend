import React, { useState } from 'react';

export default function FileUpload({ onUpload, label = 'Upload PDF Contract' }){
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
    <form onSubmit={handleSubmit} className="card">
      <h2>{label}</h2>
      <input className="input" type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      <div style={{marginTop:12, display:'flex', gap:8}}>
        <button className="button" type="submit" disabled={loading}>{loading? 'Uploading...' : 'Analyze'}</button>
        {error && <span className="error">{error}</span>}
      </div>
    </form>
  );
}
