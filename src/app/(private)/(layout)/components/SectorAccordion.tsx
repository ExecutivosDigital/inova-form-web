"use client";
import { AreaProps } from "@/@types/LayoutTypes";
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

interface SectorAccordionProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
}

export function SectorAccordion({
  selectedLayoutStep,
  setSelectedLayoutStep,
}: SectorAccordionProps) {
  const { layoutData, setLayoutData } = useLayoutContext();
  const [isImportHovered, setIsImportHovered] = useState(false);
  const [currentAreaPage, setCurrentAreaPage] = useState(1);
  const [areasPages, setAreasPages] = useState<number>(1);
  const [sectorsArrayLength, setSectorsArrayLength] = useState(5);
  const [selectedArea, setSelectedArea] = useState<AreaProps | null>(null);
  const [inputSectorValues, setInputSectorValues] = useState<string[]>(
    Array(sectorsArrayLength).fill(""),
  );
  const [sectorsPages, setSectorsPages] = useState<number>(1);
  const [currentSectorPage, setCurrentSectorPage] = useState(1);
  const [isAreaNameHovered, setIsAreaNameHovered] = useState(false);

  const handleAddSector = () => {
    setSectorsArrayLength((prevLength) => prevLength + 1);
    setInputSectorValues((prev) => [...prev, ""]);
    setSectorsPages((prevPages) =>
      (sectorsArrayLength + 1) / 6 > prevPages ? prevPages + 1 : prevPages,
    );
  };

  const handleInputChange = (index: number, value: string) => {
    if (!selectedArea) return;

    const sectorId =
      currentSectorPage > 1 ? (currentSectorPage - 1) * 6 + index : index;

    setInputSectorValues((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[sectorId] = value;
      return updatedInputs;
    });

    setLayoutData((prevLayout) => {
      if (!prevLayout.areas) return prevLayout; // Ensure areas exist

      const updatedAreas = prevLayout.areas.map((area) => {
        if (area.id === selectedArea.id) {
          let updatedSectors = area.sectors ? [...area.sectors] : [];

          const existingSectorIndex = updatedSectors.findIndex(
            (sector) => sector.id === sectorId.toString(),
          );

          if (value === "") {
            // Remove sector if input is empty
            updatedSectors = updatedSectors.filter(
              (sector) => sector.id !== sectorId.toString(),
            );
            return {
              ...area,
              sectors: updatedSectors.length > 0 ? updatedSectors : null,
            };
          }

          if (existingSectorIndex !== -1) {
            // If sector already exists, update its name
            updatedSectors[existingSectorIndex].name = value;
          } else {
            // Otherwise, add a new sector
            updatedSectors.push({
              name: value,
              id: sectorId.toString(),
              localId: v4(),
              equipments: null,
            });
          }

          return { ...area, sectors: updatedSectors };
        }
        return area; // Keep other areas unchanged
      });

      return { ...prevLayout, areas: updatedAreas };
    });
  };

  const handleSelectArea = (area: AreaProps) => {
    setSelectedArea(area);
    setSectorsPages(1);

    // Properly reset sector values
    if (area.sectors && area.sectors.length > 0) {
      // Create a new array and preserve order
      const updatedSectorValues = Array(area.sectors.length).fill("");
      area.sectors.forEach((sector, index) => {
        updatedSectorValues[index] = sector.name; // Preserve sector order
      });

      setInputSectorValues(updatedSectorValues);
      setSectorsArrayLength(area.sectors.length);
      setSectorsPages((prevPages) =>
        (area.sectors.length + 1) / 6 > prevPages ? prevPages + 1 : prevPages,
      );
    } else {
      setInputSectorValues(Array(5).fill("")); // Default empty values
      setSectorsArrayLength(5);
      setSectorsPages(1);
    }

    setCurrentSectorPage(1);
  };

  useEffect(() => {
    if (layoutData.areas) {
      setAreasPages(Math.ceil(layoutData.areas.length / 12));
    }
  }, [layoutData.areas]);

  return (
    <AccordionItem value="2" onClick={() => setSelectedLayoutStep(2)}>
      <AccordionTrigger arrow>
        <div className="flex w-full items-center justify-between">
          <div className="text-primary flex items-center gap-4 text-2xl font-bold">
            <span>1.2</span>
            <div className="flex flex-col">
              <span className="leading-6">Cadastramento de Setores</span>
              <span
                className={cn(
                  "w-max text-sm font-normal text-neutral-500",
                  selectedLayoutStep !== 2 && "hidden",
                )}
              >
                O que é um Setor? Explicitar
              </span>
            </div>
          </div>
          {selectedLayoutStep === 2 && !selectedArea && (
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
                  setSelectedLayoutStep(3);
                }}
                className={cn(
                  "bg-primary flex h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white",
                  layoutData &&
                    layoutData.areas &&
                    layoutData.areas.find((area) => !area.sectors) &&
                    "pointer-events-none cursor-not-allowed opacity-50",
                )}
              >
                <span>Avançar 1.3</span>
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
            selectedArea && "grid-cols-3",
          )}
        >
          {selectedArea ? (
            <>
              <div className="col-span-3 flex items-center gap-2">
                <button
                  onClick={() => setSelectedArea(null)}
                  className="text-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.35)]"
                >
                  <ChevronLeft />
                </button>
                <Popover
                  open={isAreaNameHovered}
                  onOpenChange={setIsAreaNameHovered}
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
                        {selectedArea.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
                          "text-white",
                        )}
                        placeholder="Nome da Área"
                        value={selectedArea.name}
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
                    <span>{selectedArea.name}</span>
                  </PopoverContent>
                </Popover>
              </div>
              {[...Array(sectorsArrayLength)]
                .slice((currentSectorPage - 1) * 6, currentSectorPage * 6)
                .map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <span className="text-primary text-sm">
                      Setor{" "}
                      {currentSectorPage > 1
                        ? (currentSectorPage - 1) * 6 + index + 1
                        : index + 1}
                    </span>
                    <label
                      className={cn(
                        "relative flex h-12 items-center justify-end rounded-2xl px-4",
                        inputSectorValues[
                          currentSectorPage > 1
                            ? (currentSectorPage - 1) * 6 + index
                            : index
                        ]
                          ? "bg-primary"
                          : "",
                      )}
                    >
                      <input
                        className={cn(
                          "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-4 placeholder:text-neutral-300 focus:outline-none",
                          inputSectorValues[
                            currentSectorPage > 1
                              ? (currentSectorPage - 1) * 6 + index
                              : index
                          ]
                            ? "text-white"
                            : "",
                        )}
                        placeholder="Nome do Setor"
                        value={
                          inputSectorValues[
                            currentSectorPage > 1
                              ? (currentSectorPage - 1) * 6 + index
                              : index
                          ] || ""
                        }
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                      />
                      <Image
                        src="/icons/sector.png"
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 object-contain transition duration-200 peer-focus:translate-x-2 peer-focus:opacity-0",
                          inputSectorValues[
                            currentSectorPage > 1
                              ? (currentSectorPage - 1) * 6 + index
                              : index
                          ]
                            ? "opacity-0"
                            : "peer-focus:translate-x-2 peer-focus:opacity-0",
                        )}
                      />
                      <Image
                        src={
                          inputSectorValues[
                            currentSectorPage > 1
                              ? (currentSectorPage - 1) * 6 + index
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
                          inputSectorValues[
                            currentSectorPage > 1
                              ? (currentSectorPage - 1) * 6 + index
                              : index
                          ]
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          inputSectorValues[
                            currentSectorPage > 1
                              ? (currentSectorPage - 1) * 6 + index
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
              .slice((currentAreaPage - 1) * 12, currentAreaPage * 12)
              .map((item, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <label
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectArea(item);
                    }}
                    className={cn(
                      "relative flex h-12 cursor-pointer items-center justify-start rounded-2xl px-1",
                      item.sectors && "bg-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-full p-1 font-bold",
                        item.sectors && "bg-white/20 text-white",
                      )}
                    >
                      {index + 1}.
                    </span>
                    <input
                      className={cn(
                        "peer transparent absolute right-0 h-full w-[calc(100%-3rem)] px-4 placeholder:text-neutral-300 focus:outline-none",
                        item.sectors && "text-white",
                      )}
                      placeholder="Nome da Área"
                      value={item.name}
                      disabled
                    />

                    <div
                      className={cn(
                        "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                        item.sectors && "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                      )}
                    />
                  </label>
                </div>
              ))
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!selectedArea) {
                setSelectedLayoutStep(1);
              } else {
                handleAddSector();
              }
            }}
            className="bg-primary h-12 w-full self-end rounded-full px-4 font-bold text-white"
          >
            + Cadastrar {selectedArea ? "outro Setor" : "outra Área"}
          </button>
        </div>
        <div className="flex w-full items-center justify-end">
          <CustomPagination
            currentPage={selectedArea ? currentSectorPage : currentAreaPage}
            setCurrentPage={
              selectedArea ? setCurrentSectorPage : setCurrentAreaPage
            }
            pages={selectedArea ? sectorsPages : areasPages}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
