// Plan upgrade request + manual admin approval flow for the peenak SaaS
// deployment. Not part of upstream OpenSign.
//
// There's no Stripe/billing integration yet (see PlanUtils.js) — this is the
// interim manual workflow: a tenant admin requests Pro or Org, the platform
// admin (SAAS_ADMIN_EMAILS allowlist, see PlanUtils.isSaasAdmin) reviews and
// approves/rejects from the same /plan page in the client.
import { PLAN_PRO, PLAN_ORG, planDefaults } from '../constant/plans.js';
import { getTenantForCaller, isSaasAdmin, requireSaasAdmin } from '../../utils/PlanUtils.js';
import { notifyAdminsOfUpgradeRequest, notifyTenantOfUpgradeDecision } from '../../utils/NotifyUtils.js';

const REQUESTABLE_PLANS = [PLAN_PRO, PLAN_ORG];

function serializeRequest(req) {
  const tenant = req.get('TenantId');
  return {
    objectId: req.id,
    requestedPlanId: req.get('RequestedPlanId'),
    status: req.get('Status'),
    note: req.get('Note') || '',
    createdAt: req.get('createdAt'),
    tenantId: tenant?.id,
    tenantName: tenant?.get?.('TenantName') || '',
    tenantCurrentPlan: tenant?.get?.('PlanName') || 'Free',
  };
}

export async function getMyPlan(request) {
  const tenant = await getTenantForCaller(request);
  if (!tenant) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'No tenant found for this account.');
  }

  const pendingQuery = new Parse.Query('partners_UpgradeRequest');
  pendingQuery.equalTo('TenantId', { __type: 'Pointer', className: 'partners_Tenant', objectId: tenant.id });
  pendingQuery.equalTo('Status', 'pending');
  const pending = await pendingQuery.first({ useMasterKey: true });

  const planId = tenant.get('PlanId') || 'free';

  return {
    planId,
    planName: tenant.get('PlanName') || 'Free',
    docLimit: tenant.get('DocLimit') ?? null, // null = unlimited
    docsUsed: tenant.get('DocsUsed') || 0,
    planStatus: tenant.get('PlanStatus') || 'active',
    // Whether this plan allows more than one team member — see
    // PlanUtils.assertCanAddTeamMember, which already enforces this
    // server-side. The client uses this to hide the Settings > Users menu
    // for single-user plans instead of showing a page that will just
    // reject the add.
    multiUser: planDefaults(planId).multiUser,
    pendingRequest: pending ? serializeRequest(pending) : null,
    isSaasAdmin: isSaasAdmin(request),
  };
}

export async function requestPlanUpgrade(request) {
  const planId = request.params.planId;
  const note = request.params.note || '';
  if (!REQUESTABLE_PLANS.includes(planId)) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, `planId must be one of: ${REQUESTABLE_PLANS.join(', ')}`);
  }

  const tenant = await getTenantForCaller(request);
  if (!tenant) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'No tenant found for this account.');
  }

  const existingQuery = new Parse.Query('partners_UpgradeRequest');
  existingQuery.equalTo('TenantId', { __type: 'Pointer', className: 'partners_Tenant', objectId: tenant.id });
  existingQuery.equalTo('Status', 'pending');
  existingQuery.include('TenantId');
  const existing = await existingQuery.first({ useMasterKey: true });
  if (existing) {
    return serializeRequest(existing); // idempotent — don't stack duplicate requests
  }

  const ReqCls = Parse.Object.extend('partners_UpgradeRequest');
  const upgradeRequest = new ReqCls();
  upgradeRequest.set('TenantId', { __type: 'Pointer', className: 'partners_Tenant', objectId: tenant.id });
  upgradeRequest.set('RequestedByUserId', { __type: 'Pointer', className: '_User', objectId: request.user.id });
  upgradeRequest.set('RequestedPlanId', planId);
  upgradeRequest.set('Status', 'pending');
  upgradeRequest.set('Note', note);
  const saved = await upgradeRequest.save(null, { useMasterKey: true });
  saved.set('TenantId', tenant); // for serializeRequest's tenant name/plan lookup below

  notifyAdminsOfUpgradeRequest({
    tenantName: tenant.get('TenantName') || '',
    requesterEmail: request.user.get('email'),
    requestedPlanName: planDefaults(planId).name,
    note,
  });

  return serializeRequest(saved);
}

export async function listUpgradeRequests(request) {
  requireSaasAdmin(request);

  const query = new Parse.Query('partners_UpgradeRequest');
  const status = request.params.status || 'pending';
  if (status !== 'all') {
    query.equalTo('Status', status);
  }
  query.include('TenantId');
  query.descending('createdAt');
  query.limit(200);
  const results = await query.find({ useMasterKey: true });
  return results.map(serializeRequest);
}

export async function approveUpgradeRequest(request) {
  requireSaasAdmin(request);
  const requestId = request.params.requestId;

  const query = new Parse.Query('partners_UpgradeRequest');
  query.include('TenantId');
  const upgradeRequest = await query.get(requestId, { useMasterKey: true });
  if (upgradeRequest.get('Status') !== 'pending') {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'This request has already been resolved.');
  }

  const tenant = upgradeRequest.get('TenantId');
  const planId = upgradeRequest.get('RequestedPlanId');
  const plan = planDefaults(planId);

  // v1: approval sets the tenant's plan to the requested tier's base
  // DocLimit outright. It does not additively preserve any paid add-on
  // credits bought on top of the previous plan — revisit once add-on packs
  // (task #5) exist, since at that point "upgrade" and "top-up" need to
  // compose instead of one overwriting the other.
  tenant.set('PlanId', planId);
  tenant.set('PlanName', plan.name);
  tenant.set('DocLimit', plan.docLimit);
  tenant.set('PlanStatus', 'active');
  await tenant.save(null, { useMasterKey: true });

  upgradeRequest.set('Status', 'approved');
  upgradeRequest.set('ResolvedByUserId', { __type: 'Pointer', className: '_User', objectId: request.user.id });
  await upgradeRequest.save(null, { useMasterKey: true });

  notifyTenantOfUpgradeDecision({
    requesterEmail: tenant.get('EmailAddress'),
    tenantName: tenant.get('TenantName') || '',
    requestedPlanName: plan.name,
    approved: true,
  });

  return serializeRequest(upgradeRequest);
}

export async function rejectUpgradeRequest(request) {
  requireSaasAdmin(request);
  const requestId = request.params.requestId;
  const reason = request.params.reason || '';

  const query = new Parse.Query('partners_UpgradeRequest');
  query.include('TenantId');
  const upgradeRequest = await query.get(requestId, { useMasterKey: true });
  if (upgradeRequest.get('Status') !== 'pending') {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'This request has already been resolved.');
  }

  upgradeRequest.set('Status', 'rejected');
  upgradeRequest.set('RejectReason', reason);
  upgradeRequest.set('ResolvedByUserId', { __type: 'Pointer', className: '_User', objectId: request.user.id });
  await upgradeRequest.save(null, { useMasterKey: true });

  const tenant = upgradeRequest.get('TenantId');
  notifyTenantOfUpgradeDecision({
    requesterEmail: tenant?.get('EmailAddress'),
    tenantName: tenant?.get('TenantName') || '',
    requestedPlanName: planDefaults(upgradeRequest.get('RequestedPlanId')).name,
    approved: false,
    reason,
  });

  return serializeRequest(upgradeRequest);
}
