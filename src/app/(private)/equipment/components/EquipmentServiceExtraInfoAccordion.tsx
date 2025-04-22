"use client";
import { EquipmentTypeProps } from "@/@types/EquipmentTypes";
import { SectorProps } from "@/@types/LayoutTypes";
import { ServiceTypeProps } from "@/@types/ServiceTypes";
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
import { useEquipmentContext } from "@/context/EquipmentContext";
import { useLayoutContext } from "@/context/LayoutContext";
import { useServiceContext } from "@/context/ServiceContext";
import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Search,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

interface EquipmentServiceExtraInfoAccordionProps {
  selectedEquipmentStep: number;
  setSelectedEquipmentStep: React.Dispatch<React.SetStateAction<number>>;
}

export function EquipmentServiceExtraInfoAccordion({
  selectedEquipmentStep,
  setSelectedEquipmentStep,
}: EquipmentServiceExtraInfoAccordionProps) {
  const { layoutData } = useLayoutContext();
  const { equipmentData, setEquipmentData } = useEquipmentContext();
  const { serviceData } = useServiceContext();

  const [isImportHovered, setIsImportHovered] = useState(false);
  const [selectedSector, setSelectedSector] = useState<SectorProps | null>(
    null,
  );
  const [equipmentPages, setEquipmentPages] = useState<number>(1);
  const [servicePages, setServicePages] = useState<number>(1);
  const [currentEquipmentPage, setCurrentEquipmentPage] = useState(1);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [isSectorNameHovered, setIsSectorNameHovered] = useState(false);
  const [isEquipmentNameHovered, setIsEquipmentNameHovered] = useState(false);
  const [isEquipmentServiceHovered, setIsEquipmentServiceHovered] =
    useState(false);
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentTypeProps | null>(null);
  const [selectedService, setSelectedService] =
    useState<ServiceTypeProps | null>(null);

  const handleInputChange = (
    index: number,
    field: keyof ServiceTypeProps,
    value: string,
    serviceIndex: number,
  ) => {
    if (!selectedSector) return;

    // Update the equipmentData state
    setEquipmentData((prevEquipment) =>
      prevEquipment.map((equipment, eqIndex) => {
        if (eqIndex !== index) return equipment;

        // Copy the services array
        const updatedServices = [...equipment.services];

        // If service does not exist, create it using selectedService values
        if (updatedServices[serviceIndex]) {
          // Otherwise, update the existing service
          updatedServices[serviceIndex] = {
            ...updatedServices[serviceIndex],
            [field]: value,
          };
        }
        return {
          ...equipment,
          services: updatedServices,
        };
      }),
    );

    // Update the selectedEquipment state in a similar way
    setSelectedEquipment((prevEquipment) => {
      if (!prevEquipment) return null;
      const updatedServices = [...prevEquipment.services];
      if (updatedServices[serviceIndex]) {
        updatedServices[serviceIndex] = {
          ...updatedServices[serviceIndex],
          [field]: value,
        };
      }
      return {
        ...prevEquipment,
        services: updatedServices,
      };
    });
  };

  useEffect(() => {
    setEquipmentPages(
      Math.ceil((selectedSector?.equipments?.length || 0) / 12),
    );
  }, [selectedSector?.equipments?.length]);

  useEffect(() => {
    setServicePages(Math.ceil((serviceData.length || 0) / 12));
  }, [serviceData.length]);

  const isEquipmentServiceFullyFilled = (data: ServiceTypeProps) => {
    return data.estimatedFinishTime && data.extraTeam;
  };

  useEffect(() => {
    console.log("layoutData: ", layoutData);
    console.log("setSelectedSector: ", setSelectedSector);
  }, []);

  return (
    <AccordionItem value="6" onClick={() => setSelectedEquipmentStep(6)}>
      <AccordionTrigger arrow>
        <div className="flex w-full items-center justify-between">
          <div className="text-primary flex items-center gap-2 text-base font-bold md:gap-4 md:text-2xl">
            <span>1.6</span>
            <div className="flex flex-col">
              <span className="w-max leading-6">Requisitos Adicionais</span>
              <span
                className={cn(
                  "w-max text-xs font-normal text-neutral-500 md:text-sm",
                  selectedEquipmentStep !== 6 && "hidden",
                )}
              >
                O que é um Subconjunto? Explicitar
              </span>
            </div>
          </div>
          {selectedEquipmentStep === 6 && (
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
                className={cn(
                  "bg-primary pointer-events-none flex h-6 cursor-not-allowed items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-white opacity-50 md:h-10 md:px-4",
                  equipmentData
                    .flatMap((eq) =>
                      eq.services.find((s) => isEquipmentServiceFullyFilled(s)),
                    )
                    .find((s) => s) &&
                    "pointer-events-auto cursor-auto opacity-100",
                )}
              >
                <span className="hidden md:block">Próximo Cadastro</span>
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
            selectedEquipment && "grid-cols-3",
          )}
        >
          {selectedEquipment && selectedService ? (
            <>
              <div className="col-span-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedService(null)}
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
                  <Popover
                    open={isEquipmentServiceHovered}
                    onOpenChange={setIsEquipmentServiceHovered}
                  >
                    <PopoverTrigger
                      asChild
                      onMouseEnter={() => setIsEquipmentServiceHovered(true)}
                      onMouseLeave={() => setIsEquipmentServiceHovered(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEquipmentServiceHovered(false);
                      }}
                      onBlur={() => setIsEquipmentServiceHovered(false)}
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
                          {selectedService?.position}
                        </span>
                        <input
                          className={cn(
                            "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                            "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={selectedService?.name}
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
                      <span>{selectedService?.name}</span>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-2 md:gap-4">
                <div className="flex flex-col">
                  <span className="text-primary text-xs md:text-sm">
                    Tempo Estimado p/ Liberação
                  </span>
                  <input
                    type="text"
                    className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                    placeholder="Tempo estimado p/ liberação"
                    value={
                      equipmentData.find((eq) => eq.id === selectedEquipment.id)
                        ?.services[
                        Number(selectedService.position.split("S")[1]) - 1
                      ]?.estimatedFinishTime || ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        Number(
                          equipmentData
                            .find((eq) => eq.id === selectedEquipment.id)
                            ?.position.split(".")[2],
                        ) - 1,
                        "estimatedFinishTime",
                        e.target.value,
                        Number(selectedService.position.split("S")[1]) - 1,
                      )
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-primary text-xs md:text-sm">
                    Necessidade de Equipe Extra?
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="group relative">
                      <div className="relative flex w-full items-center">
                        <input
                          type="text"
                          className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                          placeholder="Tipo do Equipamento"
                          value={
                            equipmentData.find(
                              (eq) => eq.id === selectedEquipment.id,
                            )?.services[
                              Number(selectedService.position.split("S")[1]) - 1
                            ]?.extraTeam === "true"
                              ? "Sim"
                              : "Não"
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
                          handleInputChange(
                            Number(
                              equipmentData
                                .find((eq) => eq.id === selectedEquipment.id)
                                ?.position.split(".")[2],
                            ) - 1,
                            "extraTeam",
                            "true",
                            Number(selectedService.position.split("S")[1]) - 1,
                          )
                        }
                      >
                        Sim
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleInputChange(
                            Number(
                              equipmentData
                                .find((eq) => eq.id === selectedEquipment.id)
                                ?.position.split(".")[2],
                            ) - 1,
                            "extraTeam",
                            "false",
                            Number(selectedService.position.split("S")[1]) - 1,
                          )
                        }
                      >
                        Não
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-col">
                  <span className="text-primary text-xs md:text-sm">
                    Tempo Estimado Equipe Extra
                  </span>
                  <input
                    type="text"
                    className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                    placeholder="Tempo Estimado Equipe Extra"
                    value={
                      equipmentData.find((eq) => eq.id === selectedEquipment.id)
                        ?.services[
                        Number(selectedService.position.split("S")[1]) - 1
                      ]?.estimatedExtraTeamTime || ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        Number(
                          equipmentData
                            .find((eq) => eq.id === selectedEquipment.id)
                            ?.position.split(".")[2],
                        ) - 1,
                        "estimatedExtraTeamTime",
                        e.target.value,
                        Number(selectedService.position.split("S")[1]) - 1,
                      )
                    }
                  />
                </div>
              </div>
              <div className="col-span-1 flex flex-col justify-end">
                <div className="flex h-10 items-center justify-end gap-4 md:h-12">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="h-10 w-full rounded-xl bg-green-500 p-2 text-sm text-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] md:w-2/5"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </>
          ) : selectedEquipment ? (
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
              </div>
              {serviceData
                .slice((currentServicePage - 1) * 12, currentServicePage * 12)
                .map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <label
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(item);
                      }}
                      className={cn(
                        "relative flex h-10 cursor-pointer items-center justify-start rounded-2xl md:h-12",
                        equipmentData.some((eq) =>
                          eq.services.some(
                            (s) =>
                              s.id === item.id &&
                              isEquipmentServiceFullyFilled(s),
                          ),
                        ) && "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12",
                          equipmentData.some((eq) =>
                            eq.services.some(
                              (s) =>
                                s.id === item.id &&
                                isEquipmentServiceFullyFilled(s),
                            ),
                          ) && "bg-white/20 text-white",
                        )}
                      >
                        {item.position}
                      </span>
                      <input
                        className={cn(
                          "peer transparent absolute right-0 h-full w-[calc(100%-2.5rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:w-[calc(100%-3rem)] md:px-4 md:text-sm",
                          equipmentData.some((eq) =>
                            eq.services.some(
                              (s) =>
                                s.id === item.id &&
                                isEquipmentServiceFullyFilled(s),
                            ),
                          ) && "text-white",
                        )}
                        placeholder="Nome da Área"
                        value={item.name}
                        disabled
                      />

                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          equipmentData.some((eq) =>
                            eq.services.some(
                              (s) =>
                                s.id === item.id &&
                                isEquipmentServiceFullyFilled(s),
                            ),
                          ) && "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
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
              {equipmentData
                .slice(
                  (currentEquipmentPage - 1) * 12,
                  currentEquipmentPage * 12,
                )
                .map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    {/* <label
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
                        setSelectedEquipment(item);
                      }}
                      className={cn(
                        "relative flex h-10 cursor-pointer items-center justify-start rounded-2xl md:h-12",
                        item.services.find(isEquipmentServiceFullyFilled) &&
                          "bg-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12",
                          item.services.find(isEquipmentServiceFullyFilled) &&
                            "bg-white/20 text-white",
                        )}
                      >
                        {item.position}
                      </span>
                      <input
                        className={cn(
                          "peer transparent absolute right-0 h-full w-[calc(100%-2.5rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:w-[calc(100%-3rem)] md:px-4 md:text-sm",
                          item.services.find(isEquipmentServiceFullyFilled) &&
                            "text-white",
                        )}
                        placeholder="Nome da Área"
                        value={item.name}
                        disabled
                      />

                      <div
                        className={cn(
                          "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                          item.services.find(isEquipmentServiceFullyFilled) &&
                            "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                        )}
                      />
                    </label> */}
                  </div>
                ))}
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!selectedEquipment) {
                setSelectedEquipmentStep(1);
              } else if (selectedEquipment) {
                setSelectedEquipmentStep(2);
              }
            }}
            className={cn(
              "bg-primary flex h-10 w-full items-center justify-center gap-1 self-end rounded-full px-1 font-bold text-white md:px-4",
              selectedService && "hidden",
            )}
          >
            <p className="text-xs md:text-sm">+</p>
            <p className="hidden md:block">
              Cadastrar {selectedEquipment ? " Serviço" : " Equipamento"}
            </p>
          </button>
        </div>
        <div className={cn(selectedService && "hidden")}>
          <CustomPagination
            currentPage={
              selectedService ? currentServicePage : currentEquipmentPage
            }
            setCurrentPage={
              selectedService ? setCurrentServicePage : setCurrentEquipmentPage
            }
            pages={selectedService ? servicePages : equipmentPages}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
