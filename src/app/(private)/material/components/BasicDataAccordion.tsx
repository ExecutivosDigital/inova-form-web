"use client";
import { MaterialTypeProps } from "@/@types/MaterialTypes";
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
import { useMaterialContext } from "@/context/MaterialContext";
import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { ArrowRight, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 } from "uuid";

interface BasicDataAccordionProps {
  selectedMaterialStep: number;
  setSelectedMaterialStep: React.Dispatch<React.SetStateAction<number>>;
}

export function BasicDataAccordion({
  selectedMaterialStep,
  setSelectedMaterialStep,
}: BasicDataAccordionProps) {
  const {
    materialsData,
    setMaterialsData,
    GetMaterials,
    originalMaterials,
    isGettingData,
  } = useMaterialContext();
  const { PostAPI, PutAPI, DeleteAPI } = useApiContext();
  const [materialsArrayLength, setMaterialsArrayLength] = useState(5);
  const [inputValues, setInputValues] = useState<string[]>(
    Array(materialsArrayLength).fill(""),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [materialsPages, setMaterialsPages] = useState<number>(1);
  const [isModifyingMaterials, setIsModifyingMaterials] = useState(false);
  const [isMaterialTemplateSheetOpen, setIsMaterialTemplateSheetOpen] =
    useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAddMaterial = () => {
    setMaterialsArrayLength((prevLength) => prevLength + 1);
    setInputValues((prev) => [...prev, ""]);
    setMaterialsPages((prevPages) =>
      (materialsArrayLength + 1) / 6 > prevPages ? prevPages + 1 : prevPages,
    );
  };

  const HandleInputChange = (index: number, value: string) => {
    setInputValues((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[index] = value;
      return updatedInputs;
    });

    setMaterialsData((prevMaterials) => {
      let updatedMaterials = [...(prevMaterials || [])];
      const materialPosition = (index + 1).toString();

      const existingMaterialIndex = updatedMaterials.findIndex(
        (material) => material.position === materialPosition,
      );

      if (value === "") {
        updatedMaterials = updatedMaterials.filter(
          (material) => material.position !== materialPosition,
        );
      } else {
        if (existingMaterialIndex !== -1) {
          updatedMaterials[existingMaterialIndex] = {
            ...updatedMaterials[existingMaterialIndex],
            name: value,
          };
        } else {
          updatedMaterials.push({
            name: value,
            id: v4(),
            position: materialPosition,
          });
        }
      }

      return updatedMaterials;
    });
  };

  async function HandleCreateMaterials(modifiedMaterials: MaterialTypeProps[]) {
    setIsModifyingMaterials(true);
    const materialsToSend = modifiedMaterials || materialsData;

    const createdMaterials = await PostAPI(
      "/product/multi",
      {
        products: materialsToSend.map((material) => ({
          name: material.name,
          position: material.position,
        })),
      },
      true,
    );
    if (createdMaterials.status === 200) {
      toast.success("Materiais cadastrados com sucesso");
      await GetMaterials();
      setSelectedMaterialStep(2);
    } else {
      toast.error("Erro ao cadastrar Materiais");
    }
    return setIsModifyingMaterials(false);
  }

  async function HandleUpdateMaterials(modifiedMaterials: MaterialTypeProps[]) {
    if (modifiedMaterials.length === 0) return;
    setIsModifyingMaterials(true);

    const editedMaterials = await PutAPI(
      "/product/multi",
      {
        products: modifiedMaterials.map((material) => {
          const orig = originalMaterials?.find(
            (o) => o.position === material.position,
          );
          return {
            name: material.name,
            position: material.position,
            productId: orig?.id ?? material.id,
          };
        }),
      },
      true,
    );

    if (editedMaterials.status === 200) {
      toast.success("Materiais atualizados com sucesso");
      await GetMaterials();
      setSelectedMaterialStep(2);
    } else {
      toast.error("Erro ao atualizar Materiais");
    }

    setIsModifyingMaterials(false);
  }

  async function HandleDeleteMaterials(modifiedMaterials: MaterialTypeProps[]) {
    if (modifiedMaterials.length === 0) return;
    setIsModifyingMaterials(true);
    const ids = modifiedMaterials.map((material) => material.id).join(",");
    const deletedMaterials = await DeleteAPI(`/product?products=${ids}`, true);

    if (deletedMaterials.status === 200) {
      toast.success("Materiais deletados com sucesso");
      await GetMaterials();
      setSelectedMaterialStep(2);
    } else {
      toast.error("Erro ao deletar os Materiais");
    }
    return setIsModifyingMaterials(false);
  }

  const HandleNextStep = () => {
    const currentMaterials = materialsData || [];
    const original = originalMaterials || [];

    const newMaterials = currentMaterials.filter(
      (material) =>
        !original.find((orig) => orig.position === material.position),
    );

    const modifiedMaterials = currentMaterials.filter((updated) => {
      const orig = original.find((orig) => orig.position === updated.position);
      return orig && orig.name !== updated.name;
    });

    const deletedMaterials = original.filter(
      (orig) =>
        !currentMaterials.find(
          (material) => material.position === orig.position,
        ),
    );

    const promises: Promise<void>[] = [];

    if (newMaterials.length > 0) {
      promises.push(HandleCreateMaterials(newMaterials));
    }
    if (modifiedMaterials.length > 0) {
      promises.push(HandleUpdateMaterials(modifiedMaterials));
    }
    if (deletedMaterials.length > 0) {
      promises.push(HandleDeleteMaterials(deletedMaterials));
    }

    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        setSelectedMaterialStep(2);
      });
    } else {
      setSelectedMaterialStep(2);
    }
  };

  useEffect(() => {
    setInputValues((prev) => {
      const merged = [...prev];
      materialsData?.forEach((material) => {
        const pos = parseInt(material.position, 10) - 1;
        if (pos >= merged.length) {
          const numToAdd = pos - merged.length + 1;
          for (let i = 0; i < numToAdd; i++) {
            merged.push("");
          }
        }
        merged[pos] = material.name;
      });
      return merged;
    });
  }, [materialsData]);

  useEffect(() => {
    setMaterialsArrayLength(inputValues.length);
    setMaterialsPages(Math.ceil(inputValues.length / 6));
  }, [inputValues]);

  return (
    <>
      <AccordionItem value="1" onClick={() => setSelectedMaterialStep(1)}>
        <AccordionTrigger arrow>
          {isGettingData ? (
            <Skeleton className="h-10" />
          ) : (
            <div className="flex w-full items-center justify-between">
              <div className="text-primary flex items-center gap-2 text-base font-bold md:gap-4 md:text-2xl">
                <span>1.1</span>
                <div className="flex flex-col">
                  <span className="leading-6">Cadastramento de Materiais</span>
                  <span
                    className={cn(
                      "w-max text-xs font-normal text-neutral-500 md:text-sm",
                      selectedMaterialStep !== 1 && "hidden",
                    )}
                  >
                    O que é um Material? Explicitar
                  </span>
                </div>
              </div>
              {selectedMaterialStep === 1 && (
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
                            setIsMaterialTemplateSheetOpen(true);
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
                      (!materialsData || materialsData.length === 0) &&
                        "pointer-events-none cursor-not-allowed opacity-50",
                    )}
                  >
                    {isModifyingMaterials || isModifyingMaterials ? (
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
              : [...Array(materialsArrayLength)]
                  .slice((currentPage - 1) * 6, currentPage * 6)
                  .map((item, index) => {
                    const stateIndex = (currentPage - 1) * 6 + index;
                    return (
                      <div key={stateIndex} className="flex flex-col gap-2">
                        <span className="text-primary text-sm">
                          Material {stateIndex + 1}
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
                            placeholder="Nome do Material"
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
                onClick={handleAddMaterial}
                className="bg-primary flex h-12 w-full items-center gap-1 self-end rounded-full px-2 font-bold text-white md:px-4"
              >
                <p className="text-xs md:text-sm">+ Cadastrar </p>
                <p className="hidden md:block"> Material</p>
              </button>
            )}
          </div>

          {isGettingData ? (
            <Skeleton className="ml-auto w-80" />
          ) : (
            <CustomPagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pages={materialsPages}
            />
          )}
        </AccordionContent>
      </AccordionItem>
      {isMaterialTemplateSheetOpen && (
        <div></div>

        // <AreaTemplateSheet
        //   open={isMaterialTemplateSheetOpen}
        //   onClose={() => setIsMaterialTemplateSheetOpen(false)}
        // />
      )}
    </>
  );
}
