"use client";
import { Accordion } from "@/components/global/ui/accordion";
import { useLayoutContext } from "@/context/LayoutContext";
import { AreaAccordion } from "./Area/AreaAccordion";
import { CipAccordion } from "./Cip/CipAccordion";
import { EquipmentAccordion } from "./Equipment/EquipmentAccordion";
import { SectorAccordion } from "./Sector/SectorAccordion";
import { SetAccordion } from "./Set/SetAccordion";
import { SubSetAccordion } from "./SubSet/SubSetAccordion";

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
