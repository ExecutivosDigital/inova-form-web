"use client";

import { AreaProps } from "@/@types/LayoutTypes";
import { Button } from "@/components/global/ui/button";
import { ScrollArea } from "@/components/global/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from "@/components/global/ui/sheet";
import { useLayoutContext } from "@/context/LayoutContext";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { v4 } from "uuid";

interface AreaTemplateSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AreaTemplateSheet({ open, onClose }: AreaTemplateSheetProps) {
  const { layoutData, setLayoutData } = useLayoutContext();
  const [selectedTemplates, setSelectedTemplates] = useState<AreaProps[]>([]);
  const [isCreatingAreas, setIsCreatingAreas] = useState(false);
  const AVAILABLE_MODELS = [
    {
      name: "Área Modelo 1",
      id: v4(),
      position: "1",
      sectors: [],
    },
  ];

  const handleAddTemplate = (template: AreaProps) => {
    const existingPositions = [
      ...(layoutData.areas?.map((area) => parseInt(area.position || "0")) ||
        []),
      ...selectedTemplates.map((area) => parseInt(area.position || "0")),
    ];

    const maxPosition = existingPositions.length
      ? Math.max(...existingPositions)
      : 0;

    const newTemplate: AreaProps = {
      ...template,
      position: (maxPosition + 1).toString(),
      id: v4(), // regenerate ID so each template is unique
    };

    setSelectedTemplates((prev) => [...prev, newTemplate]);
  };

  const handleRemoveTemplate = (id: string) => {
    setSelectedTemplates((prev) =>
      prev.filter((template) => template.id !== id),
    );
  };

  const HandleCreateArea = () => {
    if (!layoutData.areas) return;

    setIsCreatingAreas(true);
    const areasToSend = selectedTemplates.map((area) => ({
      name: area.name,
      position: area.position,
      sectors: area.sectors,
      id: v4(),
    }));
    setLayoutData((prev) => ({
      ...prev,
      areas: [...(prev.areas || []), ...areasToSend],
    }));
    toast.success("Áreas adicionadas com sucesso");
    onClose();
    setIsCreatingAreas(false);
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
                {template.name}
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
          <Button
            disabled={isCreatingAreas}
            className="text-white"
            onClick={HandleCreateArea}
          >
            {isCreatingAreas ? (
              <>
                <span>Salvano...</span>
                <Loader2 className="mr-2 animate-spin" />
              </>
            ) : (
              "Adicionar Modelos"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
