interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = ["Cuenta", "Negocio"];

  return (
    <div className="flex items-center justify-center gap-2 mb-10 select-none">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={step} className="flex items-center">
            {/* Contenedor del Paso */}
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 border-2
                  ${
                    isActive
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110"
                      : isCompleted
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-bg-main border-border text-text-muted"
                  }
                `}
              >
                {isCompleted ? (
                  <span className="text-lg">✓</span>
                ) : (
                  <span>0{stepNumber}</span>
                )}
              </div>

              <span
                className={`text-xs font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isActive ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {step}
              </span>
            </div>

            {/* Línea Divisoria */}
            {index < steps.length - 1 && (
              <div className="mx-4 w-12 flex items-center">
                <div
                  className={`h-1 w-full rounded-full transition-all duration-700 ${
                    isCompleted ? "bg-primary" : "bg-border-dark"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
