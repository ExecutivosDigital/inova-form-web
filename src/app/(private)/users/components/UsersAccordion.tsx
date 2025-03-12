"use client";
import { Accordion } from "@/components/global/ui/accordion";
import { useUsersContext } from "@/context/UsersContext";
import { PersonalAccordion } from "./PersonalAccordion";
import { UnitLinkAccordion } from "./UnitLinkAccordion";
import { PermissionsAccordion } from "./PermissionsAccordion";

export function UsersAccordion() {
  const { selectedUsersStep, setSelectedUsersStep } = useUsersContext();
  return (
    <Accordion
      type="single"
      defaultValue="1"
      className="w-full space-y-3.5"
      value={String(selectedUsersStep)}
      onValueChange={(value) => setSelectedUsersStep(Number(value))}
    >
      <PersonalAccordion
        selectedUsersStep={selectedUsersStep}
        setSelectedUsersStep={setSelectedUsersStep}
      />
      <UnitLinkAccordion
        selectedUsersStep={selectedUsersStep}
        setSelectedUsersStep={setSelectedUsersStep}
      />
      <PermissionsAccordion
        selectedUsersStep={selectedUsersStep}
        setSelectedUsersStep={setSelectedUsersStep}
      />
    </Accordion>
  );
}
