"use client";

import { EquipmentTypeProps } from "@/@types/EquipmentTypes";
import { EquipmentStaticData } from "@/mock/equipments";
import { createContext, useContext, useEffect, useState } from "react";

interface EquipmentContextProps {
  selectedEquipmentStep: number;
  setSelectedEquipmentStep: React.Dispatch<React.SetStateAction<number>>;
  equipmentData: EquipmentTypeProps[];
  setEquipmentData: React.Dispatch<React.SetStateAction<EquipmentTypeProps[]>>;
  cipCount: number;
  setCipCount: React.Dispatch<React.SetStateAction<number>>;
}

const EquipmentContext = createContext<EquipmentContextProps | undefined>(
  undefined,
);

interface ProviderProps {
  children: React.ReactNode;
}

export const EquipmentContextProvider = ({ children }: ProviderProps) => {
  const [selectedEquipmentStep, setSelectedEquipmentStep] = useState(6);
  const [equipmentData, setEquipmentData] = useState<EquipmentTypeProps[]>([]);
  const [cipCount, setCipCount] = useState(1);

  useEffect(() => {
    setEquipmentData(EquipmentStaticData);
  }, []);

  return (
    <EquipmentContext.Provider
      value={{
        selectedEquipmentStep,
        setSelectedEquipmentStep,
        equipmentData,
        setEquipmentData,
        cipCount,
        setCipCount,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
};

export function useEquipmentContext() {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error(
      "useEquipmentContext deve ser usado dentro de um EquipmentContextProvider",
    );
  }
  return context;
}
