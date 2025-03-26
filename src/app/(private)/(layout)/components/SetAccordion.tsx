"use client";
import { EquipmentsProps, SectorProps, SetProps } from "@/@types/LayoutTypes";
import { CustomPagination } from "@/components/global/CustomPagination";
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
import { useLayoutContext } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, Search, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

interface SetAccordionProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
}

export function SetAccordion({
  selectedLayoutStep,
  setSelectedLayoutStep,
}: SetAccordionProps) {
  const { layoutData, setLayoutData } = useLayoutContext();
  const [isImportHovered, setIsImportHovered] = useState(false);
  const [selectedSector, setSelectedSector] = useState<SectorProps | null>(
    null,
  );
  const [sectorsPages, setSectorsPages] = useState<number>(1);
  const [equipmentPages, setEquipmentPages] = useState<number>(1);
  const [currentSectorPage, setCurrentSectorPage] = useState(1);
  const [currentEquipmentPage, setCurrentEquipmentPage] = useState(1);
  const [setsArrayLength, setSetsArrayLength] = useState(3);
  const [inputSetsValues, setInputSetsValues] = useState<SetProps[]>(
    Array(setsArrayLength).fill({
      name: "",
      code: "",
      id: "",
      localId: "",
      subSets: null,
    }),
  );
  const [isSectorNameHovered, setIsSectorNameHovered] = useState(false);
  const [isEquipmentNameHovered, setIsEquipmentNameHovered] = useState(false);
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentsProps | null>(null);

  const isSetFullyFilled = (set: SetProps) => {
    return set.name && set.code;
  };

  const handleAddSet = () => {
    setSetsArrayLength((prevLength) => prevLength + 1);
    setInputSetsValues((prev) => [
      ...prev,
      {
        name: "",
        code: "",
        id: "",
        localId: "",
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

    const fullLocalId = `${selectedEquipment.localId}.${index + 1}`;

    setInputSetsValues((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[index] = {
        ...updatedInputs[index],
        [field]: value,
      };
      return updatedInputs;
    });

    setLayoutData((prevLayout) => {
      if (!prevLayout.areas) return prevLayout; // Ensure areas exist

      const updatedAreas = prevLayout.areas.map((area) => {
        if (!area.sectors) return area; // Skip areas without sectors

        const updatedSectors = area.sectors.map((sector) => {
          if (sector.localId !== selectedSector.localId) return sector; // Skip unrelated sectors

          // Ensure equipments exist in sector, default to an empty array if null
          const updatedEquipments = sector.equipments
            ? [...sector.equipments]
            : [];

          const existingEquipmentIndex = updatedEquipments.findIndex(
            (equipment) => equipment.localId === selectedEquipment.localId,
          );

          if (existingEquipmentIndex !== -1) {
            // Find the correct equipment and modify its sets array
            const equipment = updatedEquipments[existingEquipmentIndex];

            // Ensure sets exist or create an empty array
            const updatedSets = equipment.sets ? [...equipment.sets] : [];

            // Find the existing set by localId
            const existingSetIndex = updatedSets.findIndex(
              (set) => set.localId === fullLocalId,
            );

            if (existingSetIndex !== -1) {
              // If the set exists, update the specified field
              updatedSets[existingSetIndex] = {
                ...updatedSets[existingSetIndex],
                [field]: value,
              };
            } else {
              // If the set doesn't exist, add a new one
              updatedSets.push({
                name: "",
                code: "",
                id: v4(), // Unique ID
                localId: fullLocalId,
                subSets: null,
                [field]: value,
              });
            }

            // Assign updated sets back to equipment
            updatedEquipments[existingEquipmentIndex] = {
              ...equipment,
              sets: updatedSets, // Update sets array in this equipment
            };
          }

          return {
            ...sector,
            equipments: updatedEquipments.length > 0 ? updatedEquipments : null, // Ensure correct type
          };
        });

        return {
          ...area,
          sectors: updatedSectors.length > 0 ? updatedSectors : [], // Ensure correct type
        };
      });

      return {
        ...prevLayout,
        areas: updatedAreas.length > 0 ? updatedAreas : [],
      }; // Ensure correct type
    });
  };

  const handleSelectEquipment = (equipment: EquipmentsProps) => {
    setSelectedEquipment(equipment);
    setEquipmentPages(1);

    // Properly reset sector values
    if (equipment.sets && equipment.sets.length > 0) {
      // Keep full equipment objects instead of replacing them with strings
      const updatedSetValues = equipment.sets.map((set) => ({
        ...set, // Copy all properties of the existing equipment
      }));

      setInputSetsValues(updatedSetValues);
      setSetsArrayLength(equipment.sets.length);
      setEquipmentPages((prevPages) =>
        ((equipment.sets ? equipment.sets.length : 0) + 1) / 6 > prevPages
          ? prevPages + 1
          : prevPages,
      );
    } else {
      // Initialize with default equipment structure instead of strings
      setInputSetsValues(
        Array(5).fill({
          name: "",
          code: "",
          id: "",
          localId: "",
          subSets: null,
        }),
      );
      setSetsArrayLength(3);
    }
    setCurrentSectorPage(1);
  };

  useEffect(() => {
    if (
      layoutData.areas &&
      layoutData.areas.flatMap((area) => area.sectors || []).length > 1
    ) {
      setSectorsPages(Math.ceil(layoutData.areas.length / 12));
    }
  }, [layoutData.areas]);

  useEffect(() => {
    if (!layoutData.areas || !selectedSector?.localId) return;

    const selectedSectorData = layoutData.areas
      .flatMap((area) => area.sectors || [])
      .find((sector) => sector.localId === selectedSector.localId);

    if (selectedSectorData?.equipments?.length) {
      setEquipmentPages(
        Math.ceil((selectedSectorData.equipments.length || 0) / 6),
      );
    }
  }, [layoutData.areas, selectedSector?.localId]);

  return (
    <AccordionItem value="4" onClick={() => setSelectedLayoutStep(4)}>
      <AccordionTrigger arrow>
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
          {selectedLayoutStep === 4 && (
            <div className="flex items-center gap-4">
              <Popover open={isImportHovered} onOpenChange={setIsImportHovered}>
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
                  setSelectedLayoutStep(5);
                }}
                className={cn(
                  "bg-primary flex h-6 items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-white md:h-10 md:px-4",
                  layoutData &&
                    layoutData.areas &&
                    layoutData.areas.find((area) =>
                      area.sectors?.find((sector) =>
                        sector.equipments?.find((eq) => !eq.sets),
                      ),
                    ) &&
                    "pointer-events-none cursor-not-allowed opacity-50",
                )}
              >
                <span className="hidden md:block">Avançar 1.5</span>
                <ArrowRight className="h-4 md:h-8" />
              </div>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div
          className={cn(
            "grid grid-cols-4 gap-2 border-t border-neutral-300 p-2 md:gap-4 md:p-4",
            selectedSector && "grid-cols-3",
            selectedEquipment && "px-0",
          )}
        >
          {selectedEquipment !== null ? (
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
                          {selectedSector?.localId}
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
                          {selectedEquipment?.localId}
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
                            value={inputSetsValues[index].name}
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
                            value={inputSetsValues[index].code}
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
              <div className="col-span-3 flex items-center gap-2">
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
                        {selectedSector.localId}
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
              {layoutData.areas
                ?.flatMap((area) => area.sectors || [])
                .find((sector) => sector.localId === selectedSector?.localId)
                ?.equipments?.slice(
                  (currentEquipmentPage - 1) * 6,
                  currentEquipmentPage * 6,
                )
                .map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <span className="text-primary text-xs md:text-sm">
                      {item.name}
                    </span>
                    <label
                      onClick={() => handleSelectEquipment(item)}
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
                        value={item.tag}
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
                <span>
                  Texto para Explicar que deverá selecionar um Setor antes do
                  Equipamento:
                </span>
                <label className="border-primary relative flex h-8 w-60 items-center rounded-md border">
                  <input
                    className="transparent placeholder:neutral-300 absolute left-0 h-full w-[calc(100%-2rem)] rounded-md px-4 focus:outline-none"
                    placeholder="Buscar Setor"
                  />
                  <div className="bg-primary absolute right-0 flex h-full w-8 items-center justify-center">
                    <Search size={12} />
                  </div>
                </label>
              </div>
              {layoutData.areas &&
                layoutData.areas
                  .flatMap((area) => area.sectors || [])
                  .slice((currentSectorPage - 1) * 12, currentSectorPage * 12)
                  .map((item, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <label
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSector(item);
                        }}
                        className={cn(
                          "relative flex h-10 cursor-pointer items-center justify-start rounded-2xl md:h-12",
                          item.equipments?.find((eq) => eq.sets) &&
                            "bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12",
                            item.equipments?.find((eq) => eq.sets) &&
                              "bg-white/20 text-white",
                          )}
                        >
                          {item.localId}
                        </span>
                        <input
                          className={cn(
                            "peer transparent absolute right-0 h-full w-[calc(100%-2.5rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:w-[calc(100%-3rem)] md:px-4 md:text-sm",
                            item.equipments?.find((eq) => eq.sets) &&
                              "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={item.name}
                          disabled
                        />

                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            item.equipments?.find((eq) => eq.sets) &&
                              "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          )}
                        />
                      </label>
                    </div>
                  ))}
            </>
          )}
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
        </div>
        <div className={cn(selectedEquipment && "hidden")}>
          <CustomPagination
            currentPage={
              selectedSector ? currentEquipmentPage : currentSectorPage
            }
            setCurrentPage={
              selectedSector ? setCurrentEquipmentPage : setCurrentSectorPage
            }
            pages={selectedSector ? equipmentPages : sectorsPages}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
