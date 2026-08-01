// Platform-admin tenant management for the peenak SaaS deployment. Not part
// of upstream OpenSign. Admin-gated via PlanUtils.requireSaasAdmin
// (SAAS_ADMIN_EMAILS allowlist) — no self-serve billing (Stripe explicitly
// out of scope), so this is how the plan/limit/suspend levers actually get
// pulled: manually, by the platform admin, from the /plan page's admin
// section in the client.
import { requireSaasAdmin } from '../../utils/PlanUtils.js';

function serializeTenant(t) {
  return {
    objectId: t.id,
    tenantName: t.get('TenantName') || '',
    email: t.get('EmailAddress') || '',
    isActive: t.get('IsActive') !== false, // undefined/missing = active (legacy tenants)
    planId: t.get('PlanId') || 'free',
    planName: t.get('PlanName') || 'Free',
    docLimit: t.get('DocLimit') ?? null, // null = unlimited
    docsUsed: t.get('DocsUsed') || 0,
    createdAt: t.get('createdAt'),
  };
}

export async function listTenants(request) {
  requireSaasAdmin(request);

  const search = (request.params.search || '').trim();
  let query;
  if (search) {
    const byName = new Parse.Query('partners_Tenant');
    byName.matches('TenantName', search, 'i');
    const byEmail = new Parse.Query('partners_Tenant');
    byEmail.matches('EmailAddress', search, 'i');
    query = Parse.Query.or(byName, byEmail);
  } else {
    query = new Parse.Query('partners_Tenant');
  }
  query.descending('createdAt');
  query.limit(500);
  const tenants = await query.find({ useMasterKey: true });
  return tenants.map(serializeTenant);
}

// General-purpose admin override: suspend/reactivate, set a custom lifetime
// document limit (covers both "sell them a bigger Org deal" and "manually
// top up after they paid for an add-on pack outside the app" — there's no
// separate add-on-purchase flow, the admin just edits DocLimit directly),
// or reassign PlanId/PlanName for record-keeping. All fields optional —
// only what's passed gets changed.
export async function updateTenantAdmin(request) {
  requireSaasAdmin(request);

  const { tenantId, isActive, docLimit, planId, planName } = request.params;
  if (!tenantId) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'tenantId is required.');
  }

  const query = new Parse.Query('partners_Tenant');
  const tenant = await query.get(tenantId, { useMasterKey: true });

  if (isActive !== undefined) {
    tenant.set('IsActive', !!isActive);
  }
  if (docLimit !== undefined) {
    // explicit null is allowed through — it means "make this tenant unlimited"
    tenant.set('DocLimit', docLimit === null ? null : Number(docLimit));
  }
  if (planId !== undefined) {
    tenant.set('PlanId', planId);
  }
  if (planName !== undefined) {
    tenant.set('PlanName', planName);
  }
  await tenant.save(null, { useMasterKey: true });
  return serializeTenant(tenant);
}
