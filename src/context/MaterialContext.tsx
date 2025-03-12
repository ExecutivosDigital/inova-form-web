"use client";

import { createContext, useContext, useState } from "react";

interface MaterialContextProps {
  selectedMaterialStep: number;
  setSelectedMaterialStep: React.Dispatch<React.SetStateAction<number>>;
}

const MaterialContext = createContext<MaterialContextProps | undefined>(
  undefined,
);

interface ProviderProps {
  children: React.ReactNode;
}

export const MaterialContextProvider = ({ children }: ProviderProps) => {
  const [selectedMaterialStep, setSelectedMaterialStep] = useState(1);

  return (
    <MaterialContext.Provider
      value={{
        selectedMaterialStep,
        setSelectedMaterialStep,
      }}
    >
      {children}
    </MaterialContext.Provider>
  );
};

export function useMaterialContext() {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error(
      "useMaterialContext deve ser usado dentro de um MaterialContextProvider",
    );
  }
  return context;
}
