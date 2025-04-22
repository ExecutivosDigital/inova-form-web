"use client";

import {
  AreaProps,
  CipProps,
  EquipmentsProps,
  LayoutTypeProps,
  SectorProps,
  SetProps,
  SubSetProps,
} from "@/@types/LayoutTypes";
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
  originalEquipments: EquipmentsProps[] | null;
  setOriginalEquipments: React.Dispatch<
    React.SetStateAction<EquipmentsProps[] | null>
  >;
  originalSets: SetProps[] | null;
  setOriginalSets: React.Dispatch<React.SetStateAction<SetProps[] | null>>;
  originalSubSets: SubSetProps[] | null;
  setOriginalSubSets: React.Dispatch<
    React.SetStateAction<SubSetProps[] | null>
  >;
  originalCips: CipProps[] | null;
  setOriginalCips: React.Dispatch<React.SetStateAction<CipProps[] | null>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  GetAreas: () => void;
  GetSectors: () => void;
  GetEquipments: () => void;
  GetSets: () => void;
  GetSubSets: () => void;
  GetCips: () => void;
  GetAllData: () => void;
  isGettingData: boolean;
  setIsGettingData: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [originalEquipments, setOriginalEquipments] = useState<
    EquipmentsProps[] | null
  >(null);
  const [originalSets, setOriginalSets] = useState<SetProps[] | null>(null);
  const [originalSubSets, setOriginalSubSets] = useState<SubSetProps[] | null>(
    null,
  );
  const [originalCips, setOriginalCips] = useState<CipProps[] | null>(null);
  const [query, setQuery] = useState<string>("");
  const [cipCount, setCipCount] = useState(1);
  const [isGettingData, setIsGettingData] = useState(true);

  async function GetAreas() {
    const areas = await GetAPI("/area", true);
    if (areas.status !== 200) return;

    // 1. Clone the raw areas first
    const clonedAreas: AreaProps[] = areas.body.areas.map((a: AreaProps) => ({
      ...a,
    }));

    // 2. Set layoutData
    setLayoutData({
      areas: clonedAreas.map((area) => ({ ...area })),
    });

    // 3. Store baseline clone
    setOriginalAreas(clonedAreas);
  }

  async function GetSectors() {
    const sectors = await GetAPI("/sector", true);
    if (sectors.status !== 200) return;

    // 1. Clone the raw sectors so we never share references
    const clonedSectors: SectorProps[] = sectors.body.sectors.map(
      (s: SectorProps) => ({
        ...s,
      }),
    );

    // 2. Merge into layoutData.areas, cloning each area as well
    setLayoutData((prev) => {
      // if there were no areas yet, just return prev
      if (!prev.areas) return prev;

      const mergedAreas: AreaProps[] = prev.areas.map((area) => ({
        ...area,
        // filter and clone each sector for this area
        sectors:
          clonedSectors
            .filter((sec) => sec.position.split(".")[0] === area.position)
            .map((sec) => ({ ...sec })) || null,
      }));

      return { ...prev, areas: mergedAreas };
    });

    // 3. Store your baseline clone
    setOriginalSectors(clonedSectors);
  }

  async function GetEquipments() {
    const resp = await GetAPI("/equipment", true);
    if (resp.status !== 200) return;

    // 1. Clone the raw equipments so you never share references
    const clonedEquipments: EquipmentsProps[] = resp.body.equipments.map(
      (e: EquipmentsProps) => ({ ...e }),
    );

    // 2. Store your baseline clone
    setOriginalEquipments(clonedEquipments);

    // 3. Merge into layoutData, cloning each area and sector as well
    setLayoutData((prev) => {
      // if there were no areas yet, just return prev
      if (!prev.areas) return prev;

      const mergedAreas: AreaProps[] = prev.areas.map((area) => ({
        ...area,
        // clone each sector (or leave null)
        sectors:
          area.sectors?.map((sector) => {
            // filter & clone each equipment for this sector
            const sectorEquipments = clonedEquipments
              .filter((eq) => {
                const parts = eq.position.split(".");
                if (parts.length < 3) return false;
                // sector positions are like "1.1"
                return `${parts[0]}.${parts[1]}` === sector.position;
              })
              .map((eq) => ({ ...eq }));

            return {
              ...sector,
              equipments: sectorEquipments.length > 0 ? sectorEquipments : null,
            };
          }) ?? null,
      }));

      return { ...prev, areas: mergedAreas };
    });
  }

  async function GetSets() {
    const resp = await GetAPI("/set", true);
    if (resp.status !== 200) return;

    // 1. Clone the raw sets so we never share references
    const clonedSets: SetProps[] = resp.body.sets.map((s: SetProps) => ({
      ...s,
    }));

    // 2. Store your baseline clone
    setOriginalSets(clonedSets);

    // 3. Merge into layoutData, cloning each level of hierarchy
    setLayoutData((prev) => {
      // if there were no areas yet, just return prev
      if (!prev.areas) return prev;

      const mergedAreas: AreaProps[] = prev.areas.map((area) => ({
        ...area,
        sectors:
          area.sectors?.map((sector) => ({
            ...sector,
            equipments:
              sector.equipments?.map((equipment) => {
                // filter & clone each set for this equipment
                const equipmentSets = clonedSets
                  .filter((set) => {
                    const parts = set.position.split(".");
                    if (parts.length < 4) return false;
                    // equipment positions are like "1.1.1"
                    return (
                      `${parts[0]}.${parts[1]}.${parts[2]}` ===
                      equipment.position
                    );
                  })
                  .map((set) => ({ ...set }));

                return {
                  ...equipment,
                  sets: equipmentSets.length > 0 ? equipmentSets : null,
                };
              }) ?? null,
          })) ?? null,
      }));

      return { ...prev, areas: mergedAreas };
    });
  }

  async function GetSubSets() {
    const resp = await GetAPI("/subset", true);
    if (resp.status !== 200) return;

    // 1. Clone the raw subsets so we never share references
    const clonedSubSets: SubSetProps[] = resp.body.subsets.map(
      (s: SubSetProps) => ({
        ...s,
      }),
    );

    // 2. Store your baseline clone
    setOriginalSubSets(clonedSubSets);

    // 3. Merge into layoutData, cloning each level of hierarchy
    setLayoutData((prev) => {
      // if there were no areas yet, just return prev
      if (!prev.areas) return prev;

      const mergedAreas: AreaProps[] = prev.areas.map((area) => ({
        ...area,
        sectors:
          area.sectors?.map((sector) => ({
            ...sector,
            equipments:
              sector.equipments?.map((equipment) => ({
                ...equipment,
                sets:
                  equipment.sets?.map((set) => {
                    // filter & clone each subset for this set
                    const setSubSets = clonedSubSets
                      .filter((subset) => {
                        const parts = subset.position.split(".");
                        if (parts.length < 5) return false; // subsets should have at least 5 parts (1.1.1.1.1)
                        // set positions are like "1.1.1.1"
                        const setPosition = set.position;
                        return subset.position.startsWith(setPosition + ".");
                      })
                      .map((subset) => ({ ...subset }));

                    return {
                      ...set,
                      subSets: setSubSets.length > 0 ? setSubSets : null,
                    };
                  }) ?? null,
              })) ?? null,
          })) ?? null,
      }));

      return { ...prev, areas: mergedAreas };
    });
  }

  async function GetCips() {
    const cipsResponse = await GetAPI("/cip", true);
    if (cipsResponse.status === 200) {
      // Clone the fetched CIPs to avoid reference issues
      const fetchedCips: CipProps[] = cipsResponse.body.cips.map(
        (cip: CipProps) => ({
          ...cip,
        }),
      );

      // Store the original CIPs
      setOriginalCips(fetchedCips);

      // Update layoutData by assigning each CIP to its proper sub-set.
      setLayoutData((prevLayout) => {
        if (!prevLayout.areas) return prevLayout;

        const updatedAreas = prevLayout.areas.map((area) => {
          if (!area.sectors) return area;
          const updatedSectors = area.sectors.map((sector) => {
            if (!sector.equipments) return sector;
            const updatedEquipments = sector.equipments.map((equipment) => {
              if (!equipment.sets) return equipment;
              const updatedSets = equipment.sets.map((set) => {
                if (!set.subSets) return set;
                const updatedSubSets = set.subSets.map((subSet) => {
                  // For every sub-set, filter the fetched CIPs whose position starts
                  // with the subSet's position + a dot.
                  const subSetCips = fetchedCips.filter((cip) => {
                    if (!cip.position || !subSet.position) return false;
                    return cip.position.startsWith(subSet.position + ".");
                  });

                  // Clone the CIPs to avoid reference issues
                  const clonedCips = subSetCips.map((cip) => ({ ...cip }));

                  return {
                    ...subSet,
                    cip: clonedCips.length > 0 ? clonedCips : null,
                  };
                });
                return {
                  ...set,
                  subSets: updatedSubSets,
                };
              });
              return {
                ...equipment,
                sets: updatedSets,
              };
            });
            return {
              ...sector,
              equipments: updatedEquipments,
            };
          });
          return {
            ...area,
            sectors: updatedSectors,
          };
        });

        return {
          ...prevLayout,
          areas: updatedAreas,
        };
      });
    }
  }

  async function GetAllData() {
    setIsGettingData(true);
    await GetAreas();
    await GetSectors();
    await GetEquipments();
    await GetSets();
    await GetSubSets();
    await GetCips();
    setIsGettingData(false);
  }

  useEffect(() => {
    GetAllData();
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
        originalEquipments,
        setOriginalEquipments,
        originalSets,
        setOriginalSets,
        originalSubSets,
        setOriginalSubSets,
        originalCips,
        setOriginalCips,
        query,
        setQuery,
        GetAreas,
        GetSectors,
        GetEquipments,
        GetSets,
        GetSubSets,
        GetCips,
        GetAllData,
        isGettingData,
        setIsGettingData,
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
