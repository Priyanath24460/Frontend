/**
 * ExportButton.tsx
 * Generates a professional text-based PDF of the Analysis Results using jsPDF.
 * Fetches structured data from the case-brief API for accurate, clean output.
 */
import React, { useState } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import { BACKEND_BASE } from "../../config/api";

interface ExportButtonProps {
  documentId: number;
  documentTitle?: string;
  contentElementId?: string;
}

const wrap = (doc: jsPDF, text: string, x: number, maxW: number): string[] => {
  if (!text) return [];
  return doc.splitTextToSize(String(text), maxW);
};

const ExportButton: React.FC<ExportButtonProps> = ({
  documentId,
  documentTitle = "Legal Analysis",
}) => {
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const sanitize = (s: string) =>
    s.replace(/[^a-z0-9]/gi, "_").replace(/_+/g, "_").toLowerCase();

  const toStr = (v: unknown): string => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (o.statute_and_section) return `${o.statute_and_section}${o.context ? " — " + o.context : ""}`;
      if (o.case_name) return `${o.case_name}${o.citation ? " (" + o.citation + ")" : ""}${o.how_related ? " — " + o.how_related : ""}`;
      if (o.article) return `Article ${o.article}${o.context_in_judgment ? ": " + o.context_in_judgment : ""}`;
      return JSON.stringify(o);
    }
    return String(v);
  };

  const exportToPDF = async () => {
    setExporting(true);
    setStatus("idle");

    try {
      // Fetch all analysis endpoints for the complete report (plain_language=true for glossary)
      const [briefResp, summaryResp, constitutionalResp, relatedResp] = await Promise.allSettled([
        axios.get(`${BACKEND_BASE}/api/analysis/case-brief/${documentId}`),
        axios.get(
          `${BACKEND_BASE}/api/analysis/summarize/multi-level/${documentId}?include_plain_language=true`
        ),
        axios.get(`${BACKEND_BASE}/api/analysis/constitutional/${documentId}`).catch(() => null),
        axios.get(`${BACKEND_BASE}/api/analysis/related-cases/${documentId}?top_k=5`).catch(() => null),
      ]);

      const brief = (briefResp.status === "fulfilled" && briefResp.value?.data ? briefResp.value.data?.case_brief : null) ?? {};
      const sumData = (summaryResp.status === "fulfilled" && summaryResp.value?.data ? summaryResp.value.data?.summaries : null) ?? {};
      const plainLang = sumData?.plain_language ?? {};
      const constitutional = constitutionalResp.status === "fulfilled" && constitutionalResp.value != null ? constitutionalResp.value.data ?? null : null;
      let relatedData = relatedResp.status === "fulfilled" && relatedResp.value != null ? relatedResp.value.data ?? null : null;
      let relatedCases: Array<{ case_name?: string; citation?: string; court?: string; year?: number; why_related?: string }> = relatedData?.related_cases ?? [];
      if (relatedCases.length === 0) {
        try {
          const similarResp = await axios.get(`${BACKEND_BASE}/api/analysis/similar-cases/${documentId}`, { params: { top_k: 5 } });
          const similar = similarResp?.data?.similar_cases ?? [];
          relatedCases = similar.map((c: { title?: string; file_name?: string; citation?: string; court?: string; year?: number; similarity_score?: number }) => ({
            case_name: c.title || c.file_name || "Unknown",
            citation: c.citation,
            court: c.court,
            year: c.year,
            why_related: c.similarity_score != null ? `Similarity ${c.similarity_score}% from NLR/SLR corpus.` : "From NLR/SLR corpus.",
          }));
        } catch {
          // leave relatedCases empty
        }
      }

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210;
      const H = 297;
      const MARGIN = 20;
      const CONTENT_W = W - MARGIN * 2;
      const FOOTER_Y = H - 12;
      const BODY_MAX_Y = FOOTER_Y - 16;
      let y = MARGIN;

      const checkPage = (needed = 12) => {
        if (y + needed > BODY_MAX_Y) {
          doc.addPage();
          y = MARGIN;
        }
      };

      const heading1 = (text: string) => {
        checkPage(18);
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(120, 53, 15);
        doc.text(text, MARGIN, y);
        y += 2;
        doc.setDrawColor(200, 120, 50);
        doc.setLineWidth(0.4);
        doc.line(MARGIN, y, W - MARGIN, y);
        y += 8;
        doc.setTextColor(35, 28, 23);
      };

      const heading2 = (text: string) => {
        checkPage(14);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(67, 20, 7);
        doc.text(text, MARGIN, y);
        y += 7;
        doc.setTextColor(35, 28, 23);
      };

      const paragraph = (text: string, indent = 0) => {
        if (!text) return;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 30, 10);
        const lines = wrap(doc, String(text), MARGIN + indent, CONTENT_W - indent);
        lines.forEach((line) => {
          checkPage(6);
          doc.text(line, MARGIN + indent, y);
          y += 5;
        });
        y += 1;
      };

      const bullet = (text: string) => {
        if (!text) return;
        checkPage(6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 30, 10);
        const lines = wrap(doc, "• " + String(text), MARGIN + 4, CONTENT_W - 4);
        lines.forEach((line, i) => {
          checkPage(6);
          doc.text(line, MARGIN + (i === 0 ? 0 : 4), y);
          y += 5;
        });
      };

      const labelValue = (label: string, value: unknown) => {
        if (!value) return;
        checkPage(6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(120, 53, 15);
        doc.text(`${label}: `, MARGIN, y);
        const lw = doc.getTextWidth(`${label}: `);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 30, 10);
        const valLines = wrap(doc, String(value), MARGIN + lw, CONTENT_W - lw);
        valLines.forEach((line, i) => {
          checkPage(6);
          doc.text(line, MARGIN + (i === 0 ? lw : 0), y);
          y += 5;
        });
      };

      const section = (title: string, content: unknown) => {
        if (!content) return;
        const arr = Array.isArray(content) ? content : null;
        if (arr && arr.length === 0) return;
        heading2(title);
        if (arr) {
          arr.forEach((item) => bullet(toStr(item)));
        } else {
          paragraph(toStr(content));
        }
        y += 3;
      };

      // ── COVER ────────────────────────────────────────────────────────────────
      // Header bar
      doc.setFillColor(120, 53, 15);
      doc.rect(0, 0, W, 30, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("AI Legal Analysis Report", MARGIN, 14);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Sri Lankan Legal Case Summarizer — NLR/SLR Corpus", MARGIN, 22);

      y = 38;

      // Case identification block
      const ci = brief.case_identification || {};
      const caseName =
        ci.case_name && ci.case_name !== "Case Name Not Available"
          ? ci.case_name
          : documentTitle;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 20, 0);
      const nameLines = wrap(doc, caseName, MARGIN, CONTENT_W);
      nameLines.forEach((line) => { doc.text(line, MARGIN, y); y += 7; });
      y += 2;

      if (ci.court || ci.year || ci.citation) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(120, 53, 15);
        const meta = [ci.court, ci.year, ci.citation].filter(Boolean).join("  •  ");
        doc.text(meta, MARGIN, y);
        y += 7;
      }

      if (brief.area_of_law && brief.area_of_law !== "N/A") {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 60, 20);
        doc.text(`Area of Law: ${brief.area_of_law}`, MARGIN, y);
        y += 5;
      }

      // Generated timestamp
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 130, 100);
      doc.text(`Generated: ${new Date().toLocaleString()}  |  Document ID: ${documentId}`, MARGIN, y);
      y += 10;

      doc.setDrawColor(180, 83, 9);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, y, W - MARGIN, y);
      y += 8;

      // ── SECTION 1: EXECUTIVE SUMMARY ─────────────────────────────────────────
      const execText =
        sumData?.executive?.summary || brief.executive_summary || "";
      if (execText) {
        heading1("Executive Summary");
        paragraph(execText);
        y += 2;
      }

      // ── SECTION 1b: DETAILED SUMMARY (with **FACTS:** etc. as subheadings) ─────
      const detailedText = sumData?.detailed?.summary || plainLang?.detailed?.plain_summary || "";
      if (detailedText && detailedText !== execText) {
        heading1("Detailed Summary");
        const sectionRe = /^\s*\*\*(.+?):\*\*\s*$/;
        const lines = String(detailedText).split(/\r?\n/);
        let currentLabel = "";
        let bodyLines: string[] = [];
        const flushSection = () => {
          const body = bodyLines.join("\n").replace(/\*\*/g, "").trim();
          if (!body) return;
          if (currentLabel) heading2(currentLabel);
          paragraph(body);
          y += 2;
        };
        for (const line of lines) {
          const m = line.match(sectionRe);
          if (m) {
            flushSection();
            currentLabel = m[1].trim();
            bodyLines = [];
          } else {
            bodyLines.push(line);
          }
        }
        flushSection();
        if (!currentLabel && !bodyLines.length && detailedText.trim()) {
          paragraph(detailedText.replace(/\*\*/g, "").trim());
        }
        y += 4;
      }

      // ── SECTION 1c: SECTION-BY-SECTION SUMMARIES ─────────────────────────────
      // multi-level API returns section_specific: { facts: {summary, word_count}, ... }
      const sectionSums: Record<string, { summary?: string }> =
        sumData?.section_specific || {};
      const sectionEntries = Object.entries(sectionSums);
      if (sectionEntries.length > 0) {
        heading1("Section-by-Section Analysis");
        sectionEntries.forEach(([sectionName, sec]) => {
          const secData = sec as { summary?: string };
          if (secData?.summary) {
            heading2(sectionName.replace(/_/g, " ").toUpperCase());
            paragraph(secData.summary);
            y += 2;
          }
        });
      }

      // ── SECTION 1d: LEGAL TERMS GLOSSARY (from plain_language) ─────────────────
      const glossary: Array<{ term?: string; definition?: string }> =
        plainLang?.glossary || sumData?.glossary || [];
      if (glossary.length > 0) {
        heading1("Legal Terms Glossary");
        glossary.slice(0, 50).forEach((g) => {
          if (g.term && g.definition) {
            checkPage(10);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(120, 53, 15);
            doc.text(`${g.term}: `, MARGIN + 2, y);
            const tw = doc.getTextWidth(`${g.term}: `);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(40, 30, 10);
            const defLines = wrap(doc, g.definition, MARGIN + 2 + tw, CONTENT_W - tw - 2);
            defLines.forEach((line, i) => {
              checkPage(5);
              doc.text(line, MARGIN + (i === 0 ? 2 + tw : 2), y);
              y += 4.5;
            });
            y += 1;
          }
        });
        y += 4;
      }

      // ── SECTION 1e: CONSTITUTIONAL ANALYSIS ────────────────────────────────────
      if (constitutional && (constitutional.matched_articles?.length > 0 || constitutional.constitutional_analysis)) {
        heading1("Constitutional Analysis");
        if (constitutional.constitutional_analysis) {
          const analysisLines = String(constitutional.constitutional_analysis).split(/\n/).filter(Boolean);
          analysisLines.forEach((line: string) => paragraph(line));
        }
        const arts = constitutional.matched_articles || constitutional.fundamental_rights || [];
        if (arts.length > 0) {
          heading2("Matched Provisions");
          arts.slice(0, 15).forEach((a: { article_number?: string; title?: string; matched_text?: string }) => {
            const title = a.article_number && a.title ? `Article ${a.article_number}: ${a.title}` : toStr(a);
            bullet(title);
            if (a.matched_text) {
              const subLines = wrap(doc, a.matched_text.slice(0, 200) + (a.matched_text.length > 200 ? "…" : ""), MARGIN + 6, CONTENT_W - 6);
              subLines.forEach((line) => { checkPage(5); doc.text(line, MARGIN + 6, y); y += 4; });
              y += 1;
            }
          });
        }
        y += 4;
      }

      // ── SECTION 1f: RELATED CASES (always include in export) ─────────────────────
      heading1("Related Cases");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 70, 60);
      if (relatedCases.length > 0) {
        paragraph(`Found ${relatedCases.length} similar case(s) from the NLR/SLR corpus.`);
        relatedCases.slice(0, 8).forEach((rc: { case_name?: string; citation?: string; court?: string; year?: number; why_related?: string }) => {
          checkPage(14);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(67, 20, 7);
          doc.text(rc.case_name || "Unknown", MARGIN + 2, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(40, 30, 10);
          const meta = [rc.citation, rc.court, rc.year].filter(Boolean).join("  ·  ");
          if (meta) { doc.text(meta, MARGIN + 2, y); y += 5; }
          if (rc.why_related) {
            const lines = wrap(doc, rc.why_related, MARGIN + 2, CONTENT_W - 2);
            lines.slice(0, 2).forEach((l) => { doc.text(l, MARGIN + 2, y); y += 4; });
          }
          y += 3;
        });
      } else {
        paragraph("No related cases were retrieved for this export. Similar cases from the NLR/SLR corpus may be viewed in the Related Cases tab.");
      }
      y += 4;

      // ── SECTION 2: CASE IDENTIFICATION ───────────────────────────────────────
      heading1("Case Identification");
      labelValue("Case Name", ci.case_name);
      labelValue("Court", ci.court);
      if (ci.judges && ci.judges !== "N/A") labelValue("Judges", ci.judges);
      labelValue("Year", ci.year);
      labelValue("Citation", ci.citation);
      labelValue("Appeal/Case No.", ci.case_number);
      y += 4;

      // ── SECTION 3: CASE BRIEF ────────────────────────────────────────────────
      heading1("Structured Case Brief");

      if (brief.area_of_law && brief.area_of_law !== "N/A") {
        labelValue("Area of Law", brief.area_of_law);
      }

      const statutes = [
        ...(brief.procedural_principles?.statutory_provisions || []),
      ].map(toStr).filter(Boolean);
      if (statutes.length) {
        section("Statutory Provisions", statutes);
      }

      if (brief.facts) {
        section("Material Facts", brief.facts);
      }

      const legalIssues = brief.issues;
      if (legalIssues && legalIssues.length > 0) {
        section("Legal Issues", legalIssues);
      }

      const holdingText = brief.holding;
      if (holdingText) {
        section("Holding / Decision", holdingText);
      }

      const reasoningText = brief.reasoning;
      if (reasoningText) {
        section("Judicial Reasoning", reasoningText);
      }

      if (brief.final_order) {
        section("Final Order", brief.final_order);
      }

      const ruleOfLaw = brief.ratio_decidendi;
      if (ruleOfLaw && ruleOfLaw.length > 0) {
        section("Ratio Decidendi", ruleOfLaw);
      }

      const proceduralNote = brief.procedural_principles?.note || 
        (brief.procedural_principles?.procedural_rules?.length ? brief.procedural_principles.procedural_rules.join('; ') : null);
      if (proceduralNote && proceduralNote !== "Not a primarily procedural case.") {
        section("Procedural & Evidentiary Principles", proceduralNote);
      }

      if (brief.key_takeaways && brief.key_takeaways.length > 0) {
        section("Key Takeaways", brief.key_takeaways);
      }

      // ── FOOTER on every page ──────────────────────────────────────────────────
      const totalPages = (doc as any).internal.getNumberOfPages();
      const footerY = FOOTER_Y;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(140, 120, 90);
        doc.text(
          `AI Legal Summarizer — Sri Lankan Case Law  |  Page ${i} of ${totalPages}`,
          MARGIN,
          footerY
        );
        const shortName = caseName.length > 35 ? caseName.slice(0, 32) + "…" : caseName;
        doc.text(shortName, W - MARGIN, footerY, { align: "right" });
      }

      // ── SAVE ──────────────────────────────────────────────────────────────────
      const filename = `${sanitize(caseName || documentTitle)}_analysis.pdf`;
      doc.save(filename);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("PDF export error:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    } finally {
      setExporting(false);
    }
  };

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    cursor: exporting ? "wait" : "pointer",
    fontWeight: 700,
    fontSize: 14,
    transition: "all 0.2s",
    background:
      status === "success"
        ? "linear-gradient(135deg,#16a34a,#15803d)"
        : status === "error"
        ? "linear-gradient(135deg,#dc2626,#b91c1c)"
        : "linear-gradient(135deg,#b45309,#92400e)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(180,83,9,0.4)",
    opacity: exporting ? 0.75 : 1,
    width: "100%",
    justifyContent: "center",
  };

  return (
    <button style={btnStyle} onClick={exportToPDF} disabled={exporting}>
      {exporting ? (
        <>
          <svg
            style={{ animation: "spin 1s linear infinite", width: 18, height: 18 }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Generating PDF…
        </>
      ) : status === "success" ? (
        <>✅ PDF Downloaded!</>
      ) : status === "error" ? (
        <>❌ Export Failed</>
      ) : (
        <>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          📄 Download Analysis PDF
        </>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </button>
  );
};

export default ExportButton;
