import { EquipmentContextProvider } from "./EquipmentContext";
import { LayoutContextProvider } from "./LayoutContext";
import { MaterialContextProvider } from "./MaterialContext";
import { ServiceContextProvider } from "./ServiceContext";
import { UsersContextProvider } from "./UsersContext";

export function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LayoutContextProvider>
        <ServiceContextProvider>
          <EquipmentContextProvider>
            <MaterialContextProvider>
              <UsersContextProvider>{children}</UsersContextProvider>
            </MaterialContextProvider>
          </EquipmentContextProvider>
        </ServiceContextProvider>
      </LayoutContextProvider>
    </>
  );
}
