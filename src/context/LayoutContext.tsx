"use client";

import { LayoutTypeProps } from "@/@types/LayoutTypes";
import { LayoutStaticData } from "@/mock/areas";
import { createContext, useContext, useEffect, useState } from "react";

interface LayoutContextProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
  layoutData: LayoutTypeProps;
  setLayoutData: React.Dispatch<React.SetStateAction<LayoutTypeProps>>;
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

interface ProviderProps {
  children: React.ReactNode;
}

export const LayoutContextProvider = ({ children }: ProviderProps) => {
  const [selectedLayoutStep, setSelectedLayoutStep] = useState(1);
  const [layoutData, setLayoutData] = useState<LayoutTypeProps>({
    areas: null,
  });

  console.log("layoutData: ", layoutData);

  useEffect(() => {
    setLayoutData({
      areas: LayoutStaticData,
    });
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        selectedLayoutStep,
        setSelectedLayoutStep,
        layoutData,
        setLayoutData,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error(
      "useLayoutContext deve ser usado dentro de um LayoutContextProvider",
    );
  }
  return context;
}
