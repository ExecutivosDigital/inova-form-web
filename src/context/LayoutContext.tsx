"use client";

import { AreaProps, LayoutTypeProps, SectorProps } from "@/@types/LayoutTypes";
import { createContext, useContext, useEffect, useState } from "react";
import { useApiContext } from "./ApiContext";

interface LayoutContextProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
  layoutData: LayoutTypeProps;
  setLayoutData: React.Dispatch<React.SetStateAction<LayoutTypeProps>>;
  cipCount: number;
  setCipCount: React.Dispatch<React.SetStateAction<number>>;
  originalAreas: AreaProps[] | null;
  setOriginalAreas: React.Dispatch<React.SetStateAction<AreaProps[] | null>>;
  originalSectors: SectorProps[] | null;
  setOriginalSectors: React.Dispatch<
    React.SetStateAction<SectorProps[] | null>
  >;
  GetAreas: () => void;
  GetSectors: () => void;
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

interface ProviderProps {
  children: React.ReactNode;
}

export const LayoutContextProvider = ({ children }: ProviderProps) => {
  const { GetAPI } = useApiContext();
  const [selectedLayoutStep, setSelectedLayoutStep] = useState(1);
  const [layoutData, setLayoutData] = useState<LayoutTypeProps>({
    areas: null,
  });
  const [originalAreas, setOriginalAreas] = useState<AreaProps[] | null>(null);
  const [originalSectors, setOriginalSectors] = useState<SectorProps[] | null>(
    null,
  );
  const [cipCount, setCipCount] = useState(1);

  async function GetAreas() {
    const areas = await GetAPI("/area", true);
    if (areas.status === 200) {
      setLayoutData({
        areas: areas.body.areas,
      });
      setOriginalAreas(areas.body.areas);
    }
  }

  async function GetSectors() {
    const sectors = await GetAPI("/sector", true);
    if (sectors.status === 200) {
      // Update each area by adding a sectors property with the matching sectors
      setLayoutData((prevLayout) => ({
        ...prevLayout,
        areas:
          prevLayout.areas?.map((area) => ({
            ...area,
            sectors: sectors.body.sectors.filter(
              (sector: SectorProps) =>
                sector.position.split(".")[0] === area.position,
            ),
          })) || null,
      }));
      // Also store the original sectors, if needed later
      setOriginalSectors(sectors.body.sectors);
    }
  }

  useEffect(() => {
    async function fetchData() {
      await GetAreas();
      await GetSectors();
    }
    fetchData();
  }, []);
  // useEffect(() => {
  //   setLayoutData({
  //     areas: LayoutStaticData,
  //   });
  // }, []);

  return (
    <LayoutContext.Provider
      value={{
        selectedLayoutStep,
        setSelectedLayoutStep,
        layoutData,
        setLayoutData,
        cipCount,
        setCipCount,
        originalAreas,
        setOriginalAreas,
        originalSectors,
        setOriginalSectors,
        GetAreas,
        GetSectors,
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
