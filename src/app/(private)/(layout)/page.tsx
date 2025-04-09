import { LayoutAccordion } from "./components/LayoutAccordion";
import { LayoutHeader } from "./components/LayoutHeader";

export default function Layout() {
  return (
    <div className="mt-4 flex flex-col gap-4 p-2 md:p-4">
      <LayoutHeader />
      <LayoutAccordion />
    </div>
  );
}
