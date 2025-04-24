"use client";

import { MaterialTypeProps } from "@/@types/MaterialTypes";
import { createContext, useContext, useEffect, useState } from "react";
import { useApiContext } from "./ApiContext";

interface MaterialContextProps {
  selectedMaterialStep: number;
  setSelectedMaterialStep: React.Dispatch<React.SetStateAction<number>>;
  materialsData: MaterialTypeProps[] | null;
  setMaterialsData: React.Dispatch<
    React.SetStateAction<MaterialTypeProps[] | null>
  >;
  originalMaterials: MaterialTypeProps[] | null;
  setOriginalMaterials: React.Dispatch<
    React.SetStateAction<MaterialTypeProps[] | null>
  >;
  isGettingData: boolean;
  setIsGettingData: React.Dispatch<React.SetStateAction<boolean>>;
  GetMaterials: () => void;
}

const MaterialContext = createContext<MaterialContextProps | undefined>(
  undefined,
);

interface ProviderProps {
  children: React.ReactNode;
}

export const MaterialContextProvider = ({ children }: ProviderProps) => {
  const { GetAPI } = useApiContext();
  const [selectedMaterialStep, setSelectedMaterialStep] = useState(1);
  const [materialsData, setMaterialsData] = useState<
    MaterialTypeProps[] | null
  >(null);
  const [originalMaterials, setOriginalMaterials] = useState<
    MaterialTypeProps[] | null
  >(null);
  const [isGettingData, setIsGettingData] = useState(true);

  async function GetMaterials() {
    const materials = await GetAPI("/product", true);
    if (materials.status !== 200) return;

    // 1. Clone the raw materials first
    const clonedMaterials: MaterialTypeProps[] = materials.body.products.map(
      (m: MaterialTypeProps) => ({
        ...m,
      }),
    );

    // 2. Set materialsData
    setMaterialsData(clonedMaterials.map((material) => ({ ...material })));

    // 3. Store baseline clone
    setOriginalMaterials(clonedMaterials);

    setIsGettingData(false);
  }

  useEffect(() => {
    GetMaterials();
  }, []);

  return (
    <MaterialContext.Provider
      value={{
        selectedMaterialStep,
        setSelectedMaterialStep,
        materialsData,
        setMaterialsData,
        originalMaterials,
        setOriginalMaterials,
        isGettingData,
        setIsGettingData,
        GetMaterials,
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
