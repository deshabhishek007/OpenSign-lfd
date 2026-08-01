// Plan tiers for the peenak SaaS deployment. Not part of upstream OpenSign.
//
// docLimit is a LIFETIME document balance, not monthly — see PlanUtils.js.
// It's expected to be topped up over time via plan upgrades and paid add-on
// document packs; `docLimit` here is only the *starting* balance for a new
// tenant on that plan, not a hard ceiling enforced anywhere.
export const PLAN_FREE = 'free';
export const PLAN_PRO = 'pro';
export const PLAN_ORG = 'org';

export const PLANS = {
  [PLAN_FREE]: { name: 'Free', docLimit: 30, multiUser: false },
  [PLAN_PRO]: { name: 'Pro', docLimit: 300, multiUser: false },
  [PLAN_ORG]: { name: 'Org', docLimit: 1000, multiUser: true },
};

export function planDefaults(planId) {
  return PLANS[planId] || PLANS[PLAN_FREE];
}
