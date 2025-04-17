"use client";
import { AreaProps } from "@/@types/LayoutTypes";
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
import { useApiContext } from "@/context/ApiContext";
import { useLayoutContext } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { ArrowRight, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 } from "uuid";
import { AreaTemplateSheet } from "./AreaTemplateSheet";

interface AreaAccordionProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
}

export function AreaAccordion({
  selectedLayoutStep,
  setSelectedLayoutStep,
}: AreaAccordionProps) {
  const { layoutData, setLayoutData, GetAreas, originalAreas, isGettingData } =
    useLayoutContext();
  const { PostAPI, PutAPI, DeleteAPI } = useApiContext();
  const [areasArrayLength, setAreasArrayLength] = useState(5);
  const [inputValues, setInputValues] = useState<string[]>(
    Array(areasArrayLength).fill(""),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [areasPages, setAreasPages] = useState<number>(1);
  const [isModifyingAreas, setIsModifyingAreas] = useState(false);
  const [isAreaTemplateSheetOpen, setIsAreaTemplateSheetOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAddArea = () => {
    setAreasArrayLength((prevLength) => prevLength + 1);
    setInputValues((prev) => [...prev, ""]);
    setAreasPages((prevPages) =>
      (areasArrayLength + 1) / 6 > prevPages ? prevPages + 1 : prevPages,
    );
  };

  const HandleInputChange = (index: number, value: string) => {
    setInputValues((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[index] = value;
      return updatedInputs;
    });

    setLayoutData((prevLayout) => {
      let updatedAreas = [...(prevLayout.areas || [])];

      // Using index+1 for display purposes; area positions should be 1-indexed if desired.
      const areaPosition = (index + 1).toString();

      const existingAreaIndex = updatedAreas.findIndex(
        (area) => area.position === areaPosition,
      );

      if (value === "") {
        // Remove area if input is empty
        updatedAreas = updatedAreas.filter(
          (area) => area.position !== areaPosition,
        );
      } else {
        if (existingAreaIndex !== -1) {
          // Instead of mutating, create a new object
          updatedAreas[existingAreaIndex] = {
            ...updatedAreas[existingAreaIndex],
            name: value,
          };
        } else {
          // Add a new area
          updatedAreas.push({
            name: value,
            id: v4(), // Ensure you have v4 imported from uuid
            position: areaPosition,
            sectors: null,
          });
        }
      }

      return { ...prevLayout, areas: updatedAreas };
    });
  };

  async function HandleCreateAreas(modifiedAreas: AreaProps[]) {
    setIsModifyingAreas(true);
    const areasToSend = modifiedAreas || layoutData.areas;

    const createdAreas = await PostAPI(
      "/area/multi",
      {
        areas: areasToSend.map((area) => ({
          name: area.name,
          position: area.position,
        })),
      },
      true,
    );

    if (createdAreas.status === 200) {
      toast.success("Áreas cadastradas com sucesso");
      await GetAreas(); // re-fetch areas from the API
      setSelectedLayoutStep(2);
    } else {
      toast.error("Erro ao cadastrar Áreas");
    }
    return setIsModifyingAreas(false);
  }

  async function HandleUpdateAreas(modifiedAreas: AreaProps[]) {
    if (modifiedAreas.length === 0) return;
    setIsModifyingAreas(true);

    const editedAreas = await PutAPI(
      "/area/multi",
      {
        areas: modifiedAreas.map((area) => {
          // find the backend’s real ID by position
          const orig = originalAreas?.find((o) => o.position === area.position);
          return {
            name: area.name,
            position: area.position,
            areaId: orig?.id ?? area.id, // ← use the real id if it existed
          };
        }),
      },
      true,
    );

    if (editedAreas.status === 200) {
      toast.success("Áreas atualizadas com sucesso");
      await GetAreas();
      setSelectedLayoutStep(2);
    } else {
      toast.error("Erro ao atualizar Áreas");
    }

    setIsModifyingAreas(false);
  }
  async function HandleDeleteAreas(modifiedAreas: AreaProps[]) {
    if (modifiedAreas.length === 0) return;
    setIsModifyingAreas(true);
    const ids = modifiedAreas.map((area) => area.id).join(",");
    const deletedAreas = await DeleteAPI(`/area?areas=${ids}`, true);

    if (deletedAreas.status === 200) {
      toast.success("Áreas deletadas com sucesso");
      await GetAreas();
      setSelectedLayoutStep(2);
    } else {
      toast.error("Erro ao deletar as Áreas");
    }
    return setIsModifyingAreas(false);
  }

  const HandleNextStep = () => {
    const currentAreas = layoutData.areas || [];
    const original = originalAreas || [];

    // Areas that are new (in current but not original)
    const newAreas = currentAreas.filter(
      (area) => !original.find((orig) => orig.position === area.position),
    );

    // Areas that exist in both but with a changed name
    const modifiedAreas = currentAreas.filter((updated) => {
      const orig = original.find((orig) => orig.position === updated.position);
      return orig && orig.name !== updated.name;
    });

    // Areas that were in the original but are no longer present in current
    const deletedAreas = original.filter(
      (orig) => !currentAreas.find((area) => area.position === orig.position),
    );

    const promises: Promise<void>[] = [];

    if (newAreas.length > 0) {
      promises.push(HandleCreateAreas(newAreas));
    }
    if (modifiedAreas.length > 0) {
      promises.push(HandleUpdateAreas(modifiedAreas));
    }
    if (deletedAreas.length > 0) {
      promises.push(HandleDeleteAreas(deletedAreas));
    }

    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        setSelectedLayoutStep(2);
      });
    } else {
      setSelectedLayoutStep(2);
    }
  };

  useEffect(() => {
    setInputValues((prev) => {
      const merged = [...prev];
      layoutData.areas?.forEach((area) => {
        const pos = parseInt(area.position, 10) - 1;
        if (pos >= merged.length) {
          const numToAdd = pos - merged.length + 1;
          for (let i = 0; i < numToAdd; i++) {
            merged.push("");
          }
        }
        merged[pos] = area.name;
      });
      return merged;
    });
  }, [layoutData.areas]);

  useEffect(() => {
    setAreasArrayLength(inputValues.length);
    setAreasPages(Math.ceil(inputValues.length / 6));
  }, [inputValues]);

  return (
    <>
      <AccordionItem value="1" onClick={() => setSelectedLayoutStep(1)}>
        <AccordionTrigger arrow>
          {isGettingData ? (
            <Skeleton className="h-10" />
          ) : (
            <div className="flex w-full items-center justify-between">
              <div className="text-primary flex items-center gap-2 text-base font-bold md:gap-4 md:text-2xl">
                <span>1.1</span>
                <div className="flex flex-col">
                  <span className="leading-6">Cadastramento de Áreas</span>
                  <span
                    className={cn(
                      "w-max text-xs font-normal text-neutral-500 md:text-sm",
                      selectedLayoutStep !== 1 && "hidden",
                    )}
                  >
                    O que é uma Área? Explicitar
                  </span>
                </div>
              </div>
              {selectedLayoutStep === 1 && (
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
                            setIsAreaTemplateSheetOpen(true);
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
                      layoutData &&
                        layoutData.areas &&
                        layoutData.areas.length === 0 &&
                        "pointer-events-none cursor-not-allowed opacity-50",
                    )}
                  >
                    {isModifyingAreas || isModifyingAreas ? (
                      <>
                        <span className="hidden md:block">Salvando...</span>
                        <Loader2 className="h-4 animate-spin md:h-8" />
                      </>
                    ) : (
                      <>
                        <span className="hidden md:block">Avançar 1.2</span>
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
          <div className="grid grid-cols-3 gap-2 border-t border-neutral-300 p-2 md:gap-4 md:p-4">
            {isGettingData
              ? [...Array(6)].map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton />
                  </div>
                ))
              : [...Array(areasArrayLength)]
                  .slice((currentPage - 1) * 6, currentPage * 6)
                  .map((item, index) => {
                    const stateIndex = (currentPage - 1) * 6 + index;
                    return (
                      <div key={stateIndex} className="flex flex-col gap-2">
                        <span className="text-primary text-sm">
                          Área {stateIndex + 1}
                        </span>
                        <label
                          className={cn(
                            "relative flex h-12 items-center justify-end rounded-2xl px-2 md:px-4",
                            inputValues[stateIndex] ? "bg-primary" : "",
                          )}
                        >
                          <input
                            className={cn(
                              "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                              inputValues[stateIndex] ? "text-white" : "",
                            )}
                            placeholder="Nome da Área"
                            value={inputValues[stateIndex] || ""}
                            onChange={(e) =>
                              HandleInputChange(stateIndex, e.target.value)
                            }
                          />
                          <Image
                            src="/icons/area.png"
                            alt=""
                            width={200}
                            height={200}
                            className={cn(
                              "absolute h-max w-5 object-contain transition duration-200 peer-focus:translate-x-2 peer-focus:opacity-0",
                              inputValues[stateIndex]
                                ? "opacity-0"
                                : "peer-focus:translate-x-2 peer-focus:opacity-0",
                            )}
                          />
                          <Image
                            src={
                              inputValues[stateIndex]
                                ? "/icons/checkCheckWhite.png"
                                : "/icons/checkCheck.png"
                            }
                            alt=""
                            width={200}
                            height={200}
                            className={cn(
                              "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                              inputValues[stateIndex]
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-2 opacity-0",
                            )}
                          />
                          <div
                            className={cn(
                              "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                              inputValues[stateIndex]
                                ? "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]"
                                : "",
                            )}
                          />
                        </label>
                      </div>
                    );
                  })}
            {isGettingData ? (
              <Skeleton />
            ) : (
              <button
                onClick={handleAddArea}
                className="bg-primary flex h-12 w-full items-center gap-1 self-end rounded-full px-2 font-bold text-white md:px-4"
              >
                <p className="text-xs md:text-sm">+ Cadastrar </p>
                <p className="hidden md:block"> Área</p>
              </button>
            )}
          </div>

          {isGettingData ? (
            <Skeleton className="ml-auto w-80" />
          ) : (
            <CustomPagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pages={areasPages}
            />
          )}
        </AccordionContent>
      </AccordionItem>
      {isAreaTemplateSheetOpen && (
        <AreaTemplateSheet
          open={isAreaTemplateSheetOpen}
          onClose={() => setIsAreaTemplateSheetOpen(false)}
        />
      )}
    </>
  );
}
