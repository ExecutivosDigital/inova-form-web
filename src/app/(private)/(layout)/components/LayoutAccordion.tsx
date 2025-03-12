"use client";
import { Accordion } from "@/components/global/ui/accordion";
import { AreaAccordion } from "./AreaAccordion";
import { SectorAccordion } from "./SectorAccordion";
import { EquipmentAccordion } from "./EquipmentAccordion";
import { SetAccordion } from "./SetAccordion";
import { SubSetAccordion } from "./SubSetAccordion";
import { useLayoutContext } from "@/context/LayoutContext";
import { CipAccordion } from "./CipAccordion";

export function LayoutAccordion() {
  const { selectedLayoutStep, setSelectedLayoutStep } = useLayoutContext();
  return (
    <Accordion
      type="single"
      defaultValue="1"
      className="w-full space-y-3.5"
      value={String(selectedLayoutStep)}
      onValueChange={(value) => setSelectedLayoutStep(Number(value))}
    >
      <AreaAccordion
        selectedLayoutStep={selectedLayoutStep}
        setSelectedLayoutStep={setSelectedLayoutStep}
      />
      <SectorAccordion
        selectedLayoutStep={selectedLayoutStep}
        setSelectedLayoutStep={setSelectedLayoutStep}
      />
      <EquipmentAccordion
        selectedLayoutStep={selectedLayoutStep}
        setSelectedLayoutStep={setSelectedLayoutStep}
      />
      <SetAccordion
        selectedLayoutStep={selectedLayoutStep}
        setSelectedLayoutStep={setSelectedLayoutStep}
      />
      <SubSetAccordion
        selectedLayoutStep={selectedLayoutStep}
        setSelectedLayoutStep={setSelectedLayoutStep}
      />
      <CipAccordion
        selectedLayoutStep={selectedLayoutStep}
        setSelectedLayoutStep={setSelectedLayoutStep}
      />
    </Accordion>
  );
}
