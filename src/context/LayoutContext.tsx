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
  GetAreas: () => void;
  GetSectors: () => void;
  GetEquipments: () => void;
  GetSets: () => void;
  GetSubSets: () => void;
  GetCips: () => void;
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
  const [cipCount, setCipCount] = useState(1);

  console.log("layoutData: ", layoutData);

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

  async function GetEquipments() {
    const equipments = await GetAPI("/equipment", true);
    if (equipments.status === 200) {
      // Assume equipments.body.equipments is an array of EquipmentsProps.
      const fetchedEquipments: EquipmentsProps[] = equipments.body.equipments;

      // Store all fetched equipments in originalEquipments.
      setOriginalEquipments(fetchedEquipments);

      // Now update layoutData by assigning each equipment to its proper sector.
      setLayoutData((prevLayout) => {
        if (!prevLayout.areas) return prevLayout;
        const updatedAreas = prevLayout.areas.map((area) => {
          // If the area has no sectors, nothing to update.
          if (!area.sectors) return area;
          const updatedSectors = area.sectors.map((sector) => {
            // For each sector, filter the equipments whose positions belong to this sector.
            const sectorEquipments = fetchedEquipments.filter((equipment) => {
              if (!equipment.position) return false;
              // Split the equipment.position.
              const parts = equipment.position.split(".");
              // We expect at least three parts, e.g. "1", "1", "1" for "1.1.1"
              if (parts.length < 3) return false;
              // Reconstruct the sector part of the equipment's position.
              const equipmentSectorPosition = `${parts[0]}.${parts[1]}`;
              // Return true if it matches the current sector's position.
              return equipmentSectorPosition === sector.position;
            });
            return {
              ...sector,
              // Set the equipments only if there are any; otherwise, leave as null.
              equipments: sectorEquipments.length > 0 ? sectorEquipments : null,
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

  async function GetSets() {
    const setsResponse = await GetAPI("/set", true);
    if (setsResponse.status === 200) {
      // Assume setsResponse.body.sets is an array of SetProps.
      const fetchedSets: SetProps[] = setsResponse.body.sets;

      // Store the fetched sets separately if needed.
      setOriginalSets(fetchedSets);

      // Update the layoutData state by assigning each set to its proper equipment.
      setLayoutData((prevLayout) => {
        if (!prevLayout.areas) return prevLayout;

        const updatedAreas = prevLayout.areas.map((area) => {
          if (!area.sectors) return area;

          const updatedSectors = area.sectors.map((sector) => {
            if (!sector.equipments) return sector;

            const updatedEquipments = sector.equipments.map((equipment) => {
              // For each equipment, filter the sets that belong to it.
              // We assume that if an equipment's position is "A.B.C", then
              // a set with a position like "A.B.C.X" belongs to that equipment.
              const equipmentSets = fetchedSets.filter((set) => {
                if (!set.position || !equipment.position) return false;
                return set.position.startsWith(equipment.position + ".");
              });

              return {
                ...equipment,
                sets: equipmentSets.length > 0 ? equipmentSets : null,
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

  async function GetSubSets() {
    const subSetsResponse = await GetAPI("/subset", true);
    if (subSetsResponse.status === 200) {
      // Assume subSetsResponse.body.subSets is an array of SubSetProps.
      const fetchedSubSets: SubSetProps[] = subSetsResponse.body.subsets;

      // Optionally store the fetched subsets separately.
      setOriginalSubSets(fetchedSubSets);

      // Update layoutData by assigning each subset to its proper set.
      setLayoutData((prevLayout) => {
        if (!prevLayout.areas) return prevLayout;

        const updatedAreas = prevLayout.areas.map((area) => {
          if (!area.sectors) return area;

          const updatedSectors = area.sectors.map((sector) => {
            if (!sector.equipments) return sector;

            const updatedEquipments = sector.equipments.map((equipment) => {
              if (!equipment.sets) return equipment;

              const updatedSets = equipment.sets.map((set) => {
                // For each set, filter the subsets that belong to it.
                // We assume that if a set's position is "A.B.C.D", then
                // a subset with a position like "A.B.C.D.X" belongs to that set.
                const setSubSets = fetchedSubSets.filter((subSet) => {
                  if (!subSet.position || !set.position) return false;
                  return subSet.position.startsWith(set.position + ".");
                });

                return {
                  ...set,
                  subSets: setSubSets.length > 0 ? setSubSets : null,
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

  async function GetCips() {
    const cipsResponse = await GetAPI("/cip", true);
    if (cipsResponse.status === 200) {
      // Assume cipsResponse.body.cips is an array of CipProps.
      const fetchedCips: CipProps[] = cipsResponse.body.cips;

      // Optionally store the fetched CIPs in a separate state if needed.
      // For example: setOriginalCips(fetchedCips);

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
                // For each set, update each sub-set's CIP array.
                if (!set.subSets) return set;
                const updatedSubSets = set.subSets.map((subSet) => {
                  // For every sub-set, filter the fetched CIPs whose position starts
                  // with the subSet's position + a dot.
                  const subSetCips = fetchedCips.filter((cip) => {
                    if (!cip.position || !subSet.position) return false;
                    return cip.position.startsWith(subSet.position + ".");
                  });
                  return {
                    ...subSet,
                    cip: subSetCips.length > 0 ? subSetCips : null,
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

  useEffect(() => {
    async function fetchData() {
      await GetAreas();
      await GetSectors();
      await GetEquipments();
      await GetSets();
      await GetSubSets();
      await GetCips();
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
        originalEquipments,
        setOriginalEquipments,
        originalSets,
        setOriginalSets,
        originalSubSets,
        setOriginalSubSets,
        originalCips,
        setOriginalCips,
        GetAreas,
        GetSectors,
        GetEquipments,
        GetSets,
        GetSubSets,
        GetCips,
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
