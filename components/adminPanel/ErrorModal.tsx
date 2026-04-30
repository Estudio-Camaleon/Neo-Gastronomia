// components/adminPanel/ErrorModal.tsx
export function ErrorModal({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-main dark:bg-bg-darker/95 backdrop-blur-sm p-6">
      <div className="max-w-md w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-8 rounded-2xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-error-soft text-error rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-text-primary dark:text-text-inverse mb-2">
          {title}
        </h2>
        <p className="text-text-secondary mb-6">{message}</p>
        {action}
      </div>
    </div>
  );
}
