import { Header } from "@/components/global/Header";
import { UsersHeader } from "./components/UsersHeader";
import { UsersAccordion } from "./components/UsersAccordion";

export default function Users() {
  return (
    <>
      <Header />
      <div className="mt-4 flex flex-col gap-4 p-4">
        <UsersHeader />
        <UsersAccordion />
      </div>
    </>
  );
}
