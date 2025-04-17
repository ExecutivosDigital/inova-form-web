"use client";

import { AreaProps, SectorProps } from "@/@types/LayoutTypes";
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

interface SectorTemplateSheetProps {
  open: boolean;
  onClose: () => void;
  selectedArea: AreaProps;
}

interface TemplateInstanceProps {
  id: string;
  name: string;
}

export function SectorTemplateSheet({
  open,
  onClose,
  selectedArea,
}: SectorTemplateSheetProps) {
  const { layoutData, setLayoutData } = useLayoutContext();
  const [selectedTemplates, setSelectedTemplates] = useState<
    TemplateInstanceProps[]
  >([]);
  const [isCreating, setIsCreating] = useState(false);

  // Predefined sector models
  const AVAILABLE_MODELS: Array<{ id: string; name: string }> = [
    { id: v4(), name: "Setor Modelo 1" },
    { id: v4(), name: "Setor Modelo 2" },
    { id: v4(), name: "Setor Modelo 3" },
    { id: v4(), name: "Setor Modelo 4" },
  ];

  const handleAddTemplate = (template: { id: string; name: string }) => {
    // Clone with a fresh ID
    setSelectedTemplates((prev) => [...prev, { ...template, id: v4() }]);
  };

  const handleRemoveTemplate = (id: string) => {
    setSelectedTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateSectors = () => {
    if (!layoutData.areas) return;
    setIsCreating(true);

    setLayoutData((prev) => {
      const updatedAreas = prev.areas!.map((area) => {
        if (area.id !== selectedArea.id) return area;

        // Clone existing sectors
        const existing = area.sectors ?? [];
        // Determine starting index for new sectors
        const indices = existing
          .map((s) => parseInt(s.position.split(".")[1], 10))
          .filter((n) => !isNaN(n));
        const maxIndex = indices.length ? Math.max(...indices) : 0;

        // Build new SectorProps
        const newSectors: SectorProps[] = selectedTemplates.map((t, i) => ({
          id: v4(),
          name: t.name,
          position: `${area.position}.${maxIndex + i + 1}`,
          equipments: null,
        }));

        return {
          ...area,
          sectors: [...existing, ...newSectors],
        };
      });
      return { ...prev, areas: updatedAreas };
    });

    toast.success("Setores adicionados com sucesso");
    setIsCreating(false);
    onClose();
  };

  return (
    <Sheet open={open}>
      <SheetContent
        side="right"
        onClose={onClose}
        onPointerDownOutside={onClose}
        className="flex flex-col gap-4 bg-white"
      >
        <SheetTitle>Selecione um Modelo de Setor</SheetTitle>
        <ScrollArea className="flex h-full max-h-[calc(100vh-120px)] w-full flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_MODELS.map((model) => (
              <Button
                key={model.id}
                variant="outline"
                onClick={() => handleAddTemplate(model)}
              >
                {model.name}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {selectedTemplates.map((template) => (
              <label key={template.id} className="flex items-center gap-2">
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
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <Button
            disabled={isCreating}
            className="text-white"
            onClick={handleCreateSectors}
          >
            {isCreating ? (
              <>
                <span>Salvando...</span>
                <Loader2 className="ml-2 animate-spin" />
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
