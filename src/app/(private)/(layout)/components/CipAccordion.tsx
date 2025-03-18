"use client";
import {
  CipProps,
  EquipmentsProps,
  SectorProps,
  SetProps,
  SubSetProps,
} from "@/@types/LayoutTypes";
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

interface CipAccordionProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
}

export function CipAccordion({
  selectedLayoutStep,
  setSelectedLayoutStep,
}: CipAccordionProps) {
  const { layoutData } = useLayoutContext();
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
    Array(cipArrayLength).fill({
      name: "",
      code: "",
    }),
  );

  const handleInputChange = (
    index: number,
    field: keyof SubSetProps, // Now handling SubSetProps
    value: string,
  ) => {};

  const isCipFullyFilled = (cip: CipProps) => {
    return cip.name && cip.code;
  };

  const handleAddCip = () => {
    setCipArrayLength((prevLength) => prevLength + 1);
    setInputCipValues((prev) => [
      ...prev,
      {
        name: "",
        code: "",
        id: "",
        localId: "",
      },
    ]);
  };

  useEffect(() => {
    if (!layoutData) return;

    if (selectedSet) {
      // If a set is selected, pagination should depend on the number of subSets
      return setSubSetPages(
        Math.ceil((selectedSet.subSets?.length || 0) / 6) || 1,
      );
    } else if (selectedEquipment) {
      // If an equipment is selected, pagination should depend on the number of sets
      return setSetPages(
        Math.ceil((selectedEquipment.sets?.length || 0) / 6) || 1,
      );
    } else {
      // If no equipment is selected, pagination should depend on the number of equipments in the sector
      const totalEquipments =
        layoutData?.areas
          ?.flatMap((area) => area.sectors || [])
          ?.flatMap((sector) => sector.equipments || []).length || 0;

      return setEquipmentPages(Math.ceil(totalEquipments / 12) || 1);
    }
  }, [layoutData, selectedEquipment, selectedSet]);

  return (
    <AccordionItem value="6" onClick={() => setSelectedLayoutStep(6)}>
      <AccordionTrigger arrow>
        <div className="flex w-full items-center justify-between">
          <div className="text-primary flex items-center gap-4 text-2xl font-bold">
            <span>1.6</span>
            <div className="flex flex-col">
              <span className="leading-6">Cadastramento de CIP?</span>
              <span
                className={cn(
                  "w-max text-sm font-normal text-neutral-500",
                  selectedLayoutStep !== 6 && "hidden",
                )}
              >
                O que é um Subconjunto? Explicitar
              </span>
            </div>
          </div>
          {selectedLayoutStep === 6 && (
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
                }}
                className="bg-primary flex h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
              >
                <span>Próximo Cadastramento</span>
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
            selectedEquipment && "grid-cols-3",
            selectedSubSet && "px-0",
          )}
        >
          {selectedSubSet ? (
            <div className="col-span-3 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2 px-4">
                <button
                  onClick={() => setSelectedSubSet(null)}
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
                        "relative flex h-12 w-40 items-center justify-start overflow-hidden rounded-2xl pr-1",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl p-1 font-bold",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedSector?.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
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
                            sector.localId ===
                            selectedEquipment?.localId.slice(0, 3),
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
                        "relative flex h-12 w-40 items-center justify-start overflow-hidden rounded-2xl pr-1",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl p-1 font-bold",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedEquipment?.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
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
                        "relative flex h-12 w-40 items-center justify-start overflow-hidden rounded-2xl pr-1",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl p-1 font-bold",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedSet?.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
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
                        "relative flex h-12 w-40 items-center justify-start overflow-hidden rounded-2xl pr-1",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl p-1 font-bold",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedSubSet?.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
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
                      className="col-span-3 mb-1 flex items-end justify-between gap-4 px-4"
                    >
                      <div
                        className={cn(
                          "text-primary flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl bg-white font-bold shadow-[0px_2px_7px_rgba(0,0,0,0.15)]",
                          isCipFullyFilled(inputCipValues[index]) &&
                            "bg-primary text-white",
                        )}
                      >
                        <span>{index + 1}.</span>
                      </div>

                      <div className="flex w-full flex-col">
                        <span className="text-primary text-sm">
                          Código (CIP)
                        </span>
                        <input
                          type="text"
                          className="h-12 w-full rounded-2xl bg-white p-2 px-4 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none"
                          placeholder="Identificação do Subconjunto"
                          onChange={(e) =>
                            handleInputChange(index, "name", e.target.value)
                          }
                          value={inputCipValues[index].name}
                        />
                      </div>

                      <div className="flex w-full flex-col">
                        <span className="text-primary text-sm">
                          Nome do Ponto
                        </span>
                        <input
                          type="text"
                          className="h-12 w-full rounded-2xl bg-white p-2 px-4 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none"
                          placeholder="Identificação do Subconjunto"
                          onChange={(e) =>
                            handleInputChange(index, "name", e.target.value)
                          }
                          value={inputCipValues[index].name}
                        />
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <div className="flex w-full items-center justify-between px-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddCip();
                  }}
                  className={cn(
                    "bg-primary h-12 w-max self-end rounded-full px-4 font-bold text-white",
                  )}
                >
                  + Cadastrar outro CIP
                </button>
                <button
                  onClick={() => setSelectedSet(null)}
                  className="h-10 w-40 rounded-xl bg-green-500 p-2 text-sm text-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)]"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : selectedSet ? (
            <>
              <div className="col-span-3 flex items-center gap-2">
                <button
                  onClick={() => setSelectedSet(null)}
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
                        "relative flex h-12 w-40 items-center justify-start overflow-hidden rounded-2xl pr-1",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl p-1 font-bold",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedSector?.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
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
                            sector.localId ===
                            selectedEquipment?.localId.slice(0, 3),
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
                        "relative flex h-12 w-40 items-center justify-start overflow-hidden rounded-2xl pr-1",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl p-1 font-bold",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedEquipment?.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
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
                        "relative flex h-12 w-40 items-center justify-start overflow-hidden rounded-2xl pr-1",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl p-1 font-bold",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedSet?.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
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
              {selectedSet.subSets
                ?.slice((currentSubSetPage - 1) * 6, currentSubSetPage * 6)
                .map((subSet, index) => (
                  <div key={index + "subSet"} className="flex flex-col gap-2">
                    <span className="text-primary text-sm">{subSet.name}</span>
                    <label
                      onClick={() => setSelectedSubSet(subSet)} // Select a subSet on click
                      className={cn(
                        "relative flex h-12 items-center justify-end rounded-2xl px-4",
                        subSet.cip ? "bg-primary" : "",
                      )}
                    >
                      <input
                        className={cn(
                          "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-4 placeholder:text-neutral-300 focus:outline-none",
                          subSet.cip ? "text-white" : "",
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
                          subSet.cip
                            ? "opacity-0"
                            : "peer-focus:translate-x-2 peer-focus:opacity-0",
                        )}
                      />
                      <Image
                        src={
                          subSet.cip
                            ? "/icons/checkCheckWhite.png"
                            : "/icons/checkCheck.png"
                        }
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                          subSet.cip
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          subSet.cip
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
              <div className="col-span-3 flex items-center gap-2">
                <button
                  onClick={() => setSelectedEquipment(null)}
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
                        "relative flex h-12 w-40 items-center justify-start overflow-hidden rounded-2xl pr-1",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl p-1 font-bold",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedSector?.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
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
                            sector.localId ===
                            selectedEquipment?.localId.slice(0, 3),
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
                        "relative flex h-12 w-40 items-center justify-start overflow-hidden rounded-2xl pr-1",
                        "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl p-1 font-bold",
                          "bg-white/20 text-white",
                        )}
                      >
                        {selectedEquipment.localId}
                      </span>
                      <input
                        className={cn(
                          "peer transparent h-full px-4 placeholder:text-neutral-300 focus:outline-none",
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
              {selectedEquipment?.sets
                ?.slice((currentSetPage - 1) * 6, currentSetPage * 6)
                .map((item, index) => (
                  <div key={index + "set"} className="flex flex-col gap-2">
                    <span className="text-primary text-sm">{item.name}</span>
                    <label
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSet(item);
                        setCurrentEquipmentPage(1);
                        setCurrentSetPage(1);
                        setCurrentSubSetPage(1);
                      }}
                      className={cn(
                        "relative flex h-12 items-center justify-end rounded-2xl px-4",
                        "bg-primary",
                      )}
                    >
                      <input
                        className={cn(
                          "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-4 placeholder:text-neutral-300 focus:outline-none",
                          "text-white",
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
                          "opacity-0",
                        )}
                      />
                      <Image
                        src={"/icons/checkCheckWhite.png"}
                        alt=""
                        width={200}
                        height={200}
                        className={cn(
                          "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                          "translate-x-0 opacity-100",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
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
                  .flatMap((sector) => sector.equipments || [])
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
                                  sector.localId === item.localId.slice(0, 3),
                              ) as SectorProps,
                          );
                          setCurrentEquipmentPage(1);
                          setCurrentSetPage(1);
                          setCurrentSubSetPage(1);
                          setSelectedEquipment(item);
                        }}
                        className={cn(
                          "relative flex h-12 cursor-pointer items-center justify-start rounded-2xl pr-1",
                          item.sets?.find((set) => set.subSets) && "bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-2xl p-1 font-bold",
                            item.sets?.find((set) => set.subSets) &&
                              "bg-white/20 text-white",
                          )}
                        >
                          {item.localId}
                        </span>
                        <input
                          className={cn(
                            "peer transparent absolute right-0 h-full w-[calc(100%-3rem)] px-4 placeholder:text-neutral-300 focus:outline-none",
                            item.sets?.find((set) => set.subSets) &&
                              "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={item.name}
                          disabled
                        />

                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            item.sets?.find((set) => set.subSets) &&
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
              if (!selectedEquipment) {
                setSelectedLayoutStep(3);
              } else if (selectedEquipment && !selectedSet) {
                setSelectedLayoutStep(4);
              } else if (selectedEquipment && selectedSet && !selectedSubSet) {
                setSelectedLayoutStep(5);
              }
            }}
            className={cn(
              "bg-primary h-12 w-full self-end rounded-full px-4 font-bold text-white",
              selectedSubSet && "hidden",
            )}
          >
            + Cadastrar{" "}
            {selectedSet
              ? "outro Subconjunto"
              : selectedEquipment
                ? "outro Conjunto"
                : "outro Equipamento"}
          </button>
        </div>
        <div
          className={cn(
            "flex w-full items-center justify-end",
            selectedSubSet && "hidden",
          )}
        >
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
      </AccordionContent>
    </AccordionItem>
  );
}
