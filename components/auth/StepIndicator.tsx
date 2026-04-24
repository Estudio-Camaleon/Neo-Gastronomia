interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = ["Cuenta", "Negocio"];

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${
                isActive
                  ? "bg-[var(--theme-primary)] text-white"
                  : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
              }
            `}
            >
              {isCompleted ? "✓" : stepNumber}
            </div>
            <span
              className={`text-sm font-medium ${isActive ? "text-[var(--theme-text)]" : "text-gray-400"}`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-gray-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}
