import React, { useState } from "react";
import axios from "axios";
import { BACKEND_BASE } from "../../config/api";

import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface DocumentUploadProps {
  onUploadSuccess: (data: any) => void;
}

const DocumentUploadMUI: React.FC<DocumentUploadProps> = ({
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const uploadDocument = async () => {
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${BACKEND_BASE}/api/documents/upload-sri-lanka`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 900000, // 15 minutes — first-time server may download AI models (~1.6GB)
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1),
            );
            setUploadProgress(percentCompleted);
          },
        },
      );

      console.log("Upload successful:", response.data);
      setUploadProgress(100);
      onUploadSuccess(response.data);

      // Reset after success
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
      }, 2000);
    } catch (err: any) {
      console.error("Upload error:", err);

      if (err.code === "ECONNABORTED") {
        setError(
          "Request took too long. On first run the server downloads AI models (~1.6GB), which can take 5–15 minutes. " +
            "Try uploading again in a few minutes; the analysis will complete once models are ready.",
        );
      } else {
        setError(err.response?.data?.detail || "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 4,
        marginBottom: 4,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        borderRadius: 4,
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CloudUploadIcon /> Upload Sri Lankan Legal Document
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: Sri Lankan Law Reports (SLR) and New Law Reports
            (NLR) in PDF format
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            border: "2px dashed #3498db",
            borderRadius: 2,
            padding: 4,
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "#2980b9",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            },
          }}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {file ? (
            <Stack spacing={1.5} alignItems="center">
              <InsertDriveFileIcon sx={{ fontSize: 48, color: "#3498db" }} />
              <Typography variant="body1" fontWeight={600}>
                {file.name}
              </Typography>
              <Chip
                label={formatFileSize(file.size)}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>
          ) : (
            <Stack spacing={1.5} alignItems="center">
              <CloudUploadIcon sx={{ fontSize: 48, color: "#95a5a6" }} />
              <Typography variant="body1" color="text.secondary">
                Click to select a PDF file or drag and drop
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maximum file size: 10MB
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                First upload may take 5–15 min while the server loads AI models (~1.6GB, one-time).
              </Typography>
            </Stack>
          )}
        </Box>

        {uploading && (
          <Box>
            {/* Treat 0–99% as upload, 100% as server-side analysis */}
            {/*
              When uploadProgress >= 100 the browser has finished sending bytes,
              but the backend may still be processing. Show an animated loader
              in that \"analyzing\" phase instead of a static 100% bar.
            */}
            {(() => {
              const isAnalyzing = uploadProgress >= 100;
              return (
                <>
                  <LinearProgress
                    variant={isAnalyzing ? "indeterminate" : "determinate"}
                    value={isAnalyzing ? undefined : uploadProgress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 5,
                        background:
                          "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block", textAlign: "center" }}
                  >
                    {isAnalyzing
                      ? "Analyzing case with AI…"
                      : `Uploading… ${uploadProgress}%`}
                  </Typography>
                </>
              );
            })()}
          </Box>
        )}

        {/*
        Legacy: keep explicit 100% success state after backend finishes
        */}
        {uploadProgress === 100 && !uploading && !error && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon fontSize="inherit" />}
          >
            Upload and analysis completed successfully!
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2.5 }}>
          <Button
            variant="contained"
            onClick={uploadDocument}
            disabled={!file || uploading}
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: 600,
              padding: "14px",
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              boxShadow: "0 4px 6px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                boxShadow: "0 6px 10px rgba(102, 126, 234, 0.6)",
              },
              "&:disabled": {
                opacity: 0.6,
                background: "#95a5a6",
              },
            }}
          >
            {uploading
              ? uploadProgress >= 100
                ? "Analyzing…"
                : "Uploading…"
              : "Upload & Analyze"}
          </Button>

          {file && !uploading && (
            <Button
              variant="outlined"
              onClick={() => {
                setFile(null);
                setError(null);
                setUploadProgress(0);
              }}
              sx={{
                borderColor: "#e74c3c",
                color: "#e74c3c",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#c0392b",
                  backgroundColor: "rgba(231, 76, 60, 0.1)",
                },
              }}
            >
              Clear
            </Button>
          )}
        </Box>

        {/* Existing success + clear buttons below are now redundant but preserved for safety */}
        {/* (Can be simplified later if desired.) */}
        {/* 
        {uploading && (
          <Box>
            <LinearProgress
              variant={uploadProgress > 0 ? "determinate" : "indeterminate"}
              value={uploadProgress > 0 ? uploadProgress : undefined}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  background:
                    "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block", textAlign: "center" }}
            >
              {uploadProgress > 0
                ? `Uploading... ${uploadProgress}%`
                : "Uploading & processing… (this can take a few minutes)"}
            </Typography>
          </Box>
        )}

        {uploadProgress === 100 && !uploading && !error && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon fontSize="inherit" />}
          >
            Upload completed successfully!
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2.5 }}>
          <Button
            variant="contained"
            onClick={uploadDocument}
            disabled={!file || uploading}
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: 600,
              padding: "14px",
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              boxShadow: "0 4px 6px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                boxShadow: "0 6px 10px rgba(102, 126, 234, 0.6)",
              },
              "&:disabled": {
                opacity: 0.6,
                background: "#95a5a6",
              },
            }}
          >
            {uploading ? "Processing..." : "Upload & Analyze"}
          </Button>

          {file && !uploading && (
            <Button
              variant="outlined"
              onClick={() => {
                setFile(null);
                setError(null);
                setUploadProgress(0);
              }}
              sx={{
                borderColor: "#e74c3c",
                color: "#e74c3c",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#c0392b",
                  backgroundColor: "rgba(231, 76, 60, 0.1)",
                },
              }}
            >
              Clear
            </Button>
          )}
        </Box>
        */}
      </Stack>
    </Paper>
  );
};

export default DocumentUploadMUI;
