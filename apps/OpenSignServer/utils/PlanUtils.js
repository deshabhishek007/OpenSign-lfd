// Lifetime document-signing balance enforcement for the peenak SaaS deployment.
// Not part of upstream OpenSign.
//
// Plan fields live directly on partners_Tenant: PlanId, PlanName, DocLimit,
// DocsUsed, PlanStatus. DocLimit is a LIFETIME cap, not monthly — it never
// resets. DocLimit === null/undefined means unlimited (legacy tenants that
// predate plans, or a tenant deliberately given no cap).
//
// DocLimit is expected to grow over time via plan upgrades and paid add-on
// document packs (both just raise DocLimit) — this module only ever compares
// DocsUsed against whatever DocLimit currently is, it doesn't care why it
// changed.
//
// This is separate from the existing lifetime per-user contracts_Users
// .DocumentCount stat (see CountUtils.js, incremented on sign-completion) —
// that one is a display stat, this one is the enforced, per-tenant balance.

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

// Throws a Parse.Error (blocking the save) if this tenant has already used
// up its lifetime document balance. No-ops for unlimited/unknown tenants
// rather than blocking — a missing tenant should never lock a user out,
// that's a data problem to fix separately, not a quota problem.
//
// Known v1 limitation: this check-then-increment (here, then in
// recordDocUsage) isn't wrapped in a transaction, so concurrent creates
// right at the limit boundary could let a tenant go over by a small amount.
// Not worth a transaction at peenak's current traffic; revisit if that
// changes.
export async function enforceDocLimit(extUserId) {
  const tenant = await getTenantForExtUser(extUserId);
  if (!tenant) return;

  const docLimit = tenant.get('DocLimit');
  if (docLimit === null || docLimit === undefined) return; // unlimited

  const used = tenant.get('DocsUsed') || 0;
  if (used >= docLimit) {
    throw new Parse.Error(
      Parse.Error.VALIDATION_ERROR,
      `quotareached: document limit reached (${docLimit} on the ${tenant.get('PlanName') || tenant.get('PlanId')} plan). Upgrade or buy an add-on pack to continue.`
    );
  }
}

// Call after a document is successfully created to debit it from the
// tenant's lifetime balance. Safe to call even if enforceDocLimit was never
// called (e.g. unlimited tenant) — it just increments DocsUsed.
export async function recordDocUsage(extUserId) {
  const tenant = await getTenantForExtUser(extUserId);
  if (!tenant) return;

  tenant.increment('DocsUsed', 1);
  await tenant.save(null, { useMasterKey: true });
}
