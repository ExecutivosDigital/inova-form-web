"use client";
import { AreaProps, SectorProps } from "@/@types/LayoutTypes";
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
import { useApiContext } from "@/context/ApiContext";
import { useLayoutContext } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { ArrowRight, ChevronLeft, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 } from "uuid";
import { SectorTemplateSheet } from "./SectorTemplateSheet";

interface SectorAccordionProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
}

export function SectorAccordion({
  selectedLayoutStep,
  setSelectedLayoutStep,
}: SectorAccordionProps) {
  const {
    layoutData,
    setLayoutData,
    GetSectors,
    originalSectors,
    isGettingData,
    GetAllData,
  } = useLayoutContext();
  const { PostAPI, PutAPI, DeleteAPI } = useApiContext();
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
  const [isModifyingSectors, setIsModifyingSectors] = useState(false);
  const [isSectorTemplateSheetOpen, setIsSectorTemplateSheetOpen] =
    useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const hasAnySector =
    (layoutData.areas?.flatMap((a) => a.sectors || []).length ?? 0) > 0;

  const handleAddSector = () => {
    setSectorsArrayLength((prevLength) => prevLength + 1);
    setInputSectorValues((prev) => [...prev, ""]);
    setSectorsPages(Math.ceil((sectorsArrayLength + 1) / 6));
  };

  const HandleInputChange = (stateIndex: number, value: string) => {
    if (!selectedArea) return;

    const slot = (stateIndex + 1).toString();
    const fullPosition = `${selectedArea.position}.${slot}`;

    // Sync the input‑field state
    setInputSectorValues((prev) => {
      const next = [...prev];
      next[stateIndex] = value;
      return next;
    });

    // Update layoutData, _early‑return_ if there were no areas
    setLayoutData((prev) => {
      if (!prev.areas) return prev;

      // Build a brand‑new AreaProps[] array
      const updatedAreas: AreaProps[] = prev.areas.map((area) => {
        if (area.id !== selectedArea.id) {
          // untouched
          return area;
        }

        // clone this area’s sectors (or start with [])
        const prevSectors = area.sectors ?? [];
        let updatedSectors = [...prevSectors];

        const idx = updatedSectors.findIndex(
          (s) => s.position === fullPosition,
        );

        if (value === "") {
          // deletion
          updatedSectors = updatedSectors.filter(
            (s) => s.position !== fullPosition,
          );
        } else if (idx !== -1) {
          // replace with a fresh object
          updatedSectors[idx] = {
            ...updatedSectors[idx],
            name: value,
          };
        } else {
          // new sector
          updatedSectors.push({
            id: v4(),
            name: value,
            position: fullPosition,
            equipments: null,
          });
        }

        return {
          ...area,
          sectors: updatedSectors.length > 0 ? updatedSectors : null,
        };
      });

      // now updatedAreas is always AreaProps[]
      return { ...prev, areas: updatedAreas };
    });
  };

  const handleSelectArea = (area: AreaProps) => {
    setSelectedArea(area);
    setSectorsPages(1);

    if (area.sectors && area.sectors.length > 0) {
      // Build an array from the selected area's sectors.
      const updatedSectorValues = area.sectors.map((sector) => sector.name);
      setInputSectorValues(updatedSectorValues);
      setSectorsArrayLength(updatedSectorValues.length);
      setSectorsPages(Math.ceil(updatedSectorValues.length / 6));
    } else {
      // If no sectors exist for the selected area, default to 5 empty inputs.
      const defaultLength = 5;
      setInputSectorValues(Array(defaultLength).fill(""));
      setSectorsArrayLength(defaultLength);
      setSectorsPages(1);
    }

    setCurrentSectorPage(1);
  };

  async function HandleCreateSector(modifiedSectors?: SectorProps[]) {
    setIsModifyingSectors(true);
    const currentSectors =
      layoutData.areas?.flatMap((area) => area.sectors || []) || [];
    const sectorsToSend = modifiedSectors || currentSectors;

    const createdSectors = await PostAPI(
      "/sector/multi",
      {
        sectors: sectorsToSend.map((sector) => ({
          name: sector.name,
          position: sector.position,
          areaId: layoutData.areas?.find(
            (area) => area.position === sector.position.split(".")[0],
          )?.id,
        })),
      },
      true,
    );
    console.log("createdSectors", createdSectors);
    if (createdSectors.status === 200) {
      toast.success("Setores cadastrados com sucesso");
      await GetSectors(); // re-fetch areas from the API
      setSelectedLayoutStep(3);
    } else {
      toast.error("Erro ao cadastrar Setores");
    }
    return setIsModifyingSectors(false);
  }

  async function HandleUpdateSectors(modifiedSectors: SectorProps[]) {
    if (modifiedSectors.length === 0) return;
    setIsModifyingSectors(true);

    const editedSectors = await PutAPI(
      "/sector/multi",
      {
        sectors: modifiedSectors.map((sector) => {
          const orig = originalSectors?.find(
            (o) => o.position === sector.position,
          );
          return {
            name: sector.name,
            position: sector.position,
            sectorId: orig?.id ?? sector.id,
          };
        }),
      },
      true,
    );

    if (editedSectors.status === 200) {
      toast.success("Setores atualizados com sucesso");
      await GetAllData();
      setSelectedLayoutStep(3);
    } else {
      toast.error("Erro ao atualizar Setores");
    }

    setIsModifyingSectors(false);
  }

  async function HandleDeleteSectors(modifiedSectors: SectorProps[]) {
    if (modifiedSectors.length === 0) return;
    setIsModifyingSectors(true);
    const ids = modifiedSectors.map((sector) => sector.id).join(",");
    const deletedSectors = await DeleteAPI(`/sector?sectors=${ids}`, true);
    if (deletedSectors.status === 200) {
      toast.success("Setores deletados com sucesso");
      await GetSectors();
      setSelectedLayoutStep(3);
    } else {
      toast.error("Erro ao deletar as Setores");
    }
    return setIsModifyingSectors(false);
  }

  const HandleNextStep = () => {
    // 1. Grab your flat list of current sectors
    const currentSectors: SectorProps[] =
      layoutData.areas?.flatMap((area) => area.sectors || []) || [];

    // 2. Original baseline from context
    const original = originalSectors || [];

    // 3. Compute new / modified / deleted
    const newSectors = currentSectors.filter(
      (s) => !original.find((o) => o.position === s.position),
    );

    const modifiedSectors = currentSectors.filter((s) => {
      const o = original.find((o) => o.position === s.position);
      return o && o.name !== s.name;
    });

    const deletedSectors = original.filter(
      (o) => !currentSectors.find((s) => s.position === o.position),
    );

    // 4. Kick off API calls
    const promises: Promise<void>[] = [];
    if (newSectors.length) promises.push(HandleCreateSector(newSectors));
    if (modifiedSectors.length)
      promises.push(HandleUpdateSectors(modifiedSectors));
    if (deletedSectors.length)
      promises.push(HandleDeleteSectors(deletedSectors));

    // 5. Advance step once all are done (or immediately if nothing to do)
    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        setSelectedLayoutStep(3);
      });
    } else {
      setSelectedLayoutStep(3);
    }
  };

  // Effect to merge persisted sectors from the selected area
  useEffect(() => {
    if (!selectedArea) return;
    setInputSectorValues((prev) => {
      const merged = [...prev];
      selectedArea.sectors?.forEach((sector) => {
        const parts = sector.position.split(".");
        if (parts.length < 2) return;
        const pos = parseInt(parts[1], 10) - 1;
        if (pos >= merged.length) {
          const numToAdd = pos - merged.length + 1;
          for (let i = 0; i < numToAdd; i++) {
            merged.push("");
          }
        }
        merged[pos] = sector.name;
      });
      return merged;
    });
  }, [selectedArea?.sectors]);

  useEffect(() => {
    if (!selectedArea) return;
    const updated = layoutData.areas?.find((a) => a.id === selectedArea.id);
    if (updated) {
      setSelectedArea(updated);
    }
  }, [layoutData.areas]);

  useEffect(() => {
    setSectorsArrayLength(inputSectorValues.length);
    setSectorsPages(Math.ceil(inputSectorValues.length / 6));
  }, [inputSectorValues]);

  useEffect(() => {
    if (layoutData.areas) {
      setAreasPages(Math.ceil(layoutData.areas.length / 12));
    }
  }, [layoutData.areas]);

  return (
    <>
      <AccordionItem value="2" onClick={() => setSelectedLayoutStep(2)}>
        <AccordionTrigger arrow>
          {isGettingData ? (
            <Skeleton className="h-10" />
          ) : (
            <div className="flex w-full items-center justify-between">
              <div className="text-primary flex items-center gap-2 text-base font-bold md:gap-4 md:text-2xl">
                <span>1.2</span>
                <div className="flex flex-col">
                  <span className="leading-6">Cadastramento de Setores</span>
                  <span
                    className={cn(
                      "w-max text-xs font-normal text-neutral-500 md:text-sm",
                      selectedLayoutStep !== 2 && "hidden",
                    )}
                  >
                    O que é um Setor? Explicitar
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedLayoutStep === 2 && selectedArea ? (
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
                            setIsSectorTemplateSheetOpen(true);
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
                ) : selectedLayoutStep === 2 && !selectedArea ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      HandleNextStep();
                    }}
                    className={cn(
                      "bg-primary flex h-6 items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-white md:h-10 md:px-4",
                      !hasAnySector &&
                        "pointer-events-none cursor-not-allowed opacity-50",
                    )}
                  >
                    {isModifyingSectors ? (
                      <>
                        <span className="hidden md:block">Salvando...</span>
                        <Loader2 className="h-4 animate-spin md:h-8" />
                      </>
                    ) : (
                      <>
                        <span className="hidden md:block">Avançar 1.3</span>
                        <ArrowRight className="h-4 md:h-8" />
                      </>
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          )}
        </AccordionTrigger>
        <AccordionContent>
          <div
            className={cn(
              "grid grid-cols-4 gap-2 border-t border-neutral-300 p-2 md:gap-4 md:p-4",
              selectedArea && "grid-cols-3",
            )}
          >
            {isGettingData ? (
              [...Array(12)].map((item, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <Skeleton />
                </div>
              ))
            ) : selectedArea ? (
              <>
                <div className="col-span-3 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedArea(null)}
                    className="text-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.35)] md:h-12 md:w-12"
                  >
                    <ChevronLeft />
                  </button>
                  <Popover
                    open={isAreaNameHovered}
                    onOpenChange={setIsAreaNameHovered}
                  >
                    <PopoverTrigger
                      asChild
                      onMouseEnter={() => setIsAreaNameHovered(true)}
                      onMouseLeave={() => setIsAreaNameHovered(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAreaNameHovered(false);
                      }}
                      onBlur={() => setIsAreaNameHovered(false)}
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
                          {selectedArea.position}
                        </span>
                        <input
                          className={cn(
                            "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
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
                    <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                      <PopoverArrow className="fill-neutral-300" />
                      <span>{selectedArea.name}</span>
                    </PopoverContent>
                  </Popover>
                </div>
                {[...Array(sectorsArrayLength)]
                  .slice((currentSectorPage - 1) * 6, currentSectorPage * 6)
                  .map((item, index) => {
                    // Compute the global index for this input.
                    const stateIndex = (currentSectorPage - 1) * 6 + index;
                    return (
                      <div key={stateIndex} className="flex flex-col gap-2">
                        <span className="text-primary text-sm">
                          Setor {stateIndex + 1}
                        </span>
                        <label
                          className={cn(
                            "relative flex h-10 items-center justify-end rounded-2xl px-2 md:h-12 md:px-4",
                            inputSectorValues[stateIndex] ? "bg-primary" : "",
                          )}
                        >
                          <input
                            autoFocus={stateIndex === 0}
                            className={cn(
                              "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                              inputSectorValues[stateIndex] ? "text-white" : "",
                            )}
                            placeholder="Nome do Setor"
                            value={inputSectorValues[stateIndex] || ""}
                            onChange={(e) =>
                              HandleInputChange(stateIndex, e.target.value)
                            }
                          />
                          <Image
                            src="/icons/sector.png"
                            alt=""
                            width={200}
                            height={200}
                            className={cn(
                              "absolute h-max w-5 object-contain transition duration-200 peer-focus:translate-x-2 peer-focus:opacity-0",
                              inputSectorValues[stateIndex]
                                ? "opacity-0"
                                : "peer-focus:translate-x-2 peer-focus:opacity-0",
                            )}
                          />
                          <Image
                            src={
                              inputSectorValues[stateIndex]
                                ? "/icons/checkCheckWhite.png"
                                : "/icons/checkCheck.png"
                            }
                            alt=""
                            width={200}
                            height={200}
                            className={cn(
                              "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                              inputSectorValues[stateIndex]
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-2 opacity-0",
                            )}
                          />
                          <div
                            className={cn(
                              "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                              inputSectorValues[stateIndex]
                                ? "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]"
                                : "",
                            )}
                          />{" "}
                        </label>
                      </div>
                    );
                  })}
              </>
            ) : (
              layoutData.areas &&
              layoutData.areas
                .sort((a, b) => a.position.localeCompare(b.position))
                .slice((currentAreaPage - 1) * 12, currentAreaPage * 12)
                .map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <label
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectArea(item);
                      }}
                      className={cn(
                        "relative flex h-10 cursor-pointer items-center justify-start rounded-2xl px-1 md:h-12",
                        item.sectors &&
                          item.sectors.length !== 0 &&
                          "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded-full p-1 font-bold md:h-10 md:w-10",
                          item.sectors &&
                            item.sectors.length !== 0 &&
                            "bg-white/20 text-white",
                        )}
                      >
                        {index + 1}.
                      </span>
                      <input
                        className={cn(
                          "peer transparent absolute right-0 h-full w-[calc(100%-1.5rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:w-[calc(100%-3rem)] md:px-4 md:text-sm",
                          item.sectors &&
                            item.sectors.length !== 0 &&
                            "text-white",
                        )}
                        placeholder="Nome da Área"
                        value={item.name}
                        disabled
                      />
                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          item.sectors &&
                            item.sectors.length !== 0 &&
                            "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                        )}
                      />
                    </label>
                  </div>
                ))
            )}
            {isGettingData ? (
              <Skeleton />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!selectedArea) {
                    setSelectedLayoutStep(1);
                  } else {
                    handleAddSector();
                  }
                }}
                className="bg-primary flex h-10 w-full items-center justify-center gap-1 self-end rounded-full px-1 font-bold text-white md:px-4"
              >
                <p className="text-xs md:text-sm">+</p>
                <p className="hidden md:block">
                  Cadastrar {selectedArea ? " Setor" : " Área"}
                </p>
              </button>
            )}
          </div>
          {isGettingData ? (
            <Skeleton className="ml-auto w-80" />
          ) : (
            <CustomPagination
              currentPage={selectedArea ? currentSectorPage : currentAreaPage}
              setCurrentPage={
                selectedArea ? setCurrentSectorPage : setCurrentAreaPage
              }
              pages={selectedArea ? sectorsPages : areasPages}
            />
          )}
        </AccordionContent>
      </AccordionItem>
      {isSectorTemplateSheetOpen && selectedArea && (
        <SectorTemplateSheet
          open={isSectorTemplateSheetOpen}
          onClose={() => setIsSectorTemplateSheetOpen(false)}
          selectedArea={selectedArea}
        />
      )}
    </>
  );
}
