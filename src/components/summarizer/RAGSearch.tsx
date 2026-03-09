import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Paper,
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Chip,
  Link,
} from "@mui/material";
import { API } from "../../config/api";

const PREVIEW_CHARS = 220;

function previewText(text: string, maxLen: number = PREVIEW_CHARS): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  const end = lastSpace > maxLen >> 1 ? lastSpace : maxLen;
  return cut.slice(0, end).trim() + "…";
}

export interface RAGChunk {
  text: string;
  case_name?: string | null;
  court?: string | null;
  year?: number | null;
  similarity?: number;
  section_type?: string;
}

interface RAGSearchProps {
  /** When set, user can choose to search only in this document. */
  documentId?: number | null;
}

const RAGSearch: React.FC<RAGSearchProps> = ({ documentId }) => {
  const [query, setQuery] = useState("");
  const [chunks, setChunks] = useState<RAGChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Default to "this document only" when viewing a case so RAG answers from the uploaded doc
  const [thisDocOnly, setThisDocOnly] = useState(() => documentId != null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (documentId != null) setThisDocOnly(true);
  }, [documentId]);

  const toggleExpanded = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleSearch = async (overrideQuery?: string) => {
    const currentInput = inputRef.current?.value ?? query;
    const q = (overrideQuery ?? currentInput).trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setError(null);
    setChunks([]);
    setExpanded(new Set());
    try {
      const payload: { query: string; top_k?: number; doc_id?: number } = {
        query: q,
        top_k: 8,
      };
      // When viewing a doc: use doc_id when "this doc only", else search all
      if (documentId != null && thisDocOnly) payload.doc_id = documentId;
      const response = await axios.post(`${API.RAG}/retrieve`, payload);
      const raw: RAGChunk[] = response.data.chunks || [];
      setChunks(raw);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error fetching results");
    } finally {
      setLoading(false);
    }
  };

  const scopeLabel =
    thisDocOnly && documentId
      ? "Search in this document only (default)"
      : "Search in all uploaded documents";

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>Semantic Legal Search (RAG)</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {documentId
          ? "Answers are from this document by default. Use the option below to search across all uploaded cases instead."
          : "Search across all uploaded case chunks by meaning. Results show which case each passage is from."}
      </Typography>
      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
        Search is by meaning, not exact words—minor typos or informal phrasing usually still work.
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" sx={{ mb: 1 }}>
        <TextField
          inputRef={inputRef}
          label="Legal question or topic..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(undefined)}
          fullWidth
          size="small"
          sx={{ flex: "1 1 200px" }}
        />
        <Button
          variant="contained"
          onClick={() => handleSearch(undefined)}
          disabled={loading || !query.trim()}
          sx={{ flexShrink: 0 }}
        >
          {loading ? "Searching…" : "Search"}
        </Button>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Try asking:
        </Typography>
        <Box component="span" sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {[
            "What was the court's decision?",
            "Who are the parties?",
            "Main issues in the case",
            "Grounds for appeal",
            "What relief was granted?",
            "Constitutional rights involved",
            "Summary of the judgment",
            "Key facts",
            "Legal principles applied",
          ].map((q) => (
            <Chip
              key={q}
              label={q}
              size="small"
              variant="outlined"
              onClick={() => handleSearch(q)}
              sx={{ cursor: "pointer", mb: 0.5 }}
            />
          ))}
        </Box>
      </Box>
      {documentId != null && (
        <FormControlLabel
          control={
            <Checkbox
              checked={thisDocOnly}
              onChange={(e) => setThisDocOnly(e.target.checked)}
              size="small"
            />
          }
          label={scopeLabel}
        />
      )}
      {loading && <CircularProgress size={24} sx={{ mt: 1 }} />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
      )}
      {!loading && chunks.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {chunks.length} passage{chunks.length !== 1 ? "s" : ""} found
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {chunks.map((c, i) => {
              const isExpanded = expanded.has(i);
              const showPreview = c.text.length > PREVIEW_CHARS && !isExpanded;
              const displayText = showPreview ? previewText(c.text) : c.text;
              return (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 2,
                    background: "#fafafa",
                    borderLeft: "4px solid #1976d2",
                  }}
                >
                  <Box sx={{ mb: 1, display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
                    {c.case_name && (
                      <Chip
                        label={c.case_name}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {c.court && (
                      <Chip label={c.court} size="small" variant="outlined" />
                    )}
                    {c.year != null && (
                      <Chip label={String(c.year)} size="small" variant="outlined" />
                    )}
                    {c.similarity != null && (
                      <Typography component="span" variant="caption" color="text.secondary">
                        relevance {(c.similarity * 100).toFixed(0)}%
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    component="div"
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      lineHeight: 1.5,
                      maxHeight: showPreview ? "none" : undefined,
                    }}
                  >
                    {displayText}
                  </Typography>
                  {c.text.length > PREVIEW_CHARS && (
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => toggleExpanded(i)}
                      sx={{ mt: 0.5, cursor: "pointer" }}
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </Link>
                  )}
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}
      {!loading && !error && chunks.length === 0 && query.trim() !== "" && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No passages found. Try different words or upload more documents.
        </Typography>
      )}
    </Paper>
  );
};

export default RAGSearch;
