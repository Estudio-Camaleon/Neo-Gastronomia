interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = ["Cuenta", "Negocio"];

  return (
    <div className="flex items-center justify-center gap-3 mb-8 select-none font-mono">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 border-2 border-black flex items-center justify-center text-xs font-black transition-all duration-200 shadow-[2px_2px_0px_0px_#000000]
                  ${
                    isActive
                      ? "bg-[#A3FF00] text-black scale-105"
                      : isCompleted
                        ? "bg-black text-white"
                        : "bg-white text-gray-400"
                  }
                `}
              >
                {isCompleted ? "✓" : `0${stepNumber}`}
              </div>

              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  isActive
                    ? "text-black underline decoration-2 decoration-[#A3FF00]"
                    : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="mx-3 w-8 h-1 bg-black border border-black shadow-[1px_1px_0px_0px_#000000]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
