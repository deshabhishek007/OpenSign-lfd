// Consistent page-title header — icon (optional) + title + subtitle, with an
// optional right-aligned actions slot. Gives content pages a shared top
// rhythm instead of each rolling its own ad-hoc heading.
const PageHeader = ({ icon, title, subtitle, actions, className = "" }) => (
  <div className={`mb-4 flex items-start justify-between gap-4 ${className}`}>
    <div className="flex items-center gap-3">
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <i className={`fa-solid ${icon} text-primary`}></i>
        </span>
      )}
      <div>
        <h1 className="text-xl font-bold leading-tight text-base-content">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-base-content/60">{subtitle}</p>
        )}
      </div>
    </div>
    {actions && (
      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    )}
  </div>
);

export default PageHeader;
