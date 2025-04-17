"use client";

import { EquipmentsProps, SectorProps } from "@/@types/LayoutTypes";
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

interface EquipmentTemplateSheetProps {
  open: boolean;
  onClose: () => void;
}

interface TemplateInstanceProps {
  id: string;
  name: string;
  data: {
    tag: string;
    maker: string;
    name: string;
    model: string;
    type: string;
    year: string;
    description: string;
  };
}

export function EquipmentTemplateSheet({
  open,
  onClose,
}: EquipmentTemplateSheetProps) {
  const { layoutData, setLayoutData } = useLayoutContext();
  const [selectedTemplates, setSelectedTemplates] = useState<
    TemplateInstanceProps[]
  >([]);
  const [isCreating, setIsCreating] = useState(false);

  // Predefined equipment templates
  const AVAILABLE_MODELS: Array<TemplateInstanceProps> = [
    {
      id: v4(),
      name: "Equipamento Modelo 1",
      data: {
        tag: "Tag 1",
        maker: "Fabricante 1",
        name: "Equipamento 1",
        model: "Modelo 1",
        type: "Tipo 1",
        year: "2025",
        description: "Descrição 1",
      },
    },
    {
      id: v4(),
      name: "Equipamento Modelo 2",
      data: {
        tag: "Tag 2",
        maker: "Fabricante 2",
        name: "Equipamento 2",
        model: "Modelo 2",
        type: "Tipo 2",
        year: "2024",
        description: "Descrição 2",
      },
    },
    {
      id: v4(),
      name: "Equipamento Modelo 3",
      data: {
        tag: "Tag 3",
        maker: "Fabricante 3",
        name: "Equipamento 3",
        model: "Modelo 3",
        type: "Tipo 3",
        year: "2023",
        description: "Descrição 3",
      },
    },
    {
      id: v4(),
      name: "Equipamento Modelo 4",
      data: {
        tag: "Tag 4",
        maker: "Fabricante 4",
        name: "Equipamento 4",
        model: "Modelo 4",
        type: "Tipo 1",
        year: "2022",
        description: "Descrição 4",
      },
    },
  ];

  const handleAddTemplate = (template: TemplateInstanceProps) => {
    // Clone with a fresh ID
    setSelectedTemplates((prev) => [...prev, { ...template, id: v4() }]);
  };

  const handleRemoveTemplate = (id: string) => {
    setSelectedTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateEquipments = () => {
    if (!layoutData.areas || selectedTemplates.length === 0) {
      toast.error("Selecione pelo menos um modelo de equipamento");
      return;
    }

    // Get the currently selected sector from the EquipmentAccordion
    const selectedSectorElement = document.querySelector(
      '.bg-primary input[disabled][placeholder="Nome da Área"]',
    );
    if (!selectedSectorElement) {
      toast.error("Selecione um setor primeiro");
      return;
    }

    const sectorName = (selectedSectorElement as HTMLInputElement).value;
    const sectorPosition =
      document.querySelector(".bg-primary span")?.textContent?.trim() || "";

    // Find the sector in layoutData
    let selectedSector: SectorProps | null = null;
    for (const area of layoutData.areas) {
      if (!area.sectors) continue;

      const sector = area.sectors.find(
        (s) => s.name === sectorName && s.position === sectorPosition,
      );
      if (sector) {
        selectedSector = sector;
        break;
      }
    }

    if (!selectedSector) {
      toast.error("Setor não encontrado");
      return;
    }

    setIsCreating(true);

    setLayoutData((prev) => {
      const updatedAreas = prev.areas!.map((area) => {
        if (!area.sectors) return area;

        const updatedSectors = area.sectors.map((sector) => {
          if (sector.id !== selectedSector!.id) return sector;

          // Clone existing equipments or create empty array
          const existing = sector.equipments || [];

          // Determine starting index for new equipments
          const indices = existing
            .map((eq) => parseInt(eq.position.split(".")[2], 10))
            .filter((n) => !isNaN(n));
          const maxIndex = indices.length ? Math.max(...indices) : 0;

          // Build new EquipmentsProps
          const newEquipments: EquipmentsProps[] = selectedTemplates.map(
            (t, i) => ({
              id: v4(),
              position: `${sector.position}.${maxIndex + i + 1}`,
              photos: null,
              sets: null,
              ...t.data,
            }),
          );

          return {
            ...sector,
            equipments: [...existing, ...newEquipments],
          };
        });

        return {
          ...area,
          sectors: updatedSectors,
        };
      });

      return { ...prev, areas: updatedAreas };
    });

    toast.success("Equipamentos adicionados com sucesso");
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
        <SheetTitle>Selecione um Modelo de Equipamento</SheetTitle>
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
            onClick={handleCreateEquipments}
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
