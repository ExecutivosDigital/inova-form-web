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

interface PermissionsAccordionProps {
  selectedUsersStep: number;
  setSelectedUsersStep: React.Dispatch<React.SetStateAction<number>>;
}

export function PermissionsAccordion({
  selectedUsersStep,
  setSelectedUsersStep,
}: PermissionsAccordionProps) {
  const [isImportHovered, setIsImportHovered] = useState(false);

  return (
    <AccordionItem value="3" onClick={() => setSelectedUsersStep(3)}>
      <AccordionTrigger arrow>
        <div className="flex w-full items-center justify-between">
          <div className="text-primary flex items-center gap-4 text-2xl font-bold">
            <span>1.3</span>
            <div className="flex flex-col">
              <span className="leading-6">
                Definição de Permissões no Sistema
              </span>
              <span
                className={cn(
                  "w-max text-sm font-normal text-neutral-500",
                  selectedUsersStep !== 3 && "hidden",
                )}
              >
                O que é e como funciona?
              </span>
            </div>
          </div>
          {selectedUsersStep === 3 && (
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
                  setSelectedUsersStep(4);
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
