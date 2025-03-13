"use client";
import { SectorProps } from "@/@types/LayoutTypes";
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
import { useLayoutContext } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

interface EquipmentAccordionProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
}

export function EquipmentAccordion({
  selectedLayoutStep,
  setSelectedLayoutStep,
}: EquipmentAccordionProps) {
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
  const [inputEquipmentValues, setInputEquipmentValues] = useState<string[]>(
    Array(equipmentsArrayLength).fill(""),
  );
  const [isSectorNameHovered, setIsSectorNameHovered] = useState(false);

  const handleAddEquipment = () => {
    setEquipmentsArrayLength((prevLength) => prevLength + 1);
    setInputEquipmentValues((prev) => [...prev, ""]);
    setEquipmentPages((prevPages) =>
      (equipmentsArrayLength + 1) / 6 > prevPages ? prevPages + 1 : prevPages,
    );
  };

  console.log("inputEquipmentValues: ", inputEquipmentValues);

  const handleInputChange = (index: number, value: string) => {
    if (!selectedSector) return;

    const equipmentId =
      currentEquipmentPage > 1 ? (currentEquipmentPage - 1) * 6 + index : index;

    // Update local input state for UI responsiveness
    setInputEquipmentValues((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[index] = value;
      return updatedInputs;
    });

    setLayoutData((prevLayout) => {
      if (!prevLayout.areas) return prevLayout; // Ensure areas exist

      // Create a deep copy of areas
      const updatedAreas = prevLayout.areas.map((area) => {
        if (!area.sectors) return area; // Skip areas without sectors

        // Find the area that contains the selected sector
        const updatedSectors = area.sectors.map((sector) => {
          if (sector.id !== selectedSector.id) return sector; // Skip sectors that aren’t selected

          // Deep copy equipment array
          let updatedEquipments = sector.equipments
            ? [...sector.equipments]
            : [];

          const existingEquipmentIndex = updatedEquipments.findIndex(
            (equipment) => equipment.id === equipmentId.toString(),
          );

          if (value === "") {
            // Remove equipment if input is cleared
            updatedEquipments = updatedEquipments.filter(
              (equipment) => equipment.id !== equipmentId.toString(),
            );
          } else if (existingEquipmentIndex !== -1) {
            // Update existing equipment name
            updatedEquipments[existingEquipmentIndex] = {
              ...updatedEquipments[existingEquipmentIndex], // Preserve properties
              name: value,
            };
          } else {
            // Add new equipment
            updatedEquipments.push({
              name: value,
              id: equipmentId.toString(),
              localId: v4(),
              sets: null, // Assuming sets are initially null
            });
          }

          // Return the modified sector while keeping others unchanged
          return {
            ...sector,
            equipments: updatedEquipments, // Only update the selected sector's equipments
          };
        });

        // If this area contains the selected sector, update it
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
      // Create a new array and preserve order
      const updatedEquipmentValues = Array(sector.equipments.length).fill("");
      sector.equipments.forEach((sector, index) => {
        updatedEquipmentValues[index] = sector.name; // Preserve sector order
      });

      setInputEquipmentValues(updatedEquipmentValues);
      setEquipmentsArrayLength(sector.equipments.length);
      setEquipmentPages((prevPages) =>
        (sector.equipments.length + 1) / 6 > prevPages
          ? prevPages + 1
          : prevPages,
      );
    } else {
      setInputEquipmentValues(Array(5).fill("")); // Default empty values
      setEquipmentsArrayLength(5);
      setEquipmentPages(1);
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

  return (
    <AccordionItem value="3" onClick={() => setSelectedLayoutStep(3)}>
      <AccordionTrigger arrow>
        <div className="flex w-full items-center justify-between">
          <div className="text-primary flex items-center gap-4 text-2xl font-bold">
            <span>1.3</span>
            <div className="flex flex-col">
              <span className="leading-6">Cadastramento de Equipamentos</span>
              <span
                className={cn(
                  "w-max text-sm font-normal text-neutral-500",
                  selectedLayoutStep !== 3 && "hidden",
                )}
              >
                O que é um Equipamento? Explicitar
              </span>
            </div>
          </div>
          {selectedLayoutStep === 3 && (
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
                  <div className="bg-primary flex h-10 items-center gap-2 rounded-full p-2 text-sm font-semibold text-white">
                    <Upload />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-max p-1 text-sm">
                  <PopoverArrow className="fill-neutral-300" />
                  <span>Importar Planilhas</span>
                </PopoverContent>
              </Popover>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLayoutStep(4);
                }}
                className="bg-primary flex h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
              >
                <span>Avançar 1.4</span>
                <ArrowRight />
              </div>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div
          className={cn(
            "grid grid-cols-4 gap-4 border-t border-neutral-300 p-4",
            selectedSector && "grid-cols-3",
          )}
        >
          {selectedSector ? (
            <>
              <div className="col-span-3 flex items-center gap-2">
                <button
                  onClick={() => setSelectedSector(null)}
                  className="text-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.35)]"
                >
                  <ChevronLeft />
                </button>
                <Popover
                  open={isSectorNameHovered}
                  onOpenChange={setIsSectorNameHovered}
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
                    <label
                      className={cn(
                        "relative flex h-12 w-max items-center justify-start rounded-2xl px-1",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-full p-1 font-bold",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedSector.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
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
                  <PopoverContent className="w-max max-w-40 p-1 text-sm break-words">
                    <PopoverArrow className="fill-neutral-300" />
                    <span>{selectedSector.name}</span>
                  </PopoverContent>
                </Popover>
              </div>
              {[...Array(equipmentsArrayLength)]
                .slice((currentEquipmentPage - 1) * 6, currentEquipmentPage * 6)
                .map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <span className="text-primary text-sm">
                      Equipamento{" "}
                      {currentEquipmentPage > 1
                        ? (currentEquipmentPage - 1) * 6 + index + 1
                        : index + 1}
                    </span>
                    <label
                      className={cn(
                        "relative flex h-12 items-center justify-end rounded-2xl px-4",
                        inputEquipmentValues[
                          currentEquipmentPage > 1
                            ? (currentEquipmentPage - 1) * 6 + index
                            : index
                        ]
                          ? "bg-primary"
                          : "",
                      )}
                    >
                      <input
                        className={cn(
                          "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-4 placeholder:text-neutral-300 focus:outline-none",
                          inputEquipmentValues[
                            currentEquipmentPage > 1
                              ? (currentEquipmentPage - 1) * 6 + index
                              : index
                          ]
                            ? "text-white"
                            : "",
                        )}
                        placeholder="Nome do Setor"
                        value={
                          inputEquipmentValues[
                            currentEquipmentPage > 1
                              ? (currentEquipmentPage - 1) * 6 + index
                              : index
                          ] || ""
                        }
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                      />
                      <Image
                        src="/icons/equipment.png"
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 object-contain transition duration-200 peer-focus:translate-x-2 peer-focus:opacity-0",
                          inputEquipmentValues[
                            currentEquipmentPage > 1
                              ? (currentEquipmentPage - 1) * 6 + index
                              : index
                          ]
                            ? "opacity-0"
                            : "peer-focus:translate-x-2 peer-focus:opacity-0",
                        )}
                      />
                      <Image
                        src={
                          inputEquipmentValues[
                            currentEquipmentPage > 1
                              ? (currentEquipmentPage - 1) * 6 + index
                              : index
                          ]
                            ? "/icons/checkCheckWhite.png"
                            : "/icons/checkCheck.png"
                        }
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                          inputEquipmentValues[
                            currentEquipmentPage > 1
                              ? (currentEquipmentPage - 1) * 6 + index
                              : index
                          ]
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          inputEquipmentValues[
                            currentEquipmentPage > 1
                              ? (currentEquipmentPage - 1) * 6 + index
                              : index
                          ]
                            ? "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]"
                            : "",
                        )}
                      />
                    </label>
                  </div>
                ))}
            </>
          ) : (
            layoutData.areas &&
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
                      "relative flex h-12 cursor-pointer items-center justify-start rounded-2xl pr-1",
                      item.equipments && "bg-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-2xl p-1 font-bold",
                        item.equipments && "bg-white/20 text-white",
                      )}
                    >
                      {item.localId}
                    </span>
                    <input
                      className={cn(
                        "peer transparent absolute right-0 h-full w-[calc(100%-3rem)] px-4 placeholder:text-neutral-300 focus:outline-none",
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
              ))
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!selectedSector) {
                setSelectedLayoutStep(2);
              } else {
                handleAddEquipment();
              }
            }}
            className="bg-primary h-12 w-full self-end rounded-full px-4 font-bold text-white"
          >
            + Cadastrar {selectedSector ? "outro Equipamento" : "outro Setor"}
          </button>
        </div>
        <div className="flex w-full items-center justify-end">
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
