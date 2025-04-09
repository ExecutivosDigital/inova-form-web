import { UsersAccordion } from "./components/UsersAccordion";
import { UsersHeader } from "./components/UsersHeader";

export default function Users() {
  return (
    <div className="mt-4 flex flex-col gap-4 p-4">
      <UsersHeader />
      <UsersAccordion />
    </div>
  );
}
