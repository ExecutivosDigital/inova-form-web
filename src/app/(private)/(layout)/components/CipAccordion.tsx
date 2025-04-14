"use client";
import {
  CipProps,
  EquipmentsProps,
  LayoutTypeProps,
  SectorProps,
  SetProps,
  SubSetProps,
} from "@/@types/LayoutTypes";
import { CustomPagination } from "@/components/global/CustomPagination";
import { Skeleton } from "@/components/global/Skeleton";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/global/ui/accordion";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/global/ui/popover";
import { ScrollArea } from "@/components/global/ui/scroll-area";
import { useApiContext } from "@/context/ApiContext";
import { useLayoutContext } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, Loader2, Search, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 } from "uuid";

interface CipAccordionProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
}

export function CipAccordion({
  selectedLayoutStep,
  setSelectedLayoutStep,
}: CipAccordionProps) {
  const {
    layoutData,
    setLayoutData,
    originalCips,
    GetCips,
    query,
    setQuery,
    isGettingData,
  } = useLayoutContext();
  const { PostAPI } = useApiContext();
  const [isImportHovered, setIsImportHovered] = useState(false);
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentsProps | null>(null);
  const [selectedSet, setSelectedSet] = useState<SetProps | null>(null);
  const [selectedSubSet, setSelectedSubSet] = useState<SubSetProps | null>(
    null,
  );
  const [equipmentPages, setEquipmentPages] = useState<number>(1);
  const [setPages, setSetPages] = useState<number>(1);
  const [subSetPages, setSubSetPages] = useState<number>(1);
  const [currentEquipmentPage, setCurrentEquipmentPage] = useState(1);
  const [currentSetPage, setCurrentSetPage] = useState(1);
  const [currentSubSetPage, setCurrentSubSetPage] = useState(1);
  const [selectedSector, setSelectedSector] = useState<SectorProps | null>(
    null,
  );
  const [isSectorNameHovered, setIsSectorNameHovered] = useState(false);
  const [isEquipmentNameHovered, setIsEquipmentNameHovered] = useState(false);
  const [isSetNameHovered, setIsSetNameHovered] = useState(false);
  const [isSubSetNameHovered, setIsSubSetNameHovered] = useState(false);
  const [cipArrayLength, setCipArrayLength] = useState(3);
  const [inputCipValues, setInputCipValues] = useState<CipProps[]>(
    Array.from({ length: cipArrayLength }, () => ({
      name: "",
      code: "",
      id: "",
      position: "",
      cip: null,
    })),
  );
  const [isCreatingCips, setIsCreatingCips] = useState(false);

  function getMaxCipCode(layoutData: LayoutTypeProps): number {
    // Start with 999 so that if no CIP exists, next will be 1000.
    let maxCode = 1000;

    // Check if there are any areas.
    if (!layoutData.areas) return maxCode;

    // Iterate over all areas, sectors, equipments, sets, and subsets.
    layoutData.areas.forEach((area) => {
      if (!area.sectors) return;
      area.sectors.forEach((sector) => {
        if (!sector.equipments) return;
        sector.equipments.forEach((equipment) => {
          if (!equipment.sets) return;
          equipment.sets.forEach((set) => {
            if (!set.subSets) return;
            set.subSets.forEach((subSet) => {
              if (subSet.cip) {
                subSet.cip.forEach((cip) => {
                  // Convert the CIP's code to a number.
                  const codeNum = Number(cip.code);
                  if (!isNaN(codeNum) && codeNum > maxCode) {
                    maxCode = codeNum;
                  }
                });
              }
            });
          });
        });
      });
    });

    return maxCode;
  }

  const handleInputChange = (
    index: number,
    field: keyof CipProps, // typically "name" when the user types in the CIP name
    value: string,
  ) => {
    // Ensure that all the required selections exist.
    if (
      !selectedSector ||
      !selectedEquipment ||
      !selectedSet ||
      !selectedSubSet
    )
      return;

    // Construct the full position for this CIP.
    // For example, if selectedSubSet.position === "1.1.3.5.2", then the first CIP is "1.1.3.5.2.1"
    const fullposition = `${selectedSubSet.position}.${index + 1}`;

    // First, update the local CIP input values for immediate UI response.
    setInputCipValues((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[index] = {
        ...updatedInputs[index],
        // When the user types, update the field (usually "name"). We do not change the code here.
        [field]: value,
      };
      return updatedInputs;
    });

    // Now update the nested layoutData.
    setLayoutData((prevLayout) => {
      if (!prevLayout.areas) return prevLayout; // Nothing to update if there are no areas.

      // We'll update the layout by traversing to the correct sub-set.
      const updatedAreas = prevLayout.areas.map((area) => {
        if (!area.sectors) return area;

        const updatedSectors = area.sectors.map((sector) => {
          if (sector.position !== selectedSector.position) return sector;

          // Clone the equipments array.
          const updatedEquipments = sector.equipments
            ? [...sector.equipments]
            : [];

          // Find the equipment.
          const equipmentIndex = updatedEquipments.findIndex(
            (equipment) => equipment.position === selectedEquipment.position,
          );
          if (equipmentIndex === -1) return sector;

          const equipment = updatedEquipments[equipmentIndex];
          // Clone the sets array.
          const updatedSets = equipment.sets ? [...equipment.sets] : [];

          // Find the matching set.
          const setIndex = updatedSets.findIndex(
            (set) => set.position === selectedSet.position,
          );
          if (setIndex === -1) return sector;

          const currentSet = updatedSets[setIndex];
          // Clone the subSets array.
          const updatedSubSets = currentSet.subSets
            ? [...currentSet.subSets]
            : [];

          // Locate the correct sub-set by its position.
          const subSetIndex = updatedSubSets.findIndex(
            (subSet) => subSet.position === selectedSubSet.position,
          );
          if (subSetIndex === -1) return sector;

          const currentSubSet = updatedSubSets[subSetIndex];

          // Clone (or start a new array) for the CIP list.
          const updatedCIPs = currentSubSet.cip ? [...currentSubSet.cip] : [];

          // Look for an existing CIP with the computed full position.
          const cipIndex = updatedCIPs.findIndex(
            (cip) => cip.position === fullposition,
          );

          if (cipIndex !== -1) {
            // CIP already exists: update the field (for example, name) with the new value.
            updatedCIPs[cipIndex] = {
              ...updatedCIPs[cipIndex],
              [field]: value,
            };
          } else {
            // CIP doesn't exist: we are adding a new one.
            // Get the next available code: if no CIP exists anywhere, getMaxCipCode returns 999, so new code becomes 1000.
            const newCIPCode = getMaxCipCode(prevLayout) + 1;
            updatedCIPs.push({
              name: field === "name" ? value : "", // set the name if the field is "name"
              code: newCIPCode.toString(),
              id: v4(), // generate a unique ID
              position: fullposition,
              // Spread any other fields if needed.
            });
          }

          // After updating the CIP array, update the sub-set.
          updatedSubSets[subSetIndex] = {
            ...currentSubSet,
            cip: updatedCIPs.length > 0 ? updatedCIPs : null,
          };
          // Update the set with the modified subSets.
          updatedSets[setIndex] = { ...currentSet, subSets: updatedSubSets };
          // Update the equipment with the modified sets.
          updatedEquipments[equipmentIndex] = {
            ...equipment,
            sets: updatedSets,
          };

          return {
            ...sector,
            equipments: updatedEquipments.length > 0 ? updatedEquipments : null,
          };
        });
        return {
          ...area,
          sectors: updatedSectors.length > 0 ? updatedSectors : [],
        };
      });

      return {
        ...prevLayout,
        areas: updatedAreas.length > 0 ? updatedAreas : [],
      };
    });

    // Finally, update the local input values to ensure the code field reflects the generated code.
    // We run this in a second setter call to ensure that the layoutData update (in the closure) is used.
    setInputCipValues((prev) => {
      const updatedInputs = [...prev];
      // Look again in the (now updated) layoutData for our CIP at fullposition.
      // (This assumes that the layoutData update is synchronous; if not, you might derive the code above.)
      // For safety, we derive the code from the current value in the input if available.
      // Alternatively, you may store the new code in a temporary variable.
      // Here we recompute the new code by calling getMaxCipCode on the global layoutData.
      const newCode = getMaxCipCode(layoutData) + 1;
      // If the current CIP input doesn't have a code yet (empty string), set it.
      if (!updatedInputs[index].code) {
        updatedInputs[index] = {
          ...updatedInputs[index],
          code: newCode.toString(),
        };
      }
      return updatedInputs;
    });
  };

  const isCipFullyFilled = (cip: CipProps) => {
    return cip.name && cip.code;
  };

  const equipmentHasFilledCIP = (equipment: EquipmentsProps): boolean => {
    return (
      equipment.sets?.some((set) =>
        set.subSets?.some((subSet) =>
          subSet.cip ? subSet.cip.some(isCipFullyFilled) : false,
        ),
      ) || false
    );
  };

  const setHasFilledCip = (set: SetProps): boolean => {
    return (
      set.subSets?.some((subSet) =>
        subSet.cip ? subSet.cip.some(isCipFullyFilled) : false,
      ) || false
    );
  };

  const subSetHasFilledCip = (subSet: SubSetProps): boolean => {
    return subSet.cip ? subSet.cip.some(isCipFullyFilled) : false;
  };

  const handleAddCip = () => {
    setCipArrayLength((prevLength) => prevLength + 1);
    setInputCipValues((prev) => [
      ...prev,
      {
        name: "",
        code: "",
        id: "",
        position: "",
        cip: null,
      },
    ]);
  };

  async function HandleCreateCips(newCip?: CipProps[]) {
    setIsCreatingCips(true);
    // If no new equipments are provided, get them by flattening the equipments from all sectors in all areas.
    const cipsToSend =
      newCip ||
      layoutData.areas?.flatMap((area) =>
        area.sectors?.flatMap((sector) =>
          sector.equipments?.flatMap((eq) =>
            eq.sets?.flatMap(
              (set) =>
                set.subSets?.flatMap((subSet) =>
                  subSet.cip?.flatMap((cip) => cip),
                ) || [],
            ),
          ),
        ),
      );

    const newCipResponse = await PostAPI(
      "/cip/multi",
      {
        cips: cipsToSend?.map((cip) => {
          // Check if the equipment has a valid position string.
          const parts = cip?.position.split(".");
          let subsetId = "";
          if (parts && parts.length >= 5) {
            // Join the first two parts to get the sector position (e.g., "1.1")
            const cipPos = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3]}.${parts[4]}`;

            // Flatten all sectors from all areas and find the matching sector.
            const subSet = layoutData.areas
              ?.flatMap(
                (area) =>
                  area.sectors?.flatMap(
                    (sector) =>
                      sector.equipments?.flatMap(
                        (eq) =>
                          eq.sets?.flatMap((set) => set.subSets || []) || [],
                      ) || [],
                  ) || [],
              )
              .find((subSet) => subSet.position === cipPos);

            // Get the sector's id, or leave it as an empty string if not found.
            subsetId = subSet?.id as string;
          }

          return {
            name: cip?.name,
            code: cip?.code,
            position: cip?.position,
            subsetId,
          };
        }),
      },
      true,
    );
    if (newCipResponse.status === 200) {
      toast.success("CIPs cadastrados com sucesso");
      await GetCips(); // re-fetch areas from the API
      setSelectedLayoutStep(7);
      return setIsCreatingCips(false);
    }
    toast.error("Erro ao cadastrar CIPs");
    return setIsCreatingCips(false);
  }

  useEffect(() => {
    if (!layoutData.areas) return;

    if (selectedSet) {
      // Filter the subSets for the selected set using the query (e.g., by name).
      const allSubSets = selectedSet.subSets || [];
      const filteredSubSets = query
        ? allSubSets.filter((subSet) =>
            subSet.name.toLowerCase().includes(query.toLowerCase()),
          )
        : allSubSets;
      setSubSetPages(
        filteredSubSets.length > 0 ? Math.ceil(filteredSubSets.length / 6) : 1,
      );
    } else if (selectedEquipment) {
      // Filter the sets for the selected equipment using the query.
      const allSets = selectedEquipment.sets || [];
      const filteredSets = query
        ? allSets.filter((set) =>
            set.name.toLowerCase().includes(query.toLowerCase()),
          )
        : allSets;
      setSetPages(
        filteredSets.length > 0 ? Math.ceil(filteredSets.length / 6) : 1,
      );
    } else if (selectedSector) {
      // Filter the equipments within the selected sector using the query.
      const allEquipments = selectedSector.equipments || [];
      const filteredEquipments = query
        ? allEquipments.filter((equipment) =>
            equipment.name.toLowerCase().includes(query.toLowerCase()),
          )
        : allEquipments;
      setEquipmentPages(
        filteredEquipments.length > 0
          ? Math.ceil(filteredEquipments.length / 12)
          : 1,
      );
    } else {
      // Fallback: flatten all equipments across all areas, filter by query,
      // and calculate pages with 12 items per page.
      const allEquipments = layoutData.areas.flatMap((area) =>
        area.sectors
          ? area.sectors.flatMap((sector) => sector.equipments || [])
          : [],
      );
      const filteredEquipments = query
        ? allEquipments.filter((equipment) =>
            equipment.name.toLowerCase().includes(query.toLowerCase()),
          )
        : allEquipments;
      setEquipmentPages(
        filteredEquipments.length > 0
          ? Math.ceil(filteredEquipments.length / 12)
          : 1,
      );
    }
  }, [layoutData.areas, selectedSet, selectedEquipment, selectedSector, query]);

  useEffect(() => {
    if (!selectedSubSet) return;

    // Find the most up-to-date sub-set within layoutData that matches selectedSubSet's position.
    let currentSubSet: SubSetProps = {
      position: "",
      cip: [],
      id: "",
      name: "",
      code: "",
    };
    layoutData.areas?.forEach((area) => {
      area.sectors?.forEach((sector) => {
        sector.equipments?.forEach((equipment) => {
          equipment.sets?.forEach((set) => {
            set.subSets?.forEach((subSet) => {
              if (subSet.position === selectedSubSet.position) {
                currentSubSet = subSet;
              }
            });
          });
        });
      });
    });

    // If we found an up-to-date sub-set, use its cip array.
    let newCipInputs: CipProps[] = [];
    if (currentSubSet && currentSubSet.cip && currentSubSet.cip.length > 0) {
      newCipInputs = currentSubSet.cip;
    } else {
      // No CIPs exist yet: create default inputs with sequential codes.
      newCipInputs = Array.from({ length: cipArrayLength }, (_, i) => ({
        name: "",
        code: "", // leave the code blank initially
        id: "",
        position: `${selectedSubSet.position}.${i + 1}`,
      }));
    }
    setInputCipValues(newCipInputs);
  }, [layoutData, selectedSubSet, cipArrayLength]);

  return (
    <AccordionItem value="6" onClick={() => setSelectedLayoutStep(6)}>
      <AccordionTrigger arrow>
        {isGettingData ? (
          <Skeleton className="h-10" />
        ) : (
          <div className="flex w-full items-center justify-between">
            <div className="text-primary flex items-center gap-2 text-base font-bold md:gap-4 md:text-2xl">
              <span>1.6</span>
              <div className="flex flex-col">
                <span className="leading-6">Cadastramento de CIP?</span>
                <span
                  className={cn(
                    "w-max text-xs font-normal text-neutral-500 md:text-sm",
                    selectedLayoutStep !== 6 && "hidden",
                  )}
                >
                  O que é um Subconjunto? Explicitar
                </span>
              </div>
            </div>
            {selectedLayoutStep === 6 && selectedSubSet === null && (
              <div className="flex items-center gap-4">
                <Popover
                  open={isImportHovered}
                  onOpenChange={setIsImportHovered}
                >
                  <PopoverTrigger
                    asChild
                    onMouseEnter={() => setIsImportHovered(true)}
                    onMouseLeave={() => setIsImportHovered(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImportHovered(false);
                    }}
                    onBlur={() => setIsImportHovered(false)}
                  >
                    <div className="bg-primary flex h-6 items-center gap-2 rounded-full p-1 text-sm font-semibold text-white md:h-10 md:p-2">
                      <Upload className="h-4 md:h-8" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-max bg-white p-1 text-sm">
                    <PopoverArrow className="fill-neutral-300" />
                    <span>Importar Planilhas</span>
                  </PopoverContent>
                </Popover>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentCips =
                      layoutData.areas?.flatMap(
                        (area) =>
                          area.sectors?.flatMap(
                            (sector) =>
                              sector.equipments?.flatMap(
                                (eq) =>
                                  eq.sets?.flatMap(
                                    (set) =>
                                      set.subSets?.flatMap(
                                        (subSet) =>
                                          subSet.cip?.flatMap((cip) => cip) ||
                                          [],
                                      ) || [],
                                  ) || [],
                              ) || [],
                          ) || [],
                      ) || [];

                    let newCips: CipProps[] = [];
                    if (originalCips) {
                      newCips = currentCips.filter(
                        (subset) =>
                          !originalCips.find(
                            (original) => original.position === subset.position,
                          ),
                      );
                    } else {
                      newCips = currentCips;
                    }
                    if (newCips.length > 0) {
                      HandleCreateCips(newCips);
                    } else {
                      setSelectedLayoutStep(7);
                    }
                  }}
                  className="bg-primary flex h-6 items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-white md:h-10 md:px-4"
                >
                  {isCreatingCips ? (
                    <>
                      <span className="hidden md:block">Salvando...</span>
                      <Loader2 className="h-4 animate-spin md:h-8" />
                    </>
                  ) : (
                    <>
                      <span className="hidden md:block">
                        Próximo Cadastramento
                      </span>
                      <ArrowRight className="h-4 md:h-8" />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </AccordionTrigger>
      <AccordionContent>
        <div
          className={cn(
            "grid grid-cols-4 gap-2 border-t border-neutral-300 p-2 md:gap-4 md:p-4",
            selectedEquipment && "grid-cols-3",
            selectedSubSet && "px-0",
          )}
        >
          {isGettingData ? (
            [...Array(12)].map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton />
              </div>
            ))
          ) : selectedSubSet ? (
            <div className="col-span-3 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2 px-2 md:px-4">
                <button
                  onClick={() => setSelectedSubSet(null)}
                  className="text-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.35)] md:h-12 md:w-12"
                >
                  <ChevronLeft />
                </button>
                <Popover
                  open={isSectorNameHovered}
                  onOpenChange={setIsSectorNameHovered}
                >
                  <PopoverTrigger
                    asChild
                    onMouseEnter={() => setIsSectorNameHovered(true)}
                    onMouseLeave={() => setIsSectorNameHovered(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSectorNameHovered(false);
                    }}
                    onBlur={() => setIsSectorNameHovered(false)}
                  >
                    <label
                      className={cn(
                        "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedSector?.position}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                          "text-white",
                        )}
                        placeholder="Nome da Área"
                        value={selectedSector?.name}
                        disabled
                      />

                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                        )}
                      />
                    </label>
                  </PopoverTrigger>
                  <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                    <PopoverArrow className="fill-neutral-300" />
                    <span>
                      {layoutData.areas
                        ?.flatMap((area) => area.sectors || []) // Flatten the sectors into an array
                        ?.find(
                          (sector) =>
                            sector.position ===
                            selectedEquipment?.position.slice(0, 3),
                        )?.name || ""}
                    </span>
                  </PopoverContent>
                </Popover>
                <Popover
                  open={isEquipmentNameHovered}
                  onOpenChange={setIsEquipmentNameHovered}
                >
                  <PopoverTrigger
                    asChild
                    onMouseEnter={() => setIsEquipmentNameHovered(true)}
                    onMouseLeave={() => setIsEquipmentNameHovered(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEquipmentNameHovered(false);
                    }}
                    onBlur={() => setIsEquipmentNameHovered(false)}
                  >
                    <label
                      className={cn(
                        "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedEquipment?.position}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                          "text-white",
                        )}
                        placeholder="Nome da Área"
                        value={selectedEquipment?.name}
                        disabled
                      />

                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                        )}
                      />
                    </label>
                  </PopoverTrigger>
                  <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                    <PopoverArrow className="fill-neutral-300" />
                    <span>{selectedEquipment?.name}</span>
                  </PopoverContent>
                </Popover>
                <Popover
                  open={isSetNameHovered}
                  onOpenChange={setIsSetNameHovered}
                >
                  <PopoverTrigger
                    asChild
                    onMouseEnter={() => setIsSetNameHovered(true)}
                    onMouseLeave={() => setIsSetNameHovered(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSetNameHovered(false);
                    }}
                    onBlur={() => setIsSetNameHovered(false)}
                  >
                    <label
                      className={cn(
                        "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedSet?.position}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                          "text-white",
                        )}
                        placeholder="Nome da Área"
                        value={selectedSet?.name}
                        disabled
                      />

                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                        )}
                      />
                    </label>
                  </PopoverTrigger>
                  <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                    <PopoverArrow className="fill-neutral-300" />
                    <span>{selectedSet?.name}</span>
                  </PopoverContent>
                </Popover>
                <Popover
                  open={isSubSetNameHovered}
                  onOpenChange={setIsSubSetNameHovered}
                >
                  <PopoverTrigger
                    asChild
                    onMouseEnter={() => setIsSubSetNameHovered(true)}
                    onMouseLeave={() => setIsSubSetNameHovered(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSubSetNameHovered(false);
                    }}
                    onBlur={() => setIsSubSetNameHovered(false)}
                  >
                    <label
                      className={cn(
                        "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedSubSet?.position}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                          "text-white",
                        )}
                        placeholder="Nome da Área"
                        value={selectedSubSet?.name}
                        disabled
                      />

                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                        )}
                      />
                    </label>
                  </PopoverTrigger>
                  <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                    <PopoverArrow className="fill-neutral-300" />
                    <span>{selectedSubSet?.name}</span>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex h-60 w-full flex-col">
                <ScrollArea className="h-full">
                  {[...Array(cipArrayLength)].map((_, index) => (
                    <div
                      key={index}
                      className="col-span-3 mb-1 flex items-end justify-between gap-2 px-2 md:gap-4 md:px-4"
                    >
                      <div
                        className={cn(
                          "text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl bg-white font-bold shadow-[0px_2px_7px_rgba(0,0,0,0.15)] md:h-12 md:w-12 md:min-w-12",
                        )}
                      >
                        <span>{index + 1}.</span>
                      </div>

                      <div className="flex w-full flex-col">
                        <span className="text-primary text-xs md:text-sm">
                          Código (CIP)
                        </span>
                        <input
                          type="text"
                          className="h-10 w-full rounded-2xl bg-white p-2 px-2 text-xs shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4 md:text-sm"
                          placeholder="Código Preenchido automaticamente"
                          onChange={(e) =>
                            handleInputChange(index, "code", e.target.value)
                          }
                          value={inputCipValues[index]?.code || ""}
                          disabled
                        />
                      </div>

                      <div className="flex w-full flex-col">
                        <span className="text-primary text-xs md:text-sm">
                          Nome do Ponto
                        </span>
                        <input
                          type="text"
                          className="h-10 w-full rounded-2xl bg-white p-2 px-2 text-xs shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4 md:text-sm"
                          placeholder="Identificação do Subconjunto"
                          onChange={(e) =>
                            handleInputChange(index, "name", e.target.value)
                          }
                          value={inputCipValues[index]?.name || ""}
                        />
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <div className="flex w-full items-center justify-between gap-2 px-2 md:px-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddCip();
                  }}
                  className={cn(
                    "bg-primary h-10 w-max self-end rounded-full px-2 font-bold text-white md:h-12 md:px-4",
                  )}
                >
                  + Cadastrar CIP
                </button>
                <button
                  onClick={() => setSelectedSubSet(null)}
                  className="h-10 w-40 rounded-xl bg-green-500 p-2 text-sm text-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)]"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : selectedSet ? (
            <>
              <div className="col-span-3 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSet(null)}
                    className="text-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.35)] md:h-12 md:w-12"
                  >
                    <ChevronLeft />
                  </button>
                  <Popover
                    open={isSectorNameHovered}
                    onOpenChange={setIsSectorNameHovered}
                  >
                    <PopoverTrigger
                      asChild
                      onMouseEnter={() => setIsSectorNameHovered(true)}
                      onMouseLeave={() => setIsSectorNameHovered(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSectorNameHovered(false);
                      }}
                      onBlur={() => setIsSectorNameHovered(false)}
                    >
                      <label
                        className={cn(
                          "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                          "bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                            "bg-white/20 text-white",
                          )}
                        >
                          {selectedSector?.position}
                        </span>
                        <input
                          className={cn(
                            "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                            "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={selectedSector?.name}
                          disabled
                        />

                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                          )}
                        />
                      </label>
                    </PopoverTrigger>
                    <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                      <PopoverArrow className="fill-neutral-300" />
                      <span>
                        {layoutData.areas
                          ?.flatMap((area) => area.sectors || []) // Flatten the sectors into an array
                          ?.find(
                            (sector) =>
                              sector.position ===
                              selectedEquipment?.position.slice(0, 3),
                          )?.name || ""}
                      </span>
                    </PopoverContent>
                  </Popover>
                  <Popover
                    open={isEquipmentNameHovered}
                    onOpenChange={setIsEquipmentNameHovered}
                  >
                    <PopoverTrigger
                      asChild
                      onMouseEnter={() => setIsEquipmentNameHovered(true)}
                      onMouseLeave={() => setIsEquipmentNameHovered(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEquipmentNameHovered(false);
                      }}
                      onBlur={() => setIsEquipmentNameHovered(false)}
                    >
                      <label
                        className={cn(
                          "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                          "bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                            "bg-white/20 text-white",
                          )}
                        >
                          {selectedEquipment?.position}
                        </span>
                        <input
                          className={cn(
                            "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                            "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={selectedEquipment?.name}
                          disabled
                        />

                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                          )}
                        />
                      </label>
                    </PopoverTrigger>
                    <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                      <PopoverArrow className="fill-neutral-300" />
                      <span>{selectedEquipment?.name}</span>
                    </PopoverContent>
                  </Popover>
                  <Popover
                    open={isSetNameHovered}
                    onOpenChange={setIsSetNameHovered}
                  >
                    <PopoverTrigger
                      asChild
                      onMouseEnter={() => setIsSetNameHovered(true)}
                      onMouseLeave={() => setIsSetNameHovered(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSetNameHovered(false);
                      }}
                      onBlur={() => setIsSetNameHovered(false)}
                    >
                      <label
                        className={cn(
                          "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                          "bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                            "bg-white/20 text-white",
                          )}
                        >
                          {selectedSet?.position}
                        </span>
                        <input
                          className={cn(
                            "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                            "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={selectedSet?.name}
                          disabled
                        />

                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                          )}
                        />
                      </label>
                    </PopoverTrigger>
                    <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                      <PopoverArrow className="fill-neutral-300" />
                      <span>{selectedEquipment?.name}</span>
                    </PopoverContent>
                  </Popover>
                </div>
                <label className="border-primary relative flex h-8 w-60 items-center rounded-md border">
                  <input
                    className="transparent placeholder:neutral-300 absolute left-0 h-full w-[calc(100%-2rem)] rounded-md px-4 focus:outline-none"
                    placeholder="Buscar Conjunto"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="bg-primary absolute right-0 flex h-full w-8 items-center justify-center">
                    <Search size={12} />
                  </div>
                </label>
              </div>
              {layoutData.areas
                ?.flatMap((area) => area.sectors || [])
                ?.flatMap((sector) => sector.equipments || [])
                ?.flatMap((eq) => eq.sets || [])
                ?.find((set) => set.position === selectedSet?.position)
                ?.subSets?.filter((subSet) =>
                  subSet.name.toLowerCase().includes(query.toLowerCase()),
                )
                .slice((currentSubSetPage - 1) * 6, currentSubSetPage * 6)
                .map((subSet, index) => (
                  <div key={index + "subSet"} className="flex flex-col gap-2">
                    <span className="text-primary text-xs md:text-sm">
                      {subSet.name}
                    </span>
                    <label
                      onClick={() => {
                        setSelectedSubSet(subSet);
                        setQuery("");
                      }} // Select a subSet on click
                      className={cn(
                        "relative flex h-10 items-center justify-end rounded-2xl px-2 md:h-12 md:px-4",
                        subSetHasFilledCip(subSet) ? "bg-primary" : "",
                      )}
                    >
                      <input
                        className={cn(
                          "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                          subSetHasFilledCip(subSet) ? "text-white" : "",
                        )}
                        placeholder="TAG do Subconjunto"
                        value={subSet.name}
                        readOnly
                      />
                      <Image
                        src="/icons/equipment.png"
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 object-contain transition duration-200 peer-focus:translate-x-2 peer-focus:opacity-0",
                          subSetHasFilledCip(subSet)
                            ? "opacity-0"
                            : "peer-focus:translate-x-2 peer-focus:opacity-0",
                        )}
                      />
                      <Image
                        src={
                          subSetHasFilledCip(subSet)
                            ? "/icons/checkCheckWhite.png"
                            : "/icons/checkCheck.png"
                        }
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                          subSetHasFilledCip(subSet)
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          subSetHasFilledCip(subSet)
                            ? "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]"
                            : "",
                        )}
                      />
                    </label>
                  </div>
                ))}
            </>
          ) : selectedEquipment ? (
            <>
              <div className="col-span-3 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEquipment(null)}
                    className="text-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.35)] md:h-12 md:w-12"
                  >
                    <ChevronLeft />
                  </button>
                  <Popover
                    open={isSectorNameHovered}
                    onOpenChange={setIsSectorNameHovered}
                  >
                    <PopoverTrigger
                      asChild
                      onMouseEnter={() => setIsSectorNameHovered(true)}
                      onMouseLeave={() => setIsSectorNameHovered(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSectorNameHovered(false);
                      }}
                      onBlur={() => setIsSectorNameHovered(false)}
                    >
                      <label
                        className={cn(
                          "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                          "bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                            "bg-white/20 text-white",
                          )}
                        >
                          {selectedSector?.position}
                        </span>
                        <input
                          className={cn(
                            "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                            "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={selectedSector?.name}
                          disabled
                        />

                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                          )}
                        />
                      </label>
                    </PopoverTrigger>
                    <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                      <PopoverArrow className="fill-neutral-300" />
                      <span>
                        {layoutData.areas
                          ?.flatMap((area) => area.sectors || []) // Flatten the sectors into an array
                          ?.find(
                            (sector) =>
                              sector.position ===
                              selectedEquipment?.position.slice(0, 3),
                          )?.name || ""}
                      </span>
                    </PopoverContent>
                  </Popover>
                  <Popover
                    open={isEquipmentNameHovered}
                    onOpenChange={setIsEquipmentNameHovered}
                  >
                    <PopoverTrigger
                      asChild
                      onMouseEnter={() => setIsEquipmentNameHovered(true)}
                      onMouseLeave={() => setIsEquipmentNameHovered(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEquipmentNameHovered(false);
                      }}
                      onBlur={() => setIsEquipmentNameHovered(false)}
                    >
                      <label
                        className={cn(
                          "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                          "bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                            "bg-white/20 text-white",
                          )}
                        >
                          {selectedEquipment.position}
                        </span>
                        <input
                          className={cn(
                            "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                            "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={selectedEquipment.name}
                          disabled
                        />

                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                          )}
                        />
                      </label>
                    </PopoverTrigger>
                    <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                      <PopoverArrow className="fill-neutral-300" />
                      <span>{selectedEquipment.name}</span>
                    </PopoverContent>
                  </Popover>
                </div>
                <label className="border-primary relative flex h-8 w-60 items-center rounded-md border">
                  <input
                    className="transparent placeholder:neutral-300 absolute left-0 h-full w-[calc(100%-2rem)] rounded-md px-4 focus:outline-none"
                    placeholder="Buscar Conjunto"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="bg-primary absolute right-0 flex h-full w-8 items-center justify-center">
                    <Search size={12} />
                  </div>
                </label>
              </div>
              {layoutData.areas
                ?.flatMap((area) => area.sectors || [])
                ?.flatMap((sector) => sector.equipments || [])
                ?.find((eq) => eq.position === selectedEquipment.position)
                ?.sets?.filter((set) =>
                  set.name.toLowerCase().includes(query.toLowerCase()),
                )
                .slice((currentSubSetPage - 1) * 6, currentSubSetPage * 6)
                .map((item, index) => (
                  <div key={index + "set"} className="flex flex-col gap-2">
                    <span className="text-primary text-xs md:text-sm">
                      {item.name}
                    </span>
                    <label
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSet(item);
                        setCurrentEquipmentPage(1);
                        setCurrentSetPage(1);
                        setCurrentSubSetPage(1);
                        setQuery("");
                      }}
                      className={cn(
                        "relative flex h-10 items-center justify-end rounded-2xl px-2 md:h-12 md:px-4",
                        setHasFilledCip(item) && "bg-primary",
                      )}
                    >
                      <input
                        className={cn(
                          "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                          setHasFilledCip(item) && "text-white",
                        )}
                        placeholder="TAG do Equipamento"
                        value={item.name}
                        readOnly
                      />
                      <Image
                        src="/icons/equipment.png"
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 object-contain transition duration-200 peer-focus:translate-x-2 peer-focus:opacity-0",
                          setHasFilledCip(item) && "opacity-0",
                        )}
                      />
                      <Image
                        src={"/icons/checkCheckWhite.png"}
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                          setHasFilledCip(item) && "translate-x-0 opacity-100",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          setHasFilledCip(item) &&
                            "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                        )}
                      />
                    </label>
                  </div>
                ))}
            </>
          ) : (
            <>
              <div className="col-span-4 flex flex-col gap-2">
                <label className="border-primary relative flex h-8 w-60 items-center rounded-md border">
                  <input
                    className="transparent placeholder:neutral-300 absolute left-0 h-full w-[calc(100%-2rem)] rounded-md px-4 focus:outline-none"
                    placeholder="Buscar Equipamento"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="bg-primary absolute right-0 flex h-full w-8 items-center justify-center">
                    <Search size={12} />
                  </div>
                </label>
              </div>
              {layoutData.areas &&
                layoutData.areas
                  .flatMap((area) => area.sectors || [])
                  .flatMap((sector) => sector.equipments || [])
                  .filter((item) =>
                    item.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .slice(
                    (currentEquipmentPage - 1) * 12,
                    currentEquipmentPage * 12,
                  )
                  .map((item, index) => (
                    <div
                      key={index + "equipment"}
                      className="flex flex-col gap-2"
                    >
                      <label
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSector(
                            layoutData.areas
                              ?.flatMap((area) => area.sectors || []) // Flatten the sectors into an array
                              ?.find(
                                (sector) =>
                                  sector.position === item.position.slice(0, 3),
                              ) as SectorProps,
                          );
                          setCurrentEquipmentPage(1);
                          setCurrentSetPage(1);
                          setCurrentSubSetPage(1);
                          setSelectedEquipment(item);
                          setQuery("");
                        }}
                        className={cn(
                          "relative flex h-10 cursor-pointer items-center justify-start rounded-2xl md:h-12",
                          equipmentHasFilledCIP(item) && "bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12",
                            equipmentHasFilledCIP(item) &&
                              "bg-white/20 text-white",
                          )}
                        >
                          {item.position}
                        </span>
                        <input
                          className={cn(
                            "peer transparent absolute right-0 h-full w-[calc(100%-2.5rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:w-[calc(100%-3rem)] md:px-4 md:text-sm",
                            equipmentHasFilledCIP(item) && "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={item.name}
                          disabled
                        />

                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            equipmentHasFilledCIP(item) &&
                              "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          )}
                        />
                      </label>
                    </div>
                  ))}
            </>
          )}
          {isGettingData ? (
            <Skeleton />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!selectedEquipment) {
                  setSelectedLayoutStep(3);
                } else if (selectedEquipment && !selectedSet) {
                  setSelectedLayoutStep(4);
                } else if (
                  selectedEquipment &&
                  selectedSet &&
                  !selectedSubSet
                ) {
                  setSelectedLayoutStep(5);
                }
              }}
              className={cn(
                "bg-primary flex h-10 w-full items-center justify-center gap-1 self-end rounded-full px-1 font-bold text-white md:px-4",
                selectedSubSet && "hidden",
              )}
            >
              <p className="text-xs md:text-sm">+</p>
              <p className="hidden md:block">
                Cadastrar{" "}
                {selectedSet
                  ? " Subconjunto"
                  : selectedEquipment
                    ? " Conjunto"
                    : " Equipamento"}
              </p>
            </button>
          )}
        </div>
        {isGettingData ? (
          <Skeleton className="ml-auto w-80" />
        ) : (
          <div className={cn(selectedSubSet && "hidden")}>
            <CustomPagination
              currentPage={
                selectedSet
                  ? currentSubSetPage
                  : selectedEquipment
                    ? currentSetPage
                    : currentEquipmentPage
              }
              setCurrentPage={
                selectedSet
                  ? setCurrentSubSetPage
                  : selectedEquipment
                    ? setCurrentSetPage
                    : setCurrentEquipmentPage
              }
              pages={
                selectedSet
                  ? subSetPages
                  : selectedEquipment
                    ? setPages
                    : equipmentPages
              }
            />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
