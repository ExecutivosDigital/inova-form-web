"use client";

import { createContext, useContext, useState } from "react";

interface UsersContextProps {
  selectedUsersStep: number;
  setSelectedUsersStep: React.Dispatch<React.SetStateAction<number>>;
}

const UsersContext = createContext<UsersContextProps | undefined>(undefined);

interface ProviderProps {
  children: React.ReactNode;
}

export const UsersContextProvider = ({ children }: ProviderProps) => {
  const [selectedUsersStep, setSelectedUsersStep] = useState(1);

  return (
    <UsersContext.Provider
      value={{
        selectedUsersStep,
        setSelectedUsersStep,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export function useUsersContext() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error(
      "useUsersContext deve ser usado dentro de um UsersContextProvider",
    );
  }
  return context;
}
