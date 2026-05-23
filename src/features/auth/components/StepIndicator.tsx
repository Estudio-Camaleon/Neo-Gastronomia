interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = ["Cuenta", "Negocio"];

  return (
    <div className="flex items-center justify-center gap-3 mb-8 select-none">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
                  ${
                    isActive
                      ? "bg-[var(--admin-accent)] text-white shadow-sm ring-4 ring-[var(--admin-accent)]/20"
                      : isCompleted
                        ? "bg-[var(--admin-text)] text-white"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                  }
                `}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>

              <span
                className={`text-xs font-semibold ${
                  isActive
                    ? "text-[var(--admin-accent)]"
                    : isCompleted
                      ? "text-gray-900"
                      : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="mx-3 w-8 h-px bg-gray-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}
