// Monthly document-signing quota enforcement for the peenak SaaS deployment.
// Not part of upstream OpenSign.
//
// Tenant plan fields live on partners_Tenant: PlanId, PlanName, DocLimit,
// PlanStatus. DocLimit === null/undefined means unlimited (used for
// Enterprise tenants that haven't had a custom cap set yet).
//
// Usage is tracked per tenant per calendar month in partners_TenantUsage
// (TenantId pointer, YearMonth "YYYY-MM" string, DocsSent number), separate
// from the existing lifetime per-user contracts_Users.DocumentCount stat
// (see CountUtils.js) which this does not touch or replace.

function currentYearMonth() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Resolve the partners_Tenant record that an ExtUserPtr (contracts_Users
// objectId) belongs to. Mirrors the pointer-chase in getTenant.js.
export async function getTenantForExtUser(extUserId) {
  if (!extUserId) return null;
  const extQuery = new Parse.Query('contracts_Users');
  const extUser = await extQuery.get(extUserId, { useMasterKey: true });
  const tenantId = extUser?.get('TenantId')?.id;
  if (!tenantId) return null;

  const tenantQuery = new Parse.Query('partners_Tenant');
  return tenantQuery.get(tenantId, { useMasterKey: true });
}

// Known v1 limitation: query-then-create has a race window under concurrent
// first-document-of-the-month creates for the same tenant, which could in
// theory produce a duplicate usage row for that month (undercounting by one
// row's worth, not a security issue). Acceptable at current traffic; if it
// ever matters, add a unique index on (TenantId, YearMonth) and catch the
// duplicate-key error.
async function getOrCreateUsageRow(tenantId, yearMonth) {
  const query = new Parse.Query('partners_TenantUsage');
  query.equalTo('TenantId', { __type: 'Pointer', className: 'partners_Tenant', objectId: tenantId });
  query.equalTo('YearMonth', yearMonth);
  const existing = await query.first({ useMasterKey: true });
  if (existing) return existing;

  const UsageCls = Parse.Object.extend('partners_TenantUsage');
  const row = new UsageCls();
  row.set('TenantId', { __type: 'Pointer', className: 'partners_Tenant', objectId: tenantId });
  row.set('YearMonth', yearMonth);
  // DocsSent intentionally left unset here: getMonthlyDocUsage() treats a
  // missing value as 0 via `|| 0`, and recordDocUsage()'s increment() on an
  // unsaved new object resolves to 0+delta server-side — setting it to 0
  // here too would fight with that increment op in the same save.
  return row;
}

export async function getMonthlyDocUsage(tenantId, yearMonth = currentYearMonth()) {
  const row = await getOrCreateUsageRow(tenantId, yearMonth);
  return row.get('DocsSent') || 0;
}

// Throws a Parse.Error (blocking the save) if this tenant is already at or
// over its plan's monthly document limit. No-ops for unlimited/unknown
// tenants rather than blocking — a missing tenant should never lock a user
// out, that's a data problem to fix separately, not a quota problem.
export async function enforceDocLimit(extUserId) {
  const tenant = await getTenantForExtUser(extUserId);
  if (!tenant) return;

  const docLimit = tenant.get('DocLimit');
  if (docLimit === null || docLimit === undefined) return; // unlimited

  const used = await getMonthlyDocUsage(tenant.id);
  if (used >= docLimit) {
    throw new Parse.Error(
      Parse.Error.VALIDATION_ERROR,
      `quotareached: monthly document limit reached (${docLimit} on the ${tenant.get('PlanName') || tenant.get('PlanId')} plan). Upgrade to continue.`
    );
  }
}

// Call after a document is successfully created to record it against the
// tenant's monthly usage. Safe to call even if enforceDocLimit was never
// called (e.g. unlimited tenant) — it just increments.
export async function recordDocUsage(extUserId) {
  const tenant = await getTenantForExtUser(extUserId);
  if (!tenant) return;

  const yearMonth = currentYearMonth();
  const row = await getOrCreateUsageRow(tenant.id, yearMonth);
  row.increment('DocsSent', 1);
  await row.save(null, { useMasterKey: true });
}
