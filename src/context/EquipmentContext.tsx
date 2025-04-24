"use client";

import {
  EquipmentFilterProps,
  EquipmentTypeProps,
} from "@/@types/EquipmentTypes";
import {
  CipProps,
  EquipmentsProps,
  SetProps,
  SubSetProps,
} from "@/@types/LayoutTypes";
import { createContext, useContext, useEffect, useState } from "react";
import { useApiContext } from "./ApiContext";

interface EquipmentContextProps {
  selectedEquipmentStep: number;
  setSelectedEquipmentStep: React.Dispatch<React.SetStateAction<number>>;
  equipmentData: EquipmentTypeProps[];
  setEquipmentData: React.Dispatch<React.SetStateAction<EquipmentTypeProps[]>>;
  originalEquipments: EquipmentTypeProps[];
  setOriginalEquipments: React.Dispatch<
    React.SetStateAction<EquipmentTypeProps[]>
  >;
  cipCount: number;
  setCipCount: React.Dispatch<React.SetStateAction<number>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  filters: EquipmentFilterProps[] | null;
  setFilters: React.Dispatch<
    React.SetStateAction<EquipmentFilterProps[] | null>
  >;
  GetAllData: () => void;
}

const EquipmentContext = createContext<EquipmentContextProps | undefined>(
  undefined,
);

interface ProviderProps {
  children: React.ReactNode;
}

export const EquipmentContextProvider = ({ children }: ProviderProps) => {
  const { GetAPI } = useApiContext();
  const [selectedEquipmentStep, setSelectedEquipmentStep] = useState(1);
  const [equipmentData, setEquipmentData] = useState<EquipmentTypeProps[]>([]);
  const [originalEquipments, setOriginalEquipments] = useState<
    EquipmentTypeProps[]
  >([]);
  const [cipCount, setCipCount] = useState(1);
  const [query, setQuery] = useState<string>("");
  const [filters, setFilters] = useState<EquipmentFilterProps[] | null>(null);

  console.log("Equipment Data:", equipmentData);

  async function GetFilters() {
    const filters = await GetAPI("/filter", true);
    if (filters.status === 200) {
      setFilters(filters.body.filters);
    }
  }

  async function GetAllData() {
    try {
      // Make all API calls in parallel for better performance
      const [equipmentsRes, setsRes, subsetsRes, cipsRes] = await Promise.all([
        GetAPI("/equipment", true),
        GetAPI("/set", true),
        GetAPI("/subset", true),
        GetAPI("/cip", true),
      ]);

      const clonedEquipments: EquipmentTypeProps[] =
        equipmentsRes.body.equipments.map((e: EquipmentsProps) => ({ ...e }));

      setOriginalEquipments(clonedEquipments);

      // Process the data to match EquipmentTypeProps structure
      const processedData = equipmentsRes.body.equipments.map(
        (equipment: EquipmentsProps) => {
          // Find sets for this equipment
          const equipmentSets = setsRes.body.sets
            .filter((set: SetProps) => set.equipmentId === equipment.id)
            .map((set: SetProps) => {
              // Find subsets for this set
              const setSubsets = subsetsRes.body.subsets
                .filter((subset: SubSetProps) => subset.setId === set.id)
                .map((subset: SubSetProps) => {
                  // Find cips for this subset
                  const subsetCips = cipsRes.body.cips.filter(
                    (cip: CipProps) => cip.SubsetId === subset.id,
                  );

                  return {
                    ...subset,
                    cip: subsetCips.length > 0 ? subsetCips : null,
                  };
                });

              return {
                ...set,
                subSets: setSubsets.length > 0 ? setSubsets : null,
              };
            });

          // Return the complete equipment object with nested data
          return {
            ...equipment,
            sets: equipmentSets.length > 0 ? equipmentSets : null,
            services: [], // Initialize empty services array as required by EquipmentTypeProps
          };
        },
      );

      setEquipmentData(processedData);
    } catch (error) {
      console.error("Error fetching equipment data:", error);
    }
  }

  useEffect(() => {
    GetAllData();
    GetFilters();
  }, []);

  return (
    <EquipmentContext.Provider
      value={{
        selectedEquipmentStep,
        setSelectedEquipmentStep,
        equipmentData,
        setEquipmentData,
        originalEquipments,
        setOriginalEquipments,
        cipCount,
        setCipCount,
        query,
        setQuery,
        filters,
        setFilters,
        GetAllData,
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
