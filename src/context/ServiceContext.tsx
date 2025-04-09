"use client";

import { ServiceTypeProps } from "@/@types/ServiceTypes";
import { ServiceStaticData } from "@/mock/services";
import { createContext, useContext, useEffect, useState } from "react";

interface ServiceContextProps {
  selectedEquipmentStep: number;
  setSelectedEquipmentStep: React.Dispatch<React.SetStateAction<number>>;
  serviceData: ServiceTypeProps[];
  setServiceData: React.Dispatch<React.SetStateAction<ServiceTypeProps[]>>;
  cipCount: number;
  setCipCount: React.Dispatch<React.SetStateAction<number>>;
}

const ServiceContext = createContext<ServiceContextProps | undefined>(
  undefined,
);

interface ProviderProps {
  children: React.ReactNode;
}

export const ServiceContextProvider = ({ children }: ProviderProps) => {
  const [selectedEquipmentStep, setSelectedEquipmentStep] = useState(4);
  const [serviceData, setServiceData] = useState<ServiceTypeProps[]>([]);
  const [cipCount, setCipCount] = useState(1);

  useEffect(() => {
    setServiceData(ServiceStaticData);
  }, []);

  return (
    <ServiceContext.Provider
      value={{
        selectedEquipmentStep,
        setSelectedEquipmentStep,
        serviceData,
        setServiceData,
        cipCount,
        setCipCount,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export function useServiceContext() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error(
      "useServiceContext deve ser usado dentro de um ServiceContextProvider",
    );
  }
  return context;
}
