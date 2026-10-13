"use client";

import { DirectionProvider as BaseDirectionProvider } from "@base-ui/react/direction-provider";
import type * as React from "react";

function DirectionProvider({
  direction = "ltr",
  children,
}: React.ComponentProps<typeof BaseDirectionProvider>) {
  return (
    <BaseDirectionProvider direction={direction}>
      {children}
    </BaseDirectionProvider>
  );
}

export { DirectionProvider };
