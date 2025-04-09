"use client";
import { Accordion } from "@/components/global/ui/accordion";
import { useEquipmentContext } from "@/context/EquipmentContext";
import { EquipmentIdentificationAccordion } from "./EquipmentIdentificationAccordion";
import { EquipmentInfoAccordion } from "./EquipmentInfoAccordion";
import { EquipmentLocationAccordion } from "./EquipmentLocationAccordion";
import { EquipmentProductInfoAccordion } from "./EquipmentProductInfoAccordion";
import { EquipmentServiceAccordion } from "./EquipmentServiceAccordion";
import { EquipmentServiceExtraInfoAccordion } from "./EquipmentServiceExtraInfoAccordion";

export function EquipmentAccordion() {
  const { selectedEquipmentStep, setSelectedEquipmentStep } =
    useEquipmentContext();
  return (
    <Accordion
      type="single"
      defaultValue="1"
      className="w-full space-y-3.5"
      value={String(selectedEquipmentStep)}
      onValueChange={(value) => setSelectedEquipmentStep(Number(value))}
    >
      <EquipmentIdentificationAccordion
        selectedEquipmentStep={selectedEquipmentStep}
        setSelectedEquipmentStep={setSelectedEquipmentStep}
      />

      <EquipmentInfoAccordion
        selectedEquipmentStep={selectedEquipmentStep}
        setSelectedEquipmentStep={setSelectedEquipmentStep}
      />

      <EquipmentProductInfoAccordion
        selectedEquipmentStep={selectedEquipmentStep}
        setSelectedEquipmentStep={setSelectedEquipmentStep}
      />

      <EquipmentLocationAccordion
        selectedEquipmentStep={selectedEquipmentStep}
        setSelectedEquipmentStep={setSelectedEquipmentStep}
      />

      <EquipmentServiceAccordion
        selectedEquipmentStep={selectedEquipmentStep}
        setSelectedEquipmentStep={setSelectedEquipmentStep}
      />

      <EquipmentServiceExtraInfoAccordion
        selectedEquipmentStep={selectedEquipmentStep}
        setSelectedEquipmentStep={setSelectedEquipmentStep}
      />
    </Accordion>
  );
}
