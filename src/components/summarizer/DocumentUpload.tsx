import React, { useState } from "react";
import axios from "axios";

interface DocumentUploadProps {
  onUploadSuccess: (data: any) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const uploadDocument = async () => {
    if (!file) return alert("Please select a PDF");

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading file:", file.name, "Size:", file.size);
      
      const res = await axios.post(
        "http://127.0.0.1:8000/api/documents/upload-sri-lanka",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log("Upload successful:", res.data);
      setUploading(false);
      onUploadSuccess(res.data);
      
    } catch (err: any) {
      console.error("Upload error details:", err);
      
      setUploading(false);
      
      if (err.code === 'ECONNABORTED') {
        setError("Request timed out. Please try again.");
      } else if (err.response) {
        // Server responded with error status
        console.error("Server response:", err.response.data);
        console.error("Status code:", err.response.status);
        
        // Try to extract error message from different possible response formats
        let errorMessage = "Upload failed";
        
        if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.status === 500) {
          errorMessage = "Server error (500). Check backend logs.";
        }
        
        setError(`Server Error: ${errorMessage}`);
        
      } else if (err.request) {
        // Request was made but no response received
        console.error("No response received:", err.request);
        setError("No response from server. Is the backend running?");
      } else {
        // Something else happened
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="upload-container">
      <h3>Upload Sri Lankan Legal Document</h3>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px", lineHeight: "1.6" }}>
        Only Sri Lankan Law Reports (SLR) or New Law Reports (NLR) documents are
        supported.
      </p>
      
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={handleFileChange} 
        style={{ 
          margin: "16px 0",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          width: "100%",
          fontSize: "14px"
        }}
      />
      
      <div style={{ margin: "16px 0" }}>
        {file && (
          <div style={{ 
            padding: "12px 16px", 
            backgroundColor: "#f5f5f5", 
            borderRadius: "8px",
            fontSize: "14px",
            border: "1px solid #e0e0e0"
          }}>
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>
      
      <button 
        onClick={uploadDocument} 
        disabled={uploading || !file}
        style={{
          padding: "12px 24px",
          backgroundColor: uploading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: uploading || !file ? "not-allowed" : "pointer",
          fontSize: "15px",
          fontWeight: "600",
          transition: "all 0.2s ease"
        }}
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </button>
      
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px 20px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "8px",
            color: "#c33",
            fontSize: "14px",
            lineHeight: "1.6"
          }}
        >
          <strong>Error:</strong> {error}
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#a33" }}>
            Check browser console and Django server logs for details.
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;