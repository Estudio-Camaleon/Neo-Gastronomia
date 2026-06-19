import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { StepIndicator } from "./StepIndicator";

describe("StepIndicator", () => {
  it("renders all steps", () => {
    render(<StepIndicator currentStep={1} />);
    expect(screen.getByText("Titular")).toBeInTheDocument();
    expect(screen.getByText("Negocio")).toBeInTheDocument();
    expect(screen.getByText("Acceso")).toBeInTheDocument();
  });

  it("shows checkmark for completed steps", () => {
    render(<StepIndicator currentStep={2} />);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("shows step number for current step", () => {
    render(<StepIndicator currentStep={1} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
