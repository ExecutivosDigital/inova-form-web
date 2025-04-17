"use client";
import { EquipmentsProps, SectorProps, SetProps } from "@/@types/LayoutTypes";
import { CustomPagination } from "@/components/global/CustomPagination";
import { Skeleton } from "@/components/global/Skeleton";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/global/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/global/ui/dropdown-menu";
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
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import {
  ArrowRight,
  ChevronLeft,
  Loader2,
  Search,
  Trash,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 } from "uuid";
import { SetTemplateSheet } from "./SetTemplateSheet";

interface SetAccordionProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
}

export function SetAccordion({
  selectedLayoutStep,
  setSelectedLayoutStep,
}: SetAccordionProps) {
  const {
    layoutData,
    setLayoutData,
    originalSets,
    GetSets,
    query,
    setQuery,
    isGettingData,
  } = useLayoutContext();
  const { PostAPI, PutAPI, DeleteAPI } = useApiContext();
  const [selectedSector, setSelectedSector] = useState<SectorProps | null>(
    null,
  );
  const [sectorsPages, setSectorsPages] = useState<number>(1);
  const [equipmentPages, setEquipmentPages] = useState<number>(1);
  const [currentSectorPage, setCurrentSectorPage] = useState(1);
  const [currentEquipmentPage, setCurrentEquipmentPage] = useState(1);
  const [setsArrayLength, setSetsArrayLength] = useState(3);
  const [inputSetsValues, setInputSetsValues] = useState<SetProps[]>(() =>
    Array.from({ length: setsArrayLength }, () => ({
      name: "",
      code: "",
      id: "",
      position: "",
      subSets: null,
    })),
  );
  const [isSectorNameHovered, setIsSectorNameHovered] = useState(false);
  const [isEquipmentNameHovered, setIsEquipmentNameHovered] = useState(false);
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentsProps | null>(null);
  const [isModifyingSets, setIsModifyingSets] = useState(false);
  const [isSetTemplateSheetOpen, setIsSetTemplateSheetOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const allSets =
    layoutData.areas
      ?.flatMap((area) => area.sectors || [])
      .flatMap(
        (sector) => sector.equipments?.flatMap((eq) => eq.sets || []) || [],
      ) || [];
  const hasAnySets = allSets.length > 0;

  const isSetFullyFilled = (set: SetProps | undefined) => {
    return set?.name && set?.code;
  };

  const handleAddSet = () => {
    setSetsArrayLength((prevLength) => prevLength + 1);
    setInputSetsValues((prev) => [
      ...prev,
      {
        name: "",
        code: "",
        id: "",
        position: "",
        subSets: null,
      },
    ]);
  };

  const handleInputChange = (
    index: number,
    field: keyof SetProps,
    value: string,
  ) => {
    if (!selectedSector || !selectedEquipment) return;

    setInputSetsValues((prev) => {
      const updatedInputs = [...prev];
      // Create new set if it doesn't exist
      if (!updatedInputs[index]) {
        updatedInputs[index] = {
          name: "",
          code: "",
          id: "",
          position: "",
          subSets: null,
        };
      }

      // Update the specific field
      updatedInputs[index] = {
        ...updatedInputs[index],
        [field]: value,
      };

      // Recalculate positions for all sets
      return updatedInputs.map((set, idx) => ({
        ...set,
        position: `${selectedEquipment.position}.${idx + 1}`,
      }));
    });

    // Update layout data
    setLayoutData((prevLayout) => {
      if (!prevLayout.areas) return prevLayout;

      const updatedAreas = prevLayout.areas.map((area) => {
        if (!area.sectors) return area;

        const updatedSectors = area.sectors.map((sector) => {
          if (sector.position !== selectedSector.position) return sector;

          const updatedEquipments = sector.equipments?.map((equipment) => {
            if (equipment.position !== selectedEquipment.position)
              return equipment;

            // Get current sets and update them
            const currentSets = equipment.sets || [];
            const updatedSets = [...currentSets];

            // Update or add the set at the correct index
            if (!updatedSets[index]) {
              updatedSets[index] = {
                name: "",
                code: "",
                id: v4(),
                position: `${selectedEquipment.position}.${index + 1}`,
                subSets: null,
              };
            }

            updatedSets[index] = {
              ...updatedSets[index],
              [field]: value,
              position: `${selectedEquipment.position}.${index + 1}`,
            };

            // Recalculate all positions
            const finalSets = updatedSets.map((set, idx) => ({
              ...set,
              position: `${selectedEquipment.position}.${idx + 1}`,
            }));

            return {
              ...equipment,
              sets: finalSets,
            };
          });

          return {
            ...sector,
            equipments: updatedEquipments || null,
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
  };

  const handleRemoveSet = (indexToRemove: number) => {
    if (!selectedSector || !selectedEquipment) return;

    setInputSetsValues((prev) => {
      const updatedSets = prev.filter((_, idx) => idx !== indexToRemove);
      // Recalculate positions for remaining sets
      return updatedSets.map((set, idx) => ({
        ...set,
        position: `${selectedEquipment.position}.${idx + 1}`,
      }));
    });

    setLayoutData((prevLayout) => {
      if (!prevLayout.areas) return prevLayout;

      const updatedAreas = prevLayout.areas.map((area) => {
        if (!area.sectors) return area;

        const updatedSectors = area.sectors.map((sector) => {
          if (sector.position !== selectedSector.position) return sector;

          const updatedEquipments = sector.equipments?.map((equipment) => {
            if (equipment.position !== selectedEquipment.position)
              return equipment;

            const updatedSets =
              equipment.sets?.filter((_, idx) => idx !== indexToRemove) || [];
            // Recalculate positions for remaining sets
            const finalSets = updatedSets.map((set, idx) => ({
              ...set,
              position: `${selectedEquipment.position}.${idx + 1}`,
            }));

            return {
              ...equipment,
              sets: finalSets.length > 0 ? finalSets : null,
            };
          });

          return {
            ...sector,
            equipments: updatedEquipments || null,
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
  };

  const handleSelectEquipment = (equipment: EquipmentsProps) => {
    setSelectedEquipment(equipment);
    // Reset pagination for sets on equipment change:
    setEquipmentPages(1);

    // Properly reset set values
    if (equipment.sets && equipment.sets.length > 0) {
      // Copy the existing sets
      const updatedSetValues = equipment.sets.map((set) => ({ ...set }));

      setInputSetsValues(updatedSetValues);
      setSetsArrayLength(equipment.sets.length);
      // Simplified pagination calculation (if 6 items per page is desired)
      setEquipmentPages(Math.ceil(equipment.sets.length / 6));
    } else {
      // Initialize with default set structure
      const defaultLength = 3;
      setInputSetsValues(
        Array(defaultLength).fill({
          name: "",
          code: "",
          id: "",
          position: "",
          subSets: null,
        }),
      );
      setSetsArrayLength(defaultLength);
    }
    // Consider if this should be "setCurrentSetPage" rather than "setCurrentSectorPage" for clarity
    setCurrentSectorPage(1);
  };

  async function HandleCreateSets(newSets?: SetProps[]) {
    setIsModifyingSets(true);
    // If no new equipments are provided, get them by flattening the equipments from all sectors in all areas.
    const setsToSend =
      newSets ||
      layoutData.areas?.flatMap((area) =>
        area.sectors?.flatMap((sector) =>
          sector.equipments?.flatMap((eq) => eq.sets),
        ),
      );

    const newSetResponse = await PostAPI(
      "/set/multi",
      {
        sets: setsToSend?.map((set) => {
          // Check if the equipment has a valid position string.
          const parts = set?.position.split(".");
          let equipmentId = "";
          if (parts && parts.length >= 3) {
            // Join the first two parts to get the sector position (e.g., "1.1")
            const equipmentSectorPos = `${parts[0]}.${parts[1]}.${parts[2]}`;

            // Flatten all sectors from all areas and find the matching sector.
            const equipment = layoutData.areas
              ?.flatMap(
                (area) =>
                  area.sectors?.flatMap((sector) => sector.equipments || []) ||
                  [],
              )
              .find((eq) => eq.position === equipmentSectorPos);

            // Get the sector's id, or leave it as an empty string if not found.
            equipmentId = equipment?.id as string;
          }

          return {
            name: set?.name,
            code: set?.code,
            position: set?.position,
            equipmentId,
          };
        }),
      },
      true,
    );
    if (newSetResponse.status === 200) {
      toast.success("Conjuntos cadastrados com sucesso");
      await GetSets(); // re-fetch areas from the API
      setSelectedLayoutStep(5);
      return setIsModifyingSets(false);
    }
    toast.error("Erro ao cadastrar Conjuntos");
    return setIsModifyingSets(false);
  }

  async function HandleUpdateSets(modifiedSets: SetProps[]) {
    if (modifiedSets.length === 0) return;
    setIsModifyingSets(true);

    const editedSets = await PutAPI(
      "/set/multi",
      {
        sets: modifiedSets.map((set) => {
          const orig = originalSets?.find((o) => o.position === set.position);
          return {
            name: set.name,
            position: set.position,
            code: set.code,
            setId: orig?.id ?? set.id,
          };
        }),
      },
      true,
    );

    if (editedSets.status === 200) {
      toast.success("Conjuntos atualizados com sucesso");
      await GetSets();
      setSelectedLayoutStep(5);
    } else {
      toast.error("Erro ao atualizar Conjuntos");
    }

    setIsModifyingSets(false);
  }

  async function HandleDeleteSets(modifiedSets: SetProps[]) {
    if (modifiedSets.length === 0) return;
    setIsModifyingSets(true);
    const ids = modifiedSets.map((sector) => sector.id).join(",");
    const deletedSets = await DeleteAPI(`/set?sets=${ids}`, true);
    if (deletedSets.status === 200) {
      toast.success("Conjuntos deletados com sucesso");
      await GetSets();
      setSelectedLayoutStep(5);
    } else {
      toast.error("Erro ao deletar as Conjuntos");
    }
    return setIsModifyingSets(false);
  }

  const HandleNextStep = () => {
    // 1. Grab your flat list of current sets, filtering out empty sets
    const currentSets: SetProps[] =
      layoutData.areas?.flatMap(
        (area) =>
          area.sectors?.flatMap(
            (sector) =>
              sector.equipments?.flatMap(
                (eq) =>
                  // Only include sets that have both name and code
                  eq.sets?.filter((set) => set.name && set.code) || [],
              ) || [],
          ) || [],
      ) || [];

    // 2. Original baseline from context
    const original = originalSets || [];

    // 3. Compute new / modified / deleted
    const newSets = currentSets.filter(
      (s) => !original.find((o) => o.position === s.position),
    );

    const modifiedSets = currentSets.filter((s) => {
      const o = original.find((o) => o.position === s.position);
      return o && (o.name !== s.name || o.code !== s.code);
    });

    // Consider a set as deleted if it exists in original but either:
    // - Doesn't exist in current sets
    // - Or exists but has empty name or code
    const deletedSets = original.filter((o) => {
      const currentSet = layoutData.areas?.flatMap(
        (area) =>
          area.sectors?.flatMap(
            (sector) =>
              sector.equipments?.flatMap((eq) =>
                eq.sets?.find((set) => set.position === o.position),
              ) || [],
          ) || [],
      )[0];

      return !currentSet || (!currentSet.name && !currentSet.code);
    });

    // 4. Kick off API calls
    const promises: Promise<void>[] = [];
    if (newSets.length) promises.push(HandleCreateSets(newSets));
    if (modifiedSets.length) promises.push(HandleUpdateSets(modifiedSets));
    if (deletedSets.length) promises.push(HandleDeleteSets(deletedSets));

    // 5. Advance step once all are done (or immediately if nothing to do)
    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        setSelectedLayoutStep(5);
      });
    } else {
      setSelectedLayoutStep(5);
    }
  };

  useEffect(() => {
    if (!layoutData.areas) {
      setSectorsPages(1);
      return;
    }

    // Flatten all sectors from all areas
    const allSectors = layoutData.areas.flatMap((area) => area.sectors || []);

    // Filter the sectors using the query.
    // (Assuming each sector has a "name" property you want to match against.)
    const filteredSectors = query
      ? allSectors.filter((sector) =>
          sector.name.toLowerCase().includes(query.toLowerCase()),
        )
      : allSectors;

    // Calculate the number of pages using the filtered list (e.g. 12 sectors per page)
    setSectorsPages(
      filteredSectors.length > 0 ? Math.ceil(filteredSectors.length / 12) : 1,
    );
  }, [layoutData.areas, query]);

  useEffect(() => {
    if (!layoutData.areas) return;

    // Flatten equipments from every sector in every area
    const allEquipments = layoutData.areas.flatMap((area) =>
      area.sectors
        ? area.sectors.flatMap((sector) => sector.equipments || [])
        : [],
    );

    // Filter equipments according to the query.
    // Adjust the field (e.g. 'name') as needed for your filtering criteria.
    const filteredEquipments = query
      ? allEquipments.filter((equipment) =>
          equipment.name.toLowerCase().includes(query.toLowerCase()),
        )
      : allEquipments;

    // Calculate the total number of pages (12 equipments per page)
    setEquipmentPages(
      filteredEquipments.length > 0
        ? Math.ceil(filteredEquipments.length / 6)
        : 1,
    );
  }, [layoutData.areas, query]);

  useEffect(() => {
    // Always show at least 3 fields, or more if there are more values
    const minFields = 3;
    const valueLength = inputSetsValues.length;
    setSetsArrayLength(Math.max(minFields, valueLength));
  }, [inputSetsValues]);

  useEffect(() => {
    if (!selectedEquipment) return;

    // Sync with any updates to the selected equipment's sets
    const updatedEquipment = layoutData.areas
      ?.flatMap((area) => area.sectors || [])
      ?.flatMap((sector) => sector.equipments || [])
      ?.find((eq) => eq.id === selectedEquipment.id);

    if (updatedEquipment) {
      setSelectedEquipment(updatedEquipment);
      if (updatedEquipment.sets) {
        setInputSetsValues(updatedEquipment.sets);
        setSetsArrayLength(updatedEquipment.sets.length);
      }
    }
  }, [layoutData.areas]);

  return (
    <>
      <AccordionItem value="4" onClick={() => setSelectedLayoutStep(4)}>
        <AccordionTrigger arrow>
          {isGettingData ? (
            <Skeleton className="h-10" />
          ) : (
            <div className="flex w-full items-center justify-between">
              <div className="text-primary flex items-center gap-2 text-base font-bold md:gap-4 md:text-2xl">
                <span>1.4</span>
                <div className="flex flex-col">
                  <span className="leading-6">Cadastramento de Conjuntos</span>
                  <span
                    className={cn(
                      "w-max text-xs font-normal text-neutral-500 md:text-sm",
                      selectedLayoutStep !== 4 && "hidden",
                    )}
                  >
                    O que é um Conjunto? Explicitar
                  </span>
                </div>
              </div>
              {selectedLayoutStep === 4 && selectedEquipment === null && (
                <div className="flex items-center gap-4">
                  <DropdownMenu
                    open={isDropdownOpen}
                    onOpenChange={setIsDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <div className="bg-primary flex h-6 items-center gap-2 rounded-full p-1 text-sm font-semibold text-white md:h-10 md:p-2">
                        <Upload className="h-4 md:h-8" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="flex w-max flex-col items-center bg-white p-0 text-sm">
                      <DropdownMenuItem className="w-full rounded-none border-b">
                        <DropdownMenuArrow className="fill-neutral-300" />
                        <span className="w-full">Importar Planilhas</span>
                        <ArrowRight />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setIsDropdownOpen(false);
                          setTimeout(() => {
                            setIsSetTemplateSheetOpen(true);
                          }, 100);
                        }}
                        className="w-full rounded-none"
                      >
                        <DropdownMenuArrow className="fill-neutral-300" />
                        <span className="w-full">Selecionar Modelo Pronto</span>
                        <ArrowRight />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      HandleNextStep();
                    }}
                    className={cn(
                      "bg-primary flex h-6 items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-white md:h-10 md:px-4",
                      !hasAnySets &&
                        "pointer-events-none cursor-not-allowed opacity-50",
                    )}
                  >
                    {isModifyingSets ? (
                      <>
                        <span className="hidden md:block">Salvando...</span>
                        <Loader2 className="h-4 animate-spin md:h-8" />
                      </>
                    ) : (
                      <>
                        <span className="hidden md:block">Avançar 1.5</span>
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
              selectedSector && "grid-cols-3",
              selectedEquipment && "px-0",
            )}
          >
            {isGettingData ? (
              [...Array(12)].map((item, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <Skeleton />
                </div>
              ))
            ) : selectedEquipment !== null ? (
              <>
                <div className="col-span-3 flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-2 px-4">
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
                        <span>{selectedSector?.name}</span>
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
                  </div>
                  <div className="flex h-60 w-full flex-col">
                    <ScrollArea className="h-full">
                      {[...Array(setsArrayLength)].map((_, index) => (
                        <div
                          key={index}
                          className="col-span-3 mb-1 flex items-end justify-between gap-2 px-2 md:gap-4 md:px-4"
                        >
                          <div
                            className={cn(
                              "text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl bg-white font-bold shadow-[0px_2px_7px_rgba(0,0,0,0.15)] md:h-12 md:w-12 md:min-w-12",
                              isSetFullyFilled(inputSetsValues[index]) &&
                                "bg-primary text-white",
                            )}
                          >
                            <span>{index + 1}.</span>
                          </div>
                          <div className="flex w-full flex-col">
                            <span className="text-primary text-xs md:text-sm">
                              Nome do Conjunto
                            </span>
                            <input
                              type="text"
                              className="h-10 w-full rounded-2xl bg-white p-2 px-2 text-xs shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4 md:text-sm"
                              placeholder="Identificação do Conjunto"
                              onChange={(e) =>
                                handleInputChange(index, "name", e.target.value)
                              }
                              value={inputSetsValues[index]?.name || ""}
                            />
                          </div>
                          <div className="flex w-full flex-col">
                            <span className="text-primary text-xs md:text-sm">
                              Código do Conjunto
                            </span>
                            <input
                              type="text"
                              className="h-10 w-full rounded-2xl bg-white p-2 px-2 text-xs shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4 md:text-sm"
                              placeholder="Código do Conjunto"
                              onChange={(e) =>
                                handleInputChange(index, "code", e.target.value)
                              }
                              value={inputSetsValues[index]?.code || ""}
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveSet(index)}
                            className={cn(
                              "bg-primary pointer-events-none cursor-not-allowed rounded-md p-2 text-white opacity-50",
                              inputSetsValues[index]?.name &&
                                inputSetsValues[index]?.code &&
                                "pointer-events-auto cursor-auto opacity-100",
                            )}
                          >
                            <Trash />
                          </button>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                  <div className="flex w-full items-center justify-between gap-2 px-2 md:px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSet();
                      }}
                      className={cn(
                        "bg-primary h-10 w-max self-end rounded-full px-2 font-bold text-white md:h-12 md:px-4",
                      )}
                    >
                      + Cadastrar Conjunto
                    </button>
                    <button
                      onClick={() => setSelectedEquipment(null)}
                      className="h-10 w-40 rounded-xl bg-green-500 p-2 text-sm text-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)]"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </>
            ) : selectedSector ? (
              <>
                <div className="col-span-3 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSector(null)}
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
                            {selectedSector.position}
                          </span>
                          <input
                            className={cn(
                              "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                              "text-white",
                            )}
                            placeholder="Nome da Área"
                            value={selectedSector.name}
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
                        <span>{selectedSector.name}</span>
                      </PopoverContent>
                    </Popover>
                  </div>
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
                {layoutData.areas
                  ?.flatMap((area) => area.sectors || [])
                  .find(
                    (sector) => sector.position === selectedSector?.position,
                  )
                  ?.equipments?.filter((equipment) =>
                    equipment.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  ?.slice(
                    (currentEquipmentPage - 1) * 6,
                    currentEquipmentPage * 6,
                  )
                  .map((item, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <span className="text-primary text-xs md:text-sm">
                        {item.tag}
                      </span>
                      <label
                        onClick={() => {
                          handleSelectEquipment(item);
                          setQuery("");
                        }}
                        className={cn(
                          "relative flex h-10 items-center justify-end rounded-2xl px-2 md:h-12 md:px-4",
                          item.sets ? "bg-primary" : "",
                        )}
                      >
                        <input
                          className={cn(
                            "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                            item.sets ? "text-white" : "",
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
                            item.sets
                              ? "opacity-0"
                              : "peer-focus:translate-x-2 peer-focus:opacity-0",
                          )}
                        />
                        <Image
                          src={
                            item.sets
                              ? "/icons/checkCheckWhite.png"
                              : "/icons/checkCheck.png"
                          }
                          alt=""
                          width={200}
                          height={200}
                          className={cn(
                            "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                            item.sets
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-2 opacity-0",
                          )}
                        />
                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            item.sets
                              ? "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]"
                              : "",
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
                      placeholder="Buscar Setor"
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
                    .filter((sector) =>
                      sector.name.toLowerCase().includes(query.toLowerCase()),
                    )
                    .slice((currentSectorPage - 1) * 12, currentSectorPage * 12)
                    .map((item, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <label
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSector(item);
                            setQuery("");
                          }}
                          className={cn(
                            "relative flex h-10 cursor-pointer items-center justify-start rounded-2xl md:h-12",
                            item.equipments &&
                              item.equipments
                                .flatMap((eq) => eq)
                                .find(
                                  (eq) => eq.sets && eq.sets.length !== 0,
                                ) &&
                              "bg-primary",
                          )}
                        >
                          <span
                            className={cn(
                              "bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12",
                              item.equipments &&
                                item.equipments
                                  .flatMap((eq) => eq)
                                  .find(
                                    (eq) => eq.sets && eq.sets.length !== 0,
                                  ) &&
                                "bg-white/20 text-white",
                            )}
                          >
                            {item.position}
                          </span>
                          <input
                            className={cn(
                              "peer transparent absolute right-0 h-full w-[calc(100%-2.5rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:w-[calc(100%-3rem)] md:px-4 md:text-sm",
                              item.equipments &&
                                item.equipments
                                  .flatMap((eq) => eq)
                                  .find(
                                    (eq) => eq.sets && eq.sets.length !== 0,
                                  ) &&
                                "text-white",
                            )}
                            placeholder="Nome da Área"
                            value={item.name}
                            disabled
                          />

                          <div
                            className={cn(
                              "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                              item.equipments &&
                                item.equipments
                                  .flatMap((eq) => eq)
                                  .find(
                                    (eq) => eq.sets && eq.sets.length !== 0,
                                  ) &&
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
                  if (!selectedSector) {
                    setSelectedLayoutStep(2);
                  } else if (selectedSector && !selectedEquipment) {
                    setSelectedLayoutStep(3);
                  }
                }}
                className={cn(
                  "bg-primary flex h-10 w-full items-center justify-center gap-1 self-end rounded-full px-1 font-bold text-white md:px-4",
                  selectedEquipment && "hidden",
                )}
              >
                <p className="text-xs md:text-sm">+</p>
                <p className="hidden md:block">
                  Cadastrar {""}
                  {selectedSector ? " Equipamento" : " Setor"}
                </p>
              </button>
            )}
          </div>
          {isGettingData ? (
            <Skeleton className="ml-auto w-80" />
          ) : (
            <div className={cn(selectedEquipment && "hidden")}>
              <CustomPagination
                currentPage={
                  selectedSector ? currentEquipmentPage : currentSectorPage
                }
                setCurrentPage={
                  selectedSector
                    ? setCurrentEquipmentPage
                    : setCurrentSectorPage
                }
                pages={selectedSector ? equipmentPages : sectorsPages}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
      {isSetTemplateSheetOpen && (
        <SetTemplateSheet
          open={isSetTemplateSheetOpen}
          onClose={() => setIsSetTemplateSheetOpen(false)}
        />
      )}
    </>
  );
}
