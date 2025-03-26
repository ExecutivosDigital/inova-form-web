import { Header } from "@/components/global/Header";
import { LayoutHeader } from "./components/LayoutHeader";
import { LayoutAccordion } from "./components/LayoutAccordion";

export default function Layout() {
  return (
    <>
      <Header />
      <div className="mt-4 flex flex-col gap-4 p-2 md:p-4">
        <LayoutHeader />
        <LayoutAccordion />
      </div>
    </>
  );
}
