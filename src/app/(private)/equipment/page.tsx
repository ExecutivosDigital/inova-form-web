import { EquipmentAccordion } from "./components/EquipmentAccordion";
import { EquipmentHeader } from "./components/EquipmentHeader";

export default function Equipment() {
  return (
    <div className="mt-4 flex flex-col gap-4 p-2 md:p-4">
      <EquipmentHeader />
      <EquipmentAccordion />
    </div>
  );
}
