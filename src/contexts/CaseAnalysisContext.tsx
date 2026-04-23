import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface FundamentalRight {
  article: string;
  article_title?: string;
  matched_text: string;
  explanation?: string;
  context?: string;
  method?: string;
  score?: number;
}

interface ConstitutionalProvision {
  article: string;
  matched_text: string;
  method: string;
  score: number;
  constitutional_provision?: string;
  explanation?: string;
  context?: string;
  document?: string;
}

interface StructureAnalysis {
  total_paragraphs: number;
  sections: {
    [key: string]: number;
  };
  classification_methods?: {
    [key: string]: number;
  };
}

interface CaseAnalysisState {
  summary: string;
  keywords: string[];
  fundamentalRights: FundamentalRight[];
  constitutionalProvisions: ConstitutionalProvision[];
  structureAnalysis: StructureAnalysis | null;
  analysisError: string | null;
  currentDocumentId: number | null;
  currentDocumentName: string | null;
  activeTab: string;
  shouldPersist: boolean;
}

interface CaseAnalysisContextType {
  state: CaseAnalysisState;
  setSummary: (summary: string) => void;
  setKeywords: (keywords: string[]) => void;
  setFundamentalRights: (rights: FundamentalRight[]) => void;
  setConstitutionalProvisions: (provisions: ConstitutionalProvision[]) => void;
  setStructureAnalysis: (analysis: StructureAnalysis | null) => void;
  setAnalysisError: (error: string | null) => void;
  setCurrentDocumentId: (id: number | null) => void;
  setCurrentDocumentName: (name: string | null) => void;
  setActiveTab: (tab: string) => void;
  resetState: () => void;
  /** One atomic update after upload: clears analysis fields and sets document id/name (avoids race with resetState). */
  beginNewDocument: (doc: {
    document_id?: number | string;
    id?: number | string;
    file_name?: string;
    filename?: string;
    title?: string;
    name?: string;
  }) => void;
}

const initialState: CaseAnalysisState = {
  summary: '',
  keywords: [],
  fundamentalRights: [],
  constitutionalProvisions: [],
  structureAnalysis: null,
  analysisError: null,
  currentDocumentId: null,
  currentDocumentName: null,
  activeTab: 'summary',
  shouldPersist: false,
};

const STORAGE_KEY = 'caseAnalysisState';

const CaseAnalysisContext = createContext<CaseAnalysisContextType | undefined>(undefined);

export const CaseAnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CaseAnalysisState>(() => {
    // Clear old sessionStorage data on page load
    sessionStorage.removeItem(STORAGE_KEY);
    // Don't load from sessionStorage on initial mount - always start fresh
    // Data will only persist during the session, not across page refreshes
    console.log('🆕 Starting with fresh state (no persistence across refreshes)');
    return initialState;
  });

  // Persist state to session storage whenever it changes
  useEffect(() => {
    console.log('State changed:', state);
    if (state.shouldPersist && (state.currentDocumentId || state.summary || state.keywords.length > 0)) {
      console.log('Saving to sessionStorage:', state);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else if (!state.shouldPersist) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  const setSummary = (summary: string) => setState(prev => ({ ...prev, summary, shouldPersist: true }));
  const setKeywords = (keywords: string[]) => setState(prev => ({ ...prev, keywords, shouldPersist: true }));
  const setFundamentalRights = (fundamentalRights: FundamentalRight[]) => 
    setState(prev => ({ ...prev, fundamentalRights, shouldPersist: true }));
  const setConstitutionalProvisions = (constitutionalProvisions: ConstitutionalProvision[]) => 
    setState(prev => ({ ...prev, constitutionalProvisions, shouldPersist: true }));
  const setStructureAnalysis = (structureAnalysis: StructureAnalysis | null) => 
    setState(prev => ({ ...prev, structureAnalysis, shouldPersist: true }));
  const setAnalysisError = (analysisError: string | null) => 
    setState(prev => ({ ...prev, analysisError }));
  const setCurrentDocumentId = (currentDocumentId: number | null) => 
    setState(prev => ({ ...prev, currentDocumentId, shouldPersist: true }));
  const setCurrentDocumentName = (currentDocumentName: string | null) => 
    setState(prev => ({ ...prev, currentDocumentName, shouldPersist: true }));
  const setActiveTab = (activeTab: string) => 
    setState(prev => ({ ...prev, activeTab }));
  const resetState = () => {
    setState(initialState);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const beginNewDocument = (doc: {
    document_id?: number | string;
    id?: number | string;
    file_name?: string;
    filename?: string;
    title?: string;
    name?: string;
  }) => {
    const rawId =
      doc.document_id ??
      doc.id ??
      (doc as { documentId?: number | string }).documentId;
    const parsed =
      typeof rawId === "number" && Number.isFinite(rawId)
        ? rawId
        : parseInt(String(rawId ?? ""), 10);
    const currentDocumentId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    const currentDocumentName =
      doc.file_name ||
      doc.filename ||
      doc.title ||
      doc.name ||
      (currentDocumentId ? `Document_${currentDocumentId}` : null);
    setState({
      ...initialState,
      currentDocumentId,
      currentDocumentName,
      shouldPersist: true,
    });
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <CaseAnalysisContext.Provider
      value={{
        state,
        setSummary,
        setKeywords,
        setFundamentalRights,
        setConstitutionalProvisions,
        setStructureAnalysis,
        setAnalysisError,
        setCurrentDocumentId,
        setCurrentDocumentName,
        setActiveTab,
        resetState,
        beginNewDocument,
      }}
    >
      {children}
    </CaseAnalysisContext.Provider>
  );
};

export const useCaseAnalysis = () => {
  const context = useContext(CaseAnalysisContext);
  if (context === undefined) {
    throw new Error('useCaseAnalysis must be used within a CaseAnalysisProvider');
  }
  return context;
};