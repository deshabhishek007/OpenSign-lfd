import { planDefaults } from '../cloud/constant/plans.js';

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

// Throws a Parse.Error (blocking the save) if this tenant is suspended or
// has already used up its lifetime document balance. No-ops for
// unknown/missing tenants rather than blocking — a missing tenant should
// never lock a user out, that's a data problem to fix separately, not a
// quota or suspension problem.
//
// Known v1 limitation: this check-then-increment (here, then in
// recordDocUsage) isn't wrapped in a transaction, so concurrent creates
// right at the limit boundary could let a tenant go over by a small amount.
// Not worth a transaction at peenak's current traffic; revisit if that
// changes.
export async function enforceDocLimit(extUserId) {
  const tenant = await getTenantForExtUser(extUserId);
  if (!tenant) return;

  assertTenantActive(tenant);

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

// Throws if a tenant has been suspended by the SaaS admin (IsActive===false
// — an explicit false, not just falsy/unset, since existing tenants default
// to true and many predate this field entirely).
export function assertTenantActive(tenant) {
  if (tenant.get('IsActive') === false) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      'suspended: this account has been suspended. Contact support.'
    );
  }
}

// Resolve the partners_Tenant for a given Parse.User (by email, via
// contracts_Users). Used both by cloud-function callers (via
// getTenantForCaller below, which passes request.user) and by loginUser.js,
// which has a freshly-logged-in Parse.User but no `request.user` yet.
export async function getTenantForUser(user) {
  if (!user) return null;
  const email = user.get('email');
  const query = new Parse.Query('contracts_Users');
  query.equalTo('Email', email);
  query.include('TenantId');
  const extUser = await query.first({ useMasterKey: true });
  return extUser?.get('TenantId') || null;
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

// Resolve the partners_Tenant for the CALLER of a cloud function (from
// request.user), rather than from an ExtUserPtr id. Mirrors the lookup in
// getUserDetails.js (contracts_Users by Email, TenantId included).
export async function getTenantForCaller(request) {
  return getTenantForUser(request?.user);
}

// Platform-admin check for the peenak SaaS owner — a static allowlist of
// emails via SAAS_ADMIN_EMAILS (comma-separated), not a Parse role, since
// there's no cross-tenant role system yet. Checked server-side only; the
// env var is never sent to the client.
export function isSaasAdmin(request) {
  const email = request?.user?.get('email');
  if (!email) return false;
  const allowlist = (process.env.SAAS_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

export function requireSaasAdmin(request) {
  if (!isSaasAdmin(request)) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Admin access required.');
  }
}

// Throws if adding another team member would exceed the tenant's plan seat
// limit (Free and Pro are single-user; Org is multi-user — see plans.js).
// Counts existing contracts_Users rows for the tenant rather than storing a
// separate seat counter, since team members can also be removed and this
// stays correct without needing to keep a counter in sync.
export async function assertCanAddTeamMember(tenantId) {
  if (!tenantId) return;

  const tenantQuery = new Parse.Query('partners_Tenant');
  const tenant = await tenantQuery.get(tenantId, { useMasterKey: true });
  assertTenantActive(tenant);

  const plan = planDefaults(tenant.get('PlanId'));
  if (plan.multiUser) return;

  const countQuery = new Parse.Query('contracts_Users');
  countQuery.equalTo('TenantId', { __type: 'Pointer', className: 'partners_Tenant', objectId: tenantId });
  const seatCount = await countQuery.count({ useMasterKey: true });
  if (seatCount >= 1) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      `seatlimitreached: the ${plan.name} plan supports a single user. Upgrade to Org to add team members.`
    );
  }
}
