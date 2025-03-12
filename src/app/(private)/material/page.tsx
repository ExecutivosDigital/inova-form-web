import { Header } from "@/components/global/Header";
import { MaterialHeader } from "./components/MaterialHeader";
import { MaterialAccordion } from "./components/MaterialAccordion";

export default function Material() {
  return (
    <>
      <Header />
      <div className="mt-4 flex flex-col gap-4 p-4">
        <MaterialHeader />
        <MaterialAccordion />
      </div>
    </>
  );
}
