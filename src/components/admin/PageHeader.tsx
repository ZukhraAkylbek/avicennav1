export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-admin-teal text-[12px] font-bold tracking-[0.14em] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 text-[26px] leading-tight font-extrabold sm:text-[32px]">{title}</h1>
        {description && (
          <p className="text-admin-muted mt-2 max-w-2xl text-[14px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border-admin-line bg-card rounded-2xl border p-5 sm:p-6 ${className ?? ""}`}
    >
      {title && (
        <header className="mb-4">
          <h2 className="text-[17px] font-bold">{title}</h2>
          {description && <p className="text-admin-muted mt-1 text-[13px]">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
