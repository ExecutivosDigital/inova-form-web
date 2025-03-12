import { LayoutContextProvider } from "./LayoutContext";
import { MaterialContextProvider } from "./MaterialContext";
import { UsersContextProvider } from "./UsersContext";

export function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LayoutContextProvider>
        <MaterialContextProvider>
          <UsersContextProvider>{children}</UsersContextProvider>
        </MaterialContextProvider>
      </LayoutContextProvider>
    </>
  );
}
