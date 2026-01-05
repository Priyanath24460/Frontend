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
  setActiveTab: (tab: string) => void;
  resetState: () => void;
}

const initialState: CaseAnalysisState = {
  summary: '',
  keywords: [],
  fundamentalRights: [],
  constitutionalProvisions: [],
  structureAnalysis: null,
  analysisError: null,
  currentDocumentId: null,
  activeTab: 'summary',
  shouldPersist: false,
};

const STORAGE_KEY = 'caseAnalysisState';

const CaseAnalysisContext = createContext<CaseAnalysisContextType | undefined>(undefined);

export const CaseAnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CaseAnalysisState>(() => {
    // Load persisted state on initialization
    const savedState = sessionStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Only restore if it was marked for persistence
      if (parsed.shouldPersist) {
        return parsed;
      }
    }
    return initialState;
  });

  // Persist state to session storage whenever it changes
  useEffect(() => {
    if (state.shouldPersist && (state.summary || state.keywords.length > 0)) {
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
    setState(prev => ({ ...prev, currentDocumentId }));
  const setActiveTab = (activeTab: string) => 
    setState(prev => ({ ...prev, activeTab }));
  const resetState = () => {
    setState(initialState);
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
        setActiveTab,
        resetState,
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