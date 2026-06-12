import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@/core/providers/ThemeProvider";
import { LoadingProvider } from "@/core/providers/LoadingProvider";

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LoadingProvider>{children}</LoadingProvider>
    </ThemeProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
