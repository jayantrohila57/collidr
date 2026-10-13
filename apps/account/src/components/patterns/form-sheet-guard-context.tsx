"use client";

import { createContext, type ReactNode, useContext } from "react";

const FormSheetGuardContext = createContext<(() => void) | null>(null);

export function FormSheetGuardProvider({
  allowNextCloseWithoutPrompt,
  children,
}: {
  allowNextCloseWithoutPrompt: () => void;
  children: ReactNode;
}) {
  return (
    <FormSheetGuardContext.Provider value={allowNextCloseWithoutPrompt}>
      {children}
    </FormSheetGuardContext.Provider>
  );
}

export function useFormSheetCloseWithoutPrompt(): () => void {
  const allow = useContext(FormSheetGuardContext);
  return allow ?? (() => {});
}
