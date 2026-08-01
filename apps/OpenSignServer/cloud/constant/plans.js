// Plan tiers for the peenak SaaS deployment. Not part of upstream OpenSign.
export const PLAN_FREE = 'free';
export const PLAN_PRO = 'pro';
export const PLAN_ENTERPRISE = 'enterprise';

// docLimit is the default monthly document-signing cap for the tier.
// Enterprise has no fixed default — each tenant's DocLimit is set explicitly
// when the deal is set up (see partners_Tenant.DocLimit).
export const PLANS = {
  [PLAN_FREE]: { name: 'Free', docLimit: 10 },
  [PLAN_PRO]: { name: 'Pro', docLimit: 500 },
  [PLAN_ENTERPRISE]: { name: 'Enterprise', docLimit: null },
};

export function planDefaults(planId) {
  return PLANS[planId] || PLANS[PLAN_FREE];
}
