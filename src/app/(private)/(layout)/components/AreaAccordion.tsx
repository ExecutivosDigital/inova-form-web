"use client";
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
import { ArrowRight, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { v4 } from "uuid";

interface AreaAccordionProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
}

export function AreaAccordion({
  selectedLayoutStep,
  setSelectedLayoutStep,
}: AreaAccordionProps) {
  const { layoutData, setLayoutData } = useLayoutContext();
  const [isImportHovered, setIsImportHovered] = useState(false);
  const [areasArrayLength, setAreasArrayLength] = useState(5);
  const [inputValues, setInputValues] = useState<string[]>(
    Array(areasArrayLength).fill(""),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [areasPages, setAreasPages] = useState<number>(1);

  const handleAddArea = () => {
    setAreasArrayLength((prevLength) => prevLength + 1);
    setInputValues((prev) => [...prev, ""]);
    setAreasPages((prevPages) =>
      (areasArrayLength + 1) / 6 > prevPages ? prevPages + 1 : prevPages,
    );
  };

  const handleInputChange = (index: number, value: string) => {
    const id = currentPage > 1 ? (currentPage - 1) * 6 + index + 1 : index + 1;
    setInputValues((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[id] = value;
      return updatedInputs;
    });

    setLayoutData((prevLayout) => {
      let updatedAreas = [...(prevLayout.areas || [])];

      const existingAreaIndex = updatedAreas.findIndex(
        (area) => area.localId === id.toString(),
      );

      if (value === "") {
        // If input is empty, remove the area from layoutData
        updatedAreas = updatedAreas.filter(
          (area) => area.localId !== id.toString(),
        );

        // If the array is empty, revert it to null
        return {
          ...prevLayout,
          areas: updatedAreas.length > 0 ? updatedAreas : null,
        };
      }

      if (existingAreaIndex !== -1) {
        // If area already exists, update its name
        updatedAreas[existingAreaIndex].name = value;
      } else {
        // Otherwise, add a new area
        updatedAreas.push({
          name: value,
          id: v4(),
          localId: id.toString(),
          sectors: null,
        });
      }

      return { ...prevLayout, areas: updatedAreas };
    });
  };

  return (
    <AccordionItem value="1" onClick={() => setSelectedLayoutStep(1)}>
      <AccordionTrigger arrow>
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
                  setSelectedLayoutStep(2);
                }}
                className={cn(
                  "bg-primary flex h-6 items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-white md:h-10 md:px-4",
                  layoutData &&
                    !layoutData.areas &&
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
        <div className="grid grid-cols-3 gap-2 border-t border-neutral-300 p-2 md:gap-4 md:p-4">
          {[...Array(areasArrayLength)]
            .slice((currentPage - 1) * 6, currentPage * 6)
            .map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <span className="text-primary text-sm">
                  Área{" "}
                  {currentPage > 1
                    ? (currentPage - 1) * 6 + index + 1
                    : index + 1}
                </span>
                <label
                  className={cn(
                    "relative flex h-12 items-center justify-end rounded-2xl px-2 md:px-4",
                    inputValues[
                      currentPage > 1
                        ? (currentPage - 1) * 6 + index + 1
                        : index + 1
                    ]
                      ? "bg-primary"
                      : "",
                  )}
                >
                  <input
                    className={cn(
                      "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                      inputValues[
                        currentPage > 1
                          ? (currentPage - 1) * 6 + index + 1
                          : index + 1
                      ]
                        ? "text-white"
                        : "",
                    )}
                    placeholder="Nome da Área"
                    value={
                      inputValues[
                        currentPage > 1
                          ? (currentPage - 1) * 6 + index + 1
                          : index + 1
                      ] || ""
                    }
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                  <Image
                    src="/icons/area.png"
                    alt=""
                    width={200}
                    height={200}
                    className={cn(
                      "absolute h-max w-5 object-contain transition duration-200 peer-focus:translate-x-2 peer-focus:opacity-0",
                      inputValues[
                        currentPage > 1
                          ? (currentPage - 1) * 6 + index + 1
                          : index + 1
                      ]
                        ? "opacity-0"
                        : "peer-focus:translate-x-2 peer-focus:opacity-0",
                    )}
                  />
                  <Image
                    src={
                      inputValues[
                        currentPage > 1
                          ? (currentPage - 1) * 6 + index + 1
                          : index + 1
                      ]
                        ? "/icons/checkCheckWhite.png"
                        : "/icons/checkCheck.png"
                    }
                    alt=""
                    width={200}
                    height={200}
                    className={cn(
                      "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                      inputValues[
                        currentPage > 1
                          ? (currentPage - 1) * 6 + index + 1
                          : index + 1
                      ]
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-2 opacity-0",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                      inputValues[
                        currentPage > 1
                          ? (currentPage - 1) * 6 + index + 1
                          : index + 1
                      ]
                        ? "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]"
                        : "",
                    )}
                  />
                </label>
              </div>
            ))}
          <button
            onClick={handleAddArea}
            className="bg-primary flex h-12 w-full items-center gap-1 self-end rounded-full px-2 font-bold text-white md:px-4"
          >
            <p className="text-xs md:text-sm">+ Cadastrar </p>
            <p className="hidden md:block"> Área</p>
          </button>
        </div>
        <CustomPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pages={areasPages}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
