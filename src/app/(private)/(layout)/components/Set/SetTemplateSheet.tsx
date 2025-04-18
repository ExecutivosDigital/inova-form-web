"use client";

import { EquipmentsProps, SetProps } from "@/@types/LayoutTypes";
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

interface SetTemplateSheetProps {
  open: boolean;
  onClose: () => void;
  selectedEquipment: EquipmentsProps | null;
}

interface TemplateInstanceProps {
  id: string;
  name: string;
  data: {
    name: string;
    code: string;
  };
}

export function SetTemplateSheet({
  open,
  onClose,
  selectedEquipment,
}: SetTemplateSheetProps) {
  const { layoutData, setLayoutData } = useLayoutContext();
  const [selectedTemplates, setSelectedTemplates] = useState<
    TemplateInstanceProps[]
  >([]);
  const [isCreating, setIsCreating] = useState(false);

  // Predefined set templates
  const AVAILABLE_MODELS: Array<TemplateInstanceProps> = [
    {
      id: v4(),
      name: "Conjunto Modelo 1",
      data: {
        name: "Conjunto 1",
        code: "CNJ-001",
      },
    },
    {
      id: v4(),
      name: "Conjunto Modelo 2",
      data: {
        name: "Conjunto 2",
        code: "CNJ-002",
      },
    },
    {
      id: v4(),
      name: "Conjunto Modelo 3",
      data: {
        name: "Conjunto 3",
        code: "CNJ-003",
      },
    },
    {
      id: v4(),
      name: "Conjunto Modelo 4",
      data: {
        name: "Conjunto 4",
        code: "CNJ-004",
      },
    },
  ];

  const handleAddTemplate = (template: TemplateInstanceProps) => {
    setSelectedTemplates((prev) => [...prev, { ...template, id: v4() }]);
  };

  const handleRemoveTemplate = (id: string) => {
    setSelectedTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateSets = () => {
    if (!layoutData.areas || selectedTemplates.length === 0) {
      toast.error("Selecione pelo menos um modelo de conjunto");
      return;
    }

    if (!selectedEquipment) {
      toast.error("Selecione um equipamento primeiro");
      return;
    }

    setIsCreating(true);

    setLayoutData((prev) => {
      const updatedAreas = prev.areas!.map((area) => {
        if (!area.sectors) return area;

        const updatedSectors = area.sectors.map((sector) => {
          if (!sector.equipments) return sector;

          const updatedEquipments = sector.equipments.map((equipment) => {
            if (equipment.id !== selectedEquipment.id) return equipment;

            // Clone existing sets or create empty array
            const existing = equipment.sets || [];

            // Determine starting index for new sets
            const indices = existing
              .map((set) => parseInt(set.position.split(".")[3], 10))
              .filter((n) => !isNaN(n));
            const maxIndex = indices.length ? Math.max(...indices) : 0;

            // Build new SetProps
            const newSets: SetProps[] = selectedTemplates.map((t, i) => ({
              id: v4(),
              position: `${equipment.position}.${maxIndex + i + 1}`,
              subSets: null,
              ...t.data,
            }));

            return {
              ...equipment,
              sets: [...existing, ...newSets],
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

    toast.success("Conjuntos adicionados com sucesso");
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
        <SheetTitle>Selecione um Modelo de Conjunto</SheetTitle>
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
            onClick={handleCreateSets}
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
