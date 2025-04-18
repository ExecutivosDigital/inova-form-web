"use client";

import { SetProps, SubSetProps } from "@/@types/LayoutTypes";
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

interface SubSetTemplateSheetProps {
  open: boolean;
  onClose: () => void;
  selectedSet: SetProps | null;
}

interface TemplateInstanceProps {
  id: string;
  name: string;
  data: {
    name: string;
    code: string;
  };
}

export function SubSetTemplateSheet({
  open,
  onClose,
  selectedSet,
}: SubSetTemplateSheetProps) {
  const { layoutData, setLayoutData } = useLayoutContext();
  const [selectedTemplates, setSelectedTemplates] = useState<
    TemplateInstanceProps[]
  >([]);
  const [isCreating, setIsCreating] = useState(false);

  // Predefined subset templates
  const AVAILABLE_MODELS: Array<TemplateInstanceProps> = [
    {
      id: v4(),
      name: "Subconjunto Modelo 1",
      data: {
        name: "Subconjunto 1",
        code: "SCNJ-001",
      },
    },
    {
      id: v4(),
      name: "Subconjunto Modelo 2",
      data: {
        name: "Subconjunto 2",
        code: "SCNJ-002",
      },
    },
    {
      id: v4(),
      name: "Subconjunto Modelo 3",
      data: {
        name: "Subconjunto 3",
        code: "SCNJ-003",
      },
    },
    {
      id: v4(),
      name: "Subconjunto Modelo 4",
      data: {
        name: "Subconjunto 4",
        code: "SCNJ-004",
      },
    },
  ];

  const handleAddTemplate = (template: TemplateInstanceProps) => {
    setSelectedTemplates((prev) => [...prev, { ...template, id: v4() }]);
  };

  const handleRemoveTemplate = (id: string) => {
    setSelectedTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateSubSets = () => {
    if (!layoutData.areas || selectedTemplates.length === 0) {
      toast.error("Selecione pelo menos um modelo de subconjunto");
      return;
    }

    if (!selectedSet) {
      toast.error("Selecione um conjunto primeiro");
      return;
    }

    setIsCreating(true);

    setLayoutData((prev) => {
      const updatedAreas = prev.areas!.map((area) => {
        if (!area.sectors) return area;

        const updatedSectors = area.sectors.map((sector) => {
          if (!sector.equipments) return sector;

          const updatedEquipments = sector.equipments.map((equipment) => {
            if (!equipment.sets) return equipment;

            const updatedSets = equipment.sets.map((set) => {
              if (set.id !== selectedSet.id) return set;

              // Clone existing subsets or create empty array
              const existing = set.subSets || [];

              // Determine starting index for new subsets
              const indices = existing
                .map((subset) => parseInt(subset.position.split(".")[4], 10))
                .filter((n) => !isNaN(n));
              const maxIndex = indices.length ? Math.max(...indices) : 0;

              // Build new SubSetProps
              const newSubSets: SubSetProps[] = selectedTemplates.map(
                (t, i) => ({
                  id: v4(),
                  position: `${set.position}.${maxIndex + i + 1}`,
                  cip: null,
                  ...t.data,
                }),
              );

              return {
                ...set,
                subSets: [...existing, ...newSubSets],
              };
            });

            return {
              ...equipment,
              sets: updatedSets,
            };
          });

          return {
            ...sector,
            equipments: updatedEquipments,
          };
        });

        return {
          ...area,
          sectors: updatedSectors,
        };
      });

      return { ...prev, areas: updatedAreas };
    });

    toast.success("Subconjuntos adicionados com sucesso");
    setIsCreating(false);
    setSelectedTemplates([]);
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
        <SheetTitle>Selecione um Modelo de Subconjunto</SheetTitle>
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
            disabled={isCreating || selectedTemplates.length === 0}
            className="text-white"
            onClick={handleCreateSubSets}
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
