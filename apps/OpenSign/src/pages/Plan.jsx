import { useEffect, useState } from "react";
import Parse from "parse";
import { useTranslation } from "react-i18next";
import Loader from "../primitives/Loader";

// Plan & Billing — not part of upstream OpenSign. Single page serving two
// roles:
//  - every tenant admin: see their current plan/usage and request an
//    upgrade to Pro or Org (no self-serve billing yet — see PlanUtils.js
//    and planUpgrade.js on the server; this is the manual-approval interim)
//  - the SaaS platform admin (SAAS_ADMIN_EMAILS allowlist): review and
//    approve/reject pending upgrade requests from every tenant, inline
//    below their own plan card.
const PLAN_OPTIONS = [
  { id: "pro", name: "Pro", docLimit: 300, blurb: "300 documents, single user" },
  { id: "org", name: "Org", docLimit: 1000, blurb: "1000 documents, multiple users" }
];

function Plan() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [note, setNote] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [adminRequests, setAdminRequests] = useState(null);
  const [adminBusyId, setAdminBusyId] = useState(null);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const loadPlan = async () => {
    try {
      const res = await Parse.Cloud.run("getMyPlan");
      setPlan(res);
      if (res.isSaasAdmin) {
        loadAdminRequests();
      }
    } catch (err) {
      console.error("getMyPlan error", err);
      showMsg("danger", t("something-went-wrong-mssg"));
    } finally {
      setLoading(false);
    }
  };

  const loadAdminRequests = async () => {
    try {
      const list = await Parse.Cloud.run("listUpgradeRequests", { status: "pending" });
      setAdminRequests(list);
    } catch (err) {
      console.error("listUpgradeRequests error", err);
    }
  };

  useEffect(() => {
    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestUpgrade = async (planId) => {
    setRequesting(true);
    try {
      await Parse.Cloud.run("requestPlanUpgrade", { planId, note });
      showMsg("success", t("plan-request-sent"));
      setNote("");
      await loadPlan();
    } catch (err) {
      console.error("requestPlanUpgrade error", err);
      showMsg("danger", err?.message || t("something-went-wrong-mssg"));
    } finally {
      setRequesting(false);
    }
  };

  const resolveRequest = async (requestId, approve) => {
    setAdminBusyId(requestId);
    try {
      await Parse.Cloud.run(approve ? "approveUpgradeRequest" : "rejectUpgradeRequest", {
        requestId
      });
      await loadAdminRequests();
      await loadPlan();
    } catch (err) {
      console.error("resolveRequest error", err);
      showMsg("danger", err?.message || t("something-went-wrong-mssg"));
    } finally {
      setAdminBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader />
      </div>
    );
  }
  if (!plan) return null;

  const remaining = plan.docLimit === null ? null : Math.max(plan.docLimit - plan.docsUsed, 0);
  const usagePct =
    plan.docLimit === null ? 0 : Math.min(100, Math.round((plan.docsUsed / plan.docLimit) * 100));

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full bg-base-100 text-base-content shadow rounded-box p-2">
        <div className="text-xl font-bold border-b-[1px] border-gray-300 pb-2 mb-2">
          {t("plan-title")}
        </div>

        <div className="m-2 flex flex-col gap-3">
          <div>
            <div className="text-2xl font-bold">{plan.planName}</div>
            <div className="text-xs text-base-content/70">
              {plan.docLimit === null
                ? t("plan-unlimited")
                : t("plan-usage", { used: plan.docsUsed, limit: plan.docLimit, remaining })}
            </div>
          </div>

          {plan.docLimit !== null && (
            <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden max-w-md">
              <div
                className={`h-full ${usagePct >= 100 ? "bg-error" : usagePct >= 80 ? "bg-warning" : "bg-primary"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          )}

          {msg.text && (
            <div
              className={`text-xs px-3 py-2 rounded-box ${
                msg.type === "danger" ? "bg-error/10 text-error" : "bg-success/10 text-success"
              }`}
            >
              {msg.text}
            </div>
          )}

          {plan.pendingRequest ? (
            <div className="text-xs px-3 py-2 rounded-box bg-warning/10 text-warning-content max-w-md">
              {t("plan-request-pending", { plan: PLAN_OPTIONS.find(p => p.id === plan.pendingRequest.requestedPlanId)?.name || plan.pendingRequest.requestedPlanId })}
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-w-md">
              <label className="text-xs" htmlFor="upgrade-note">
                {t("plan-note-label")}
              </label>
              <input
                id="upgrade-note"
                type="text"
                className="op-input op-input-bordered op-input-sm text-xs w-full"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={t("plan-note-placeholder")}
              />
              <div className="flex gap-2 flex-wrap mt-1">
                {PLAN_OPTIONS.filter(p => p.id !== plan.planId).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={requesting}
                    onClick={() => requestUpgrade(p.id)}
                    className="op-btn op-btn-primary op-btn-sm"
                  >
                    {t("plan-request-btn", { plan: p.name })}
                    <span className="opacity-70 ml-1">({p.blurb})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {plan.isSaasAdmin && (
        <div className="w-full bg-base-100 text-base-content shadow rounded-box p-2">
          <div className="text-xl font-bold border-b-[1px] border-gray-300 pb-2 mb-2">
            {t("plan-admin-title")}
          </div>
          <div className="m-2">
            {!adminRequests || adminRequests.length === 0 ? (
              <div className="text-xs text-base-content/60">{t("plan-admin-empty")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="op-table w-full text-xs">
                  <thead>
                    <tr>
                      <th>{t("plan-admin-col-tenant")}</th>
                      <th>{t("plan-admin-col-current")}</th>
                      <th>{t("plan-admin-col-requested")}</th>
                      <th>{t("plan-admin-col-note")}</th>
                      <th>{t("plan-admin-col-actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminRequests.map(r => (
                      <tr key={r.objectId}>
                        <td>{r.tenantName}</td>
                        <td>{r.tenantCurrentPlan}</td>
                        <td className="font-bold">
                          {PLAN_OPTIONS.find(p => p.id === r.requestedPlanId)?.name || r.requestedPlanId}
                        </td>
                        <td>{r.note || "—"}</td>
                        <td className="flex gap-2">
                          <button
                            type="button"
                            disabled={adminBusyId === r.objectId}
                            onClick={() => resolveRequest(r.objectId, true)}
                            className="op-btn op-btn-success op-btn-xs"
                          >
                            {t("plan-admin-approve")}
                          </button>
                          <button
                            type="button"
                            disabled={adminBusyId === r.objectId}
                            onClick={() => resolveRequest(r.objectId, false)}
                            className="op-btn op-btn-ghost op-btn-xs"
                          >
                            {t("plan-admin-reject")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Plan;
