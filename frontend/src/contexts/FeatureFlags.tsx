import React, { createContext, useContext, useEffect, useState } from 'react';

interface FlagsCtx { aiTools: boolean; toggleAi: () => void; }

const FeatureContext = createContext<FlagsCtx>({} as FlagsCtx);
export const useFeatures = () => useContext(FeatureContext);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiTools, setAiTools] = useState<boolean>(
    JSON.parse(localStorage.getItem('aiTools') ?? 'true')
  );

  const toggleAi = () => setAiTools(v => !v);

  useEffect(() => localStorage.setItem('aiTools', String(aiTools)), [aiTools]);

  return (
    <FeatureContext.Provider value={{ aiTools, toggleAi }}>
      {children}
    </FeatureContext.Provider>
  );
};
