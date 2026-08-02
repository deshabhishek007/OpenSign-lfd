import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Parse from "parse";
import axios from "axios";

const STORAGE_KEY = "onboarding-checklist-dismissed";

// Report IDs from ReportJson.js — reused rather than re-declared so this
// stays in sync with whatever those reports actually query.
const REPORT_SENT_ANY = "d9k3UfYHBc"; // "Recently sent for signatures"

async function checkHasSignature() {
  try {
    const userId = Parse.User.current()?.id;
    if (!userId) return false;
    const res = await Parse.Cloud.run("getdefaultsignature", { userId });
    const json = res?.toJSON ? res.toJSON() : res;
    return !!(json?.ImageURL || json?.SignatureName);
  } catch {
    return false;
  }
}

async function checkHasDocument() {
  try {
    const url = `${localStorage.getItem("baseUrl")}functions/getReport`;
    const res = await axios.post(
      url,
      { reportId: REPORT_SENT_ANY, skip: 0, limit: 1 },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          sessiontoken: localStorage.getItem("accesstoken")
        }
      }
    );
    return (res.data?.result?.length || 0) > 0;
  } catch {
    return false;
  }
}

async function checkTeamStatus() {
  try {
    const plan = await Parse.Cloud.run("getMyPlan");
    if (!plan?.multiUser) return { applicable: false, done: false };
    const extUser =
      localStorage.getItem("Extand_Class") &&
      JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
    const organizationId = extUser?.OrganizationId?.objectId;
    if (!organizationId) return { applicable: true, done: false };
    const users = await Parse.Cloud.run("getuserlistbyorg", {
      organizationId
    });
    return { applicable: true, done: (users?.length || 0) > 1 };
  } catch {
    return { applicable: false, done: false };
  }
}

const OnboardingChecklist = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "1"
  );
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState({
    signature: false,
    document: false,
    team: { applicable: false, done: false }
  });

  useEffect(() => {
    if (dismissed) return;
    let cancelled = false;
    (async () => {
      const [signature, document, team] = await Promise.all([
        checkHasSignature(),
        checkHasDocument(),
        checkTeamStatus()
      ]);
      if (cancelled) return;
      setSteps({ signature, document, team });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = [
    {
      key: "signature",
      done: steps.signature,
      label: t("onboarding.step-signature"),
      onClick: () => navigate("/managesign")
    },
    {
      key: "document",
      done: steps.document,
      label: t("onboarding.step-document"),
      onClick: () => navigate("/form/sHAnZphf69")
    },
    ...(steps.team.applicable
      ? [
          {
            key: "team",
            done: steps.team.done,
            label: t("onboarding.step-team"),
            onClick: () => navigate("/users")
          }
        ]
      : [])
  ];

  const allDone = items.every((item) => item.done);

  useEffect(() => {
    if (!loading && allDone && !dismissed) {
      localStorage.setItem(STORAGE_KEY, "1");
      setDismissed(true);
    }
  }, [loading, allDone, dismissed]);

  if (dismissed || loading) return null;

  const doneCount = items.filter((item) => item.done).length;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="rounded-box border border-base-300 bg-base-100 px-5 py-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-base-content">
            {t("onboarding.title")}
          </div>
          <div className="text-xs text-base-content/60 mt-0.5">
            {t("onboarding.progress", { done: doneCount, total: items.length })}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t("close")}
          className="text-base-content/40 hover:text-base-content transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className={`flex-1 flex items-center gap-2.5 rounded-box border px-3 py-2.5 text-left text-sm transition-colors ${
              item.done
                ? "border-success/30 bg-success/5 text-base-content/60"
                : "border-base-300 hover:border-primary/40 hover:bg-primary/5 text-base-content"
            }`}
          >
            <i
              className={`fa-solid ${
                item.done ? "fa-circle-check text-success" : "fa-circle text-base-content/25"
              }`}
            ></i>
            <span className={item.done ? "line-through" : ""}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OnboardingChecklist;
