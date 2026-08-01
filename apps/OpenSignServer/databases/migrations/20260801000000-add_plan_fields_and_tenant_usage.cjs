/**
 * Adds Free/Pro/Org plan fields to partners_Tenant, including a LIFETIME
 * document balance (DocLimit/DocsUsed — never resets monthly). See
 * apps/OpenSignServer/utils/PlanUtils.js for how these are enforced.
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const partners_Tenant = new Parse.Schema('partners_Tenant');
  partners_Tenant
    .addString('PlanId')
    .addString('PlanName')
    .addNumber('DocLimit') // lifetime cap; null = unlimited
    .addNumber('DocsUsed') // lifetime count, debited on each document created
    .addString('PlanStatus');
  return partners_Tenant.update(null, { useMasterKey: true });
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const partners_Tenant = new Parse.Schema('partners_Tenant');
  partners_Tenant
    .deleteField('PlanId')
    .deleteField('PlanName')
    .deleteField('DocLimit')
    .deleteField('DocsUsed')
    .deleteField('PlanStatus');
  return partners_Tenant.update(null, { useMasterKey: true });
};
