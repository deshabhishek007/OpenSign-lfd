// Reusable "nothing here yet" state for tables/lists — icon + heading +
// optional description + optional primary action. Replaces the old
// generic "No data available" + clipboard-icon markup that was
// copy-pasted across Documents/Templates/Contactbook/Drive.
const EmptyState = ({
  icon = "fa-inbox",
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center py-10 px-6 ${className}`}
  >
    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
      <i className={`fa-solid ${icon} text-xl text-primary`}></i>
    </div>
    <div className="text-sm font-semibold text-base-content">{title}</div>
    {description && (
      <p className="text-xs text-base-content/60 mt-1 max-w-xs">
        {description}
      </p>
    )}
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="op-btn op-btn-primary op-btn-sm mt-4"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
