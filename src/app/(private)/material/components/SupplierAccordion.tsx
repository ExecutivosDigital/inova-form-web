"use client";
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
import { cn } from "@/lib/utils";
import { ArrowRight, Upload } from "lucide-react";
import { useState } from "react";

interface SupplierAccordionProps {
  selectedMaterialStep: number;
  setSelectedMaterialStep: React.Dispatch<React.SetStateAction<number>>;
}

export function SupplierAccordion({
  selectedMaterialStep,
  setSelectedMaterialStep,
}: SupplierAccordionProps) {
  const [isImportHovered, setIsImportHovered] = useState(false);

  return (
    <AccordionItem value="4" onClick={() => setSelectedMaterialStep(4)}>
      <AccordionTrigger arrow>
        <div className="flex w-full items-center justify-between">
          <div className="text-primary flex items-center gap-4 text-2xl font-bold">
            <span>1.4</span>
            <div className="flex flex-col">
              <span className="leading-6">Fornecedores e Contatos</span>
              <span
                className={cn(
                  "w-max text-sm font-normal text-neutral-500",
                  selectedMaterialStep !== 4 && "hidden",
                )}
              >
                O que é e como funciona?
              </span>
            </div>
          </div>
          {selectedMaterialStep === 4 && (
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
                  setSelectedMaterialStep(5);
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
        <div>Teste</div>
      </AccordionContent>
    </AccordionItem>
  );
}
