import { useState } from "react";
import { useTranslation } from "react-i18next";

// Small dismissible contextual-help banner for the top of a page, e.g.
// <PageInfo i18nKey="page-info.managesign" />. Dismissal is remembered
// per-key in localStorage so it doesn't nag on every visit, but survives
// across a refresh (unlike component state).
const PageInfo = ({ i18nKey, className = "" }) => {
  const { t } = useTranslation();
  const storageKey = `pageinfo-dismissed-${i18nKey}`;
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(storageKey) === "1"
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "1");
    setDismissed(true);
  };

  return (
    <div
      className={`flex items-start gap-2.5 rounded-box border border-primary/20 bg-primary/5 px-4 py-3 mb-3 text-sm text-base-content ${className}`}
    >
      <i className="fa-solid fa-circle-info text-primary mt-0.5 shrink-0"></i>
      <p className="flex-1">{t(i18nKey)}</p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t("close")}
        className="text-base-content/40 hover:text-base-content transition-colors shrink-0"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

export default PageInfo;
