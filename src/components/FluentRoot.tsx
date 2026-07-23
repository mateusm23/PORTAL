"use client";

import type { ReactNode } from "react";
import { FluentProvider, SSRProvider, webLightTheme } from "@fluentui/react-components";

export default function FluentRoot({ children }: { children: ReactNode }) {
  return (
    <SSRProvider>
      <FluentProvider theme={webLightTheme}>{children}</FluentProvider>
    </SSRProvider>
  );
}
