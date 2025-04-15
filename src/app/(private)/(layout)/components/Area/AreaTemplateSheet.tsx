"use client";

import { Button } from "@/components/global/ui/button";
import { ScrollArea } from "@/components/global/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from "@/components/global/ui/sheet";
import { useState } from "react";

interface AreaTemplateSheetProps {
  open: boolean;
  onClose: () => void;
}

interface TemplateInstanceProps {
  id: string; // unique ID
  name: string; // template name
}

export function AreaTemplateSheet({ open, onClose }: AreaTemplateSheetProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<
    TemplateInstanceProps[]
  >([]);
  const AVAILABLE_MODELS = [
    "Área Modelo 1",
    "Área Modelo 2",
    "Área Modelo 3",
    "Área Modelo 4",
  ];

  const handleAddTemplate = (templateName: string) => {
    const newTemplate: TemplateInstanceProps = {
      id: `${templateName}-${Date.now()}-${Math.random()}`, // unique id
      name: templateName,
    };
    setSelectedTemplates((prev) => [...prev, newTemplate]);
  };

  const handleRemoveTemplate = (id: string) => {
    setSelectedTemplates((prev) =>
      prev.filter((template) => template.id !== id),
    );
  };

  return (
    <Sheet open={open}>
      <SheetContent
        side="right"
        onClose={onClose}
        onPointerDownOutside={onClose}
        className="flex flex-col gap-4 bg-white"
      >
        <SheetTitle>Selecione um Modelo</SheetTitle>
        <ScrollArea className="flex h-full max-h-[calc(100vh-120px)] w-full flex-col">
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_MODELS.map((template, idx) => (
              <Button
                key={idx}
                variant="outline"
                onClick={() => handleAddTemplate(template)}
                className="whitespace-nowrap"
              >
                {template}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {selectedTemplates.map((template) => (
              <label
                key={template.id}
                className="flex w-max items-center gap-2"
              >
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked
                  onChange={() => handleRemoveTemplate(template.id)}
                />
                {template.name}
              </label>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter>
          <Button className="text-white" onClick={onClose}>
            Fechar
          </Button>
          <Button className="text-white" onClick={onClose}>
            Adicionar Modelos
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
