"use client";
import { Accordion } from "@/components/global/ui/accordion";
import { BasicDataAccordion } from "./BasicDataAccordion";
import { TechInfoAccordion } from "./TechInfoAccordion";
import { StockAccordion } from "./StockAccordion";
import { SupplierAccordion } from "./SupplierAccordion";
import { useMaterialContext } from "@/context/MaterialContext";

export function MaterialAccordion() {
  const { selectedMaterialStep, setSelectedMaterialStep } =
    useMaterialContext();
  return (
    <Accordion
      type="single"
      defaultValue="1"
      className="w-full space-y-3.5"
      value={String(selectedMaterialStep)}
      onValueChange={(value) => setSelectedMaterialStep(Number(value))}
    >
      <BasicDataAccordion
        selectedMaterialStep={selectedMaterialStep}
        setSelectedMaterialStep={setSelectedMaterialStep}
      />
      <TechInfoAccordion
        selectedMaterialStep={selectedMaterialStep}
        setSelectedMaterialStep={setSelectedMaterialStep}
      />
      <StockAccordion
        selectedMaterialStep={selectedMaterialStep}
        setSelectedMaterialStep={setSelectedMaterialStep}
      />
      <SupplierAccordion
        selectedMaterialStep={selectedMaterialStep}
        setSelectedMaterialStep={setSelectedMaterialStep}
      />
    </Accordion>
  );
}
