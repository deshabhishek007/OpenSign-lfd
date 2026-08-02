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

  const [tenants, setTenants] = useState(null);
  const [tenantSearch, setTenantSearch] = useState("");
  const [tenantEdits, setTenantEdits] = useState({}); // { [objectId]: draftDocLimit }
  const [tenantBusyId, setTenantBusyId] = useState(null);

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
        loadTenants();
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

  const loadTenants = async (search = "") => {
    try {
      const list = await Parse.Cloud.run("listTenants", { search });
      setTenants(list);
    } catch (err) {
      console.error("listTenants error", err);
    }
  };

  const handleTenantSearch = async (e) => {
    e.preventDefault();
    await loadTenants(tenantSearch);
  };

  const saveTenantDocLimit = async (tenantId) => {
    const draft = tenantEdits[tenantId];
    if (draft === undefined || draft === "") return;
    setTenantBusyId(tenantId);
    try {
      const docLimit = draft === "unlimited" ? null : Number(draft);
      await Parse.Cloud.run("updateTenantAdmin", { tenantId, docLimit });
      setTenantEdits(prev => {
        const next = { ...prev };
        delete next[tenantId];
        return next;
      });
      await loadTenants(tenantSearch);
    } catch (err) {
      console.error("updateTenantAdmin error", err);
      showMsg("danger", err?.message || t("something-went-wrong-mssg"));
    } finally {
      setTenantBusyId(null);
    }
  };

  const toggleTenantActive = async (tenantId, nextActive) => {
    setTenantBusyId(tenantId);
    try {
      await Parse.Cloud.run("updateTenantAdmin", { tenantId, isActive: nextActive });
      await loadTenants(tenantSearch);
    } catch (err) {
      console.error("updateTenantAdmin error", err);
      showMsg("danger", err?.message || t("something-went-wrong-mssg"));
    } finally {
      setTenantBusyId(null);
    }
  };

  const toggleTenantPlatformAdmin = async (tenantId, nextValue) => {
    setTenantBusyId(tenantId);
    try {
      await Parse.Cloud.run("updateTenantAdmin", { tenantId, isPlatformAdmin: nextValue });
      await loadTenants(tenantSearch);
    } catch (err) {
      console.error("updateTenantAdmin error", err);
      showMsg("danger", err?.message || t("something-went-wrong-mssg"));
    } finally {
      setTenantBusyId(null);
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
        <div className="text-xl font-bold border-b-[1px] border-base-300 pb-2 mb-2">
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

          {plan.docLimit === null ? (
            <div className="text-xs px-3 py-2 rounded-box bg-success/10 text-success max-w-md">
              {t("plan-already-unlimited")}
            </div>
          ) : plan.pendingRequest ? (
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
          <div className="text-xl font-bold border-b-[1px] border-base-300 pb-2 mb-2">
            {t("plan-admin-title")}
          </div>
          <div className="m-2">
            {!adminRequests || adminRequests.length === 0 ? (
              <div className="text-xs text-base-content/60">{t("plan-admin-empty")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="op-table w-full">
                  <thead>
                    <tr>
                      <th className="p-2">{t("plan-admin-col-tenant")}</th>
                      <th className="p-2">{t("plan-admin-col-current")}</th>
                      <th className="p-2">{t("plan-admin-col-requested")}</th>
                      <th className="p-2">{t("plan-admin-col-note")}</th>
                      <th className="p-2">{t("plan-admin-col-actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminRequests.map(r => (
                      <tr key={r.objectId}>
                        <td className="p-2">{r.tenantName}</td>
                        <td className="p-2">{r.tenantCurrentPlan}</td>
                        <td className="p-2 font-bold">
                          {PLAN_OPTIONS.find(p => p.id === r.requestedPlanId)?.name || r.requestedPlanId}
                        </td>
                        <td className="p-2">{r.note || "—"}</td>
                        <td className="p-2 flex gap-2">
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

      {plan.isSaasAdmin && (
        <div className="w-full bg-base-100 text-base-content shadow rounded-box p-2">
          <div className="text-xl font-bold border-b-[1px] border-base-300 pb-2 mb-2">
            {t("plan-admin-tenants-title")}
          </div>
          <div className="m-2 flex flex-col gap-3">
            <form onSubmit={handleTenantSearch} className="flex gap-2 max-w-md">
              <input
                type="text"
                className="op-input op-input-bordered op-input-sm text-xs w-full"
                placeholder={t("plan-admin-tenants-search")}
                value={tenantSearch}
                onChange={e => setTenantSearch(e.target.value)}
              />
              <button type="submit" className="op-btn op-btn-sm">
                {t("plan-admin-tenants-search-btn")}
              </button>
            </form>

            {!tenants || tenants.length === 0 ? (
              <div className="text-xs text-base-content/60">{t("plan-admin-tenants-empty")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="op-table w-full">
                  <thead>
                    <tr>
                      <th className="p-2">{t("plan-admin-col-tenant")}</th>
                      <th className="p-2">{t("plan-admin-tenants-col-email")}</th>
                      <th className="p-2">{t("plan-admin-col-current")}</th>
                      <th className="p-2">{t("plan-admin-tenants-col-usage")}</th>
                      <th className="p-2">{t("plan-admin-tenants-col-limit")}</th>
                      <th className="p-2">{t("plan-admin-tenants-col-status")}</th>
                      <th className="p-2">{t("plan-admin-col-actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(row => (
                      <tr key={row.objectId}>
                        <td className="p-2">
                          {row.tenantName}
                          {row.isPlatformAdmin && (
                            <span className="ml-1 op-badge op-badge-primary op-badge-xs align-middle">
                              {t("plan-admin-tenants-platform-admin-badge")}
                            </span>
                          )}
                        </td>
                        <td className="p-2">{row.email}</td>
                        <td className="p-2">{row.planName}</td>
                        <td className="p-2">{row.docsUsed}</td>
                        <td className="p-2">
                          <div className="flex gap-1 items-center">
                            <input
                              type="text"
                              className="op-input op-input-bordered op-input-xs w-20 text-xs"
                              placeholder={row.docLimit === null ? "unlimited" : String(row.docLimit)}
                              value={
                                tenantEdits[row.objectId] !== undefined
                                  ? tenantEdits[row.objectId]
                                  : ""
                              }
                              onChange={e =>
                                setTenantEdits(prev => ({ ...prev, [row.objectId]: e.target.value }))
                              }
                            />
                            <button
                              type="button"
                              disabled={
                                tenantBusyId === row.objectId ||
                                tenantEdits[row.objectId] === undefined ||
                                tenantEdits[row.objectId] === ""
                              }
                              onClick={() => saveTenantDocLimit(row.objectId)}
                              className="op-btn op-btn-primary op-btn-xs"
                            >
                              {t("plan-admin-tenants-save")}
                            </button>
                          </div>
                        </td>
                        <td className="p-2">
                          {row.isActive ? (
                            <span className="op-badge op-badge-success op-badge-sm">
                              {t("plan-admin-tenants-active")}
                            </span>
                          ) : (
                            <span className="op-badge op-badge-error op-badge-sm">
                              {t("plan-admin-tenants-suspended")}
                            </span>
                          )}
                        </td>
                        <td className="p-2 flex gap-1 flex-wrap">
                          <button
                            type="button"
                            disabled={tenantBusyId === row.objectId}
                            onClick={() => toggleTenantActive(row.objectId, !row.isActive)}
                            className={`op-btn op-btn-xs ${row.isActive ? "op-btn-error" : "op-btn-success"}`}
                          >
                            {row.isActive
                              ? t("plan-admin-tenants-suspend-btn")
                              : t("plan-admin-tenants-activate-btn")}
                          </button>
                          <button
                            type="button"
                            disabled={tenantBusyId === row.objectId}
                            onClick={() => toggleTenantPlatformAdmin(row.objectId, !row.isPlatformAdmin)}
                            className="op-btn op-btn-ghost op-btn-xs"
                          >
                            {row.isPlatformAdmin
                              ? t("plan-admin-tenants-revoke-admin-btn")
                              : t("plan-admin-tenants-make-admin-btn")}
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
