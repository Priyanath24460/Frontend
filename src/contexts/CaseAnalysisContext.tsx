import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  currentDocumentId: string | null;
  activeTab: string;
}

interface CaseAnalysisContextType {
  state: CaseAnalysisState;
  setSummary: (summary: string) => void;
  setKeywords: (keywords: string[]) => void;
  setFundamentalRights: (rights: FundamentalRight[]) => void;
  setConstitutionalProvisions: (provisions: ConstitutionalProvision[]) => void;
  setStructureAnalysis: (analysis: StructureAnalysis | null) => void;
  setAnalysisError: (error: string | null) => void;
  setCurrentDocumentId: (id: string | null) => void;
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
};

const CaseAnalysisContext = createContext<CaseAnalysisContextType | undefined>(undefined);

export const CaseAnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CaseAnalysisState>(initialState);

  const setSummary = (summary: string) => {
    setState(prev => ({ ...prev, summary }));
  };

  const setKeywords = (keywords: string[]) => {
    setState(prev => ({ ...prev, keywords }));
  };

  const setFundamentalRights = (fundamentalRights: FundamentalRight[]) => {
    setState(prev => ({ ...prev, fundamentalRights }));
  };

  const setConstitutionalProvisions = (constitutionalProvisions: ConstitutionalProvision[]) => {
    setState(prev => ({ ...prev, constitutionalProvisions }));
  };

  const setStructureAnalysis = (structureAnalysis: StructureAnalysis | null) => {
    setState(prev => ({ ...prev, structureAnalysis }));
  };

  const setAnalysisError = (analysisError: string | null) => {
    setState(prev => ({ ...prev, analysisError }));
  };

  const setCurrentDocumentId = (currentDocumentId: string | null) => {
    setState(prev => ({ ...prev, currentDocumentId }));
  };

  const setActiveTab = (activeTab: string) => {
    setState(prev => ({ ...prev, activeTab }));
  };

  const resetState = () => {
    setState(initialState);
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

export const useCaseAnalysis = (): CaseAnalysisContextType => {
  const context = useContext(CaseAnalysisContext);
  if (context === undefined) {
    throw new Error('useCaseAnalysis must be used within a CaseAnalysisProvider');
  }
  return context;
};
