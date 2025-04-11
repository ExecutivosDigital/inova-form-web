"use client";
import { EquipmentsProps, SectorProps } from "@/@types/LayoutTypes";
import { CustomPagination } from "@/components/global/CustomPagination";
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
import { useLayoutContext } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Search,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

interface EquipmentIdentificationAccordionProps {
  selectedEquipmentStep: number;
  setSelectedEquipmentStep: React.Dispatch<React.SetStateAction<number>>;
}

export function EquipmentIdentificationAccordion({
  selectedEquipmentStep,
  setSelectedEquipmentStep,
}: EquipmentIdentificationAccordionProps) {
  const { layoutData, setLayoutData } = useLayoutContext();

  const [isImportHovered, setIsImportHovered] = useState(false);
  const [selectedSector, setSelectedSector] = useState<SectorProps | null>(
    null,
  );
  const [sectorsPages, setSectorsPages] = useState<number>(1);
  const [equipmentPages, setEquipmentPages] = useState<number>(1);
  const [currentSectorPage, setCurrentSectorPage] = useState(1);
  const [currentEquipmentPage, setCurrentEquipmentPage] = useState(1);
  const [equipmentsArrayLength, setEquipmentsArrayLength] = useState(5);
  const [inputEquipmentValues, setInputEquipmentValues] = useState<
    EquipmentsProps[]
  >(
    Array(equipmentsArrayLength).fill({
      name: "",
      tag: "",
      type: "",
      maker: "",
      model: "",
      year: "",
      description: "",
      photos: null,
      id: "",
      position: "",
      sets: null,
    }),
  );
  const [isSectorNameHovered, setIsSectorNameHovered] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(
    null,
  );

  const handleAddEquipment = () => {
    setEquipmentsArrayLength((prevLength) => prevLength + 1);
    setInputEquipmentValues((prev) => [
      ...prev,
      {
        name: "",
        tag: "",
        type: "",
        maker: "",
        model: "",
        year: "",
        description: "",
        photos: null,
        id: "",
        position: "",
        sets: null,
      },
    ]);
    setEquipmentPages((prevPages) =>
      (equipmentsArrayLength + 1) / 6 > prevPages ? prevPages + 1 : prevPages,
    );
  };

  const handleInputChange = (
    index: number,
    field: keyof EquipmentsProps,
    value: string | string[],
  ) => {
    if (!selectedSector) return;

    const fullposition = `${selectedSector.position}.${index + 1}`; // Ensure the position is correct

    // Update local UI state
    setInputEquipmentValues((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[index] = {
        ...updatedInputs[index],
        [field]: value,
      };
      return updatedInputs;
    });

    // Update global layoutData state
    setLayoutData((prevLayout) => {
      if (!prevLayout.areas) return prevLayout; // Ensure areas exist

      const updatedAreas = prevLayout.areas.map((area) => {
        if (!area.sectors) return area; // Skip areas without sectors

        const updatedSectors = area.sectors.map((sector) => {
          if (sector.position !== selectedSector.position) return sector; // Skip unrelated sectors

          // Clone the equipment array or create a new one
          const updatedEquipments = sector.equipments
            ? [...sector.equipments]
            : [];

          const existingEquipmentIndex = updatedEquipments.findIndex(
            (equipment) => equipment.position === fullposition,
          );

          if (existingEquipmentIndex !== -1) {
            // If equipment exists, update only the changed field
            updatedEquipments[existingEquipmentIndex] = {
              ...updatedEquipments[existingEquipmentIndex],
              [field]: value,
            };
          } else {
            // Only add a new equipment if it truly doesn't exist
            updatedEquipments.push({
              name: "",
              tag: "",
              type: "",
              maker: "",
              model: "",
              year: "",
              description: "",
              photos: null,
              id: v4(), // Assign a unique ID once, only on creation
              position: fullposition,
              sets: null,
              [field]: value,
            });
          }

          return {
            ...sector,
            equipments: updatedEquipments, // Update only this sector's equipment
          };
        });

        return {
          ...area,
          sectors: updatedSectors, // Keep other sectors unchanged
        };
      });

      return { ...prevLayout, areas: updatedAreas };
    });
  };

  const handleSelectSector = (sector: SectorProps) => {
    setSelectedSector(sector);
    setEquipmentPages(1);

    // Properly reset sector values
    if (sector.equipments && sector.equipments.length > 0) {
      // Keep full equipment objects instead of replacing them with strings
      const updatedEquipmentValues = sector.equipments.map((equipment) => ({
        ...equipment, // Copy all properties of the existing equipment
      }));

      setInputEquipmentValues(updatedEquipmentValues);
      setEquipmentsArrayLength(sector.equipments.length);
      setEquipmentPages((prevPages) =>
        ((sector.equipments ? sector.equipments.length : 0) + 1) / 6 > prevPages
          ? prevPages + 1
          : prevPages,
      );
    } else {
      // Initialize with default equipment structure instead of strings
      setInputEquipmentValues(
        Array(5).fill({
          name: "",
          tag: "",
          type: "",
          maker: "",
          model: "",
          year: "",
          description: "",
          photos: null,
          id: v4(),
          position: v4(),
          sets: null,
        }),
      );
      setEquipmentsArrayLength(5);
      setEquipmentPages(1);
    }

    setCurrentSectorPage(1);
  };

  const isEquipmentFullyFilled = (equipment: EquipmentsProps) => {
    return (
      equipment.name &&
      equipment.tag &&
      equipment.type &&
      equipment.maker &&
      equipment.model &&
      equipment.year &&
      equipment.description
    );
  };

  useEffect(() => {
    if (
      layoutData.areas &&
      layoutData.areas.flatMap((area) => area.sectors || []).length > 1
    ) {
      setSectorsPages(Math.ceil(layoutData.areas.length / 12));
    }
  }, [layoutData.areas]);

  return (
    <AccordionItem value="1" onClick={() => setSelectedEquipmentStep(1)}>
      <AccordionTrigger arrow>
        <div className="flex w-full items-center justify-between">
          <div className="text-primary flex items-center gap-2 text-base font-bold md:gap-4 md:text-2xl">
            <span>1.1</span>
            <div className="flex flex-col">
              <span className="leading-6">Identificação do Equipamentos</span>
              <span
                className={cn(
                  "w-max text-xs font-normal text-neutral-500 md:text-sm",
                  selectedEquipmentStep !== 3 && "hidden",
                )}
              >
                O que é um Equipamento? Explicitar
              </span>
            </div>
          </div>
          {selectedEquipmentStep === 1 && (
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
                  setSelectedEquipmentStep(2);
                }}
                className={cn(
                  "bg-primary flex h-6 items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-white md:h-10 md:px-4",
                  layoutData &&
                    layoutData.areas &&
                    layoutData.areas.find((area) =>
                      area.sectors?.find((sector) => !sector.equipments),
                    ) &&
                    "pointer-events-none cursor-not-allowed opacity-50",
                )}
              >
                <span className="hidden md:block">Avançar 1.2</span>
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
          )}
        >
          {selectedEquipment !== null ? (
            <>
              <div className="col-span-3 flex items-center justify-between gap-2">
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
                      <span>{selectedSector?.name}</span>
                    </PopoverContent>
                  </Popover>
                </div>
                <button className="text-primary flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-2 py-2 text-xs font-semibold md:h-12 md:px-4">
                  Fotos do Equipamento
                </button>
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-primary text-xs md:text-sm">TAG</span>
                  <input
                    type="text"
                    className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                    placeholder="TAG do Equipamento"
                    value={inputEquipmentValues[selectedEquipment]?.tag || ""}
                    onChange={(e) =>
                      handleInputChange(
                        selectedEquipment,
                        "tag",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-primary text-xs md:text-sm">
                    Fabricante
                  </span>
                  <input
                    type="text"
                    className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                    placeholder="Fabricante do Equipamento"
                    value={inputEquipmentValues[selectedEquipment]?.maker || ""}
                    onChange={(e) =>
                      handleInputChange(
                        selectedEquipment,
                        "maker",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-primary text-xs md:text-sm">
                    Identificação
                  </span>
                  <input
                    type="text"
                    className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                    placeholder="Identificação do Equipamento"
                    value={inputEquipmentValues[selectedEquipment]?.name || ""}
                    onChange={(e) =>
                      handleInputChange(
                        selectedEquipment,
                        "name",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-primary text-xs md:text-sm">
                    Modelo / Série
                  </span>
                  <input
                    type="text"
                    className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                    placeholder="Modelo / Série do Equipamento"
                    value={inputEquipmentValues[selectedEquipment]?.model || ""}
                    onChange={(e) =>
                      handleInputChange(
                        selectedEquipment,
                        "model",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-primary text-xs md:text-sm">
                    Tipo do Equipamento
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="group relative">
                      <div className="relative flex w-full items-center">
                        <input
                          type="text"
                          className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                          placeholder="Tipo do Equipamento"
                          value={
                            inputEquipmentValues[selectedEquipment]?.type || ""
                          }
                          readOnly
                        />
                        <ChevronDown className="absolute top-1/2 right-0 -translate-y-1/2 transition duration-150 data-[state=closed]:rotate-180" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white">
                      <DropdownMenuArrow />
                      <DropdownMenuItem
                        onClick={() =>
                          handleInputChange(selectedEquipment, "type", "Tipo 1")
                        }
                      >
                        Tipo 1
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleInputChange(selectedEquipment, "type", "Tipo 2")
                        }
                      >
                        Tipo 2
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleInputChange(selectedEquipment, "type", "Tipo 3")
                        }
                      >
                        Tipo 3
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-col">
                  <span className="text-primary text-xs md:text-sm">
                    Ano de Fabricação
                  </span>
                  <input
                    type="text"
                    className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                    placeholder="Ano de Fabricação do Equipamento"
                    value={inputEquipmentValues[selectedEquipment]?.year || ""}
                    onChange={(e) =>
                      handleInputChange(
                        selectedEquipment,
                        "year",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="text-primary text-xs md:text-sm">
                    Descrição
                  </span>
                  <textarea
                    className="h-40 w-full resize-none rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:px-4"
                    placeholder="Descrição do Equipamento"
                    value={
                      inputEquipmentValues[selectedEquipment]?.description || ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        selectedEquipment,
                        "description",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="flex h-10 items-center justify-end gap-4 md:h-12">
                  <button
                    onClick={() => setSelectedEquipment(null)}
                    className="h-10 w-full rounded-xl bg-green-500 p-2 text-sm text-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] md:w-2/5"
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
              {[...Array(equipmentsArrayLength)]
                .slice((currentEquipmentPage - 1) * 6, currentEquipmentPage * 6)
                .map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <span className="text-primary text-xs md:text-sm">
                      Equipamento{" "}
                      {currentEquipmentPage > 1
                        ? (currentEquipmentPage - 1) * 6 + index + 1
                        : index + 1}
                    </span>
                    <label
                      onClick={() =>
                        setSelectedEquipment(
                          currentEquipmentPage > 1
                            ? (currentEquipmentPage - 1) * 6 + index
                            : index,
                        )
                      }
                      className={cn(
                        "relative flex h-10 items-center justify-end rounded-2xl px-2 md:h-12 md:px-4",
                        isEquipmentFullyFilled(
                          inputEquipmentValues[
                            currentEquipmentPage > 1
                              ? (currentEquipmentPage - 1) * 6 + index
                              : index
                          ],
                        )
                          ? "bg-primary"
                          : "",
                      )}
                    >
                      <input
                        className={cn(
                          "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                          isEquipmentFullyFilled(
                            inputEquipmentValues[
                              currentEquipmentPage > 1
                                ? (currentEquipmentPage - 1) * 6 + index
                                : index
                            ],
                          )
                            ? "text-white"
                            : "",
                        )}
                        placeholder="TAG do Equipamento"
                        value={
                          inputEquipmentValues[
                            currentEquipmentPage > 1
                              ? (currentEquipmentPage - 1) * 6 + index
                              : index
                          ].tag || ""
                        }
                        readOnly
                      />
                      <Image
                        src="/icons/equipment.png"
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 object-contain transition duration-200 peer-focus:translate-x-2 peer-focus:opacity-0",
                          isEquipmentFullyFilled(
                            inputEquipmentValues[
                              currentEquipmentPage > 1
                                ? (currentEquipmentPage - 1) * 6 + index
                                : index
                            ],
                          )
                            ? "opacity-0"
                            : "peer-focus:translate-x-2 peer-focus:opacity-0",
                        )}
                      />
                      <Image
                        src={
                          isEquipmentFullyFilled(
                            inputEquipmentValues[
                              currentEquipmentPage > 1
                                ? (currentEquipmentPage - 1) * 6 + index
                                : index
                            ],
                          )
                            ? "/icons/checkCheckWhite.png"
                            : "/icons/checkCheck.png"
                        }
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                          isEquipmentFullyFilled(
                            inputEquipmentValues[
                              currentEquipmentPage > 1
                                ? (currentEquipmentPage - 1) * 6 + index
                                : index
                            ],
                          )
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          isEquipmentFullyFilled(
                            inputEquipmentValues[
                              currentEquipmentPage > 1
                                ? (currentEquipmentPage - 1) * 6 + index
                                : index
                            ],
                          )
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
                          handleSelectSector(item);
                        }}
                        className={cn(
                          "relative flex h-10 cursor-pointer items-center justify-start rounded-2xl md:h-12",
                          item.equipments && "bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12",
                            item.equipments && "bg-white/20 text-white",
                          )}
                        >
                          {item.position}
                        </span>
                        <input
                          className={cn(
                            "peer transparent absolute right-0 h-full w-[calc(100%-2.5rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:w-[calc(100%-3rem)] md:px-4 md:text-sm",
                            item.equipments && "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={item.name}
                          disabled
                        />

                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            item.equipments &&
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
                setSelectedEquipmentStep(2);
              } else {
                handleAddEquipment();
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
