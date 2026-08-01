/**
 * Adds Free/Pro/Enterprise plan fields to partners_Tenant and creates
 * partners_TenantUsage for monthly per-tenant document-count tracking.
 * See apps/OpenSignServer/utils/PlanUtils.js for how these are used.
 *
 * partners_TenantUsage is locked to master-key-only — it's written and read
 * exclusively by cloud code (PlanUtils.js), never directly by clients.
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const partners_Tenant = new Parse.Schema('partners_Tenant');
  partners_Tenant
    .addString('PlanId')
    .addString('PlanName')
    .addNumber('DocLimit')
    .addString('PlanStatus');
  await partners_Tenant.update(null, { useMasterKey: true });

  const partners_TenantUsage = new Parse.Schema('partners_TenantUsage');
  partners_TenantUsage
    .addPointer('TenantId', 'partners_Tenant')
    .addString('YearMonth')
    .addNumber('DocsSent')
    .setCLP({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
    });
  return partners_TenantUsage.save(null, { useMasterKey: true });
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
    .deleteField('PlanStatus');
  await partners_Tenant.update(null, { useMasterKey: true });

  const partners_TenantUsage = new Parse.Schema('partners_TenantUsage');
  return partners_TenantUsage.purge().then(() => partners_TenantUsage.delete());
};
