import { MaterialAccordion } from "./components/MaterialAccordion";
import { MaterialHeader } from "./components/MaterialHeader";

export default function Material() {
  return (
    <div className="mt-4 flex flex-col gap-4 p-4">
      <MaterialHeader />
      <MaterialAccordion />
    </div>
  );
}
