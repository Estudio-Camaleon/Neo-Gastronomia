interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  actions?: React.ReactNode;
}

export const Card = ({ children, title, className = "", actions }: CardProps) => {
  return (
    <div className={`
      bg-[var(--admin-surface)] 
      border-2 border-black 
      shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
      p-6 
      ${className}
    `}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
          {title && <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};