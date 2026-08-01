/**
 * Creates partners_UpgradeRequest for the manual plan-upgrade approval flow
 * (see apps/OpenSignServer/cloud/parsefunction/planUpgrade.js). Locked to
 * master-key-only — clients never query this class directly, only through
 * the cloud functions, which enforce tenant scoping and admin checks.
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const schema = new Parse.Schema('partners_UpgradeRequest');
  schema
    .addPointer('TenantId', 'partners_Tenant')
    .addPointer('RequestedByUserId', '_User')
    .addPointer('ResolvedByUserId', '_User')
    .addString('RequestedPlanId')
    .addString('Status') // 'pending' | 'approved' | 'rejected'
    .addString('Note')
    .addString('RejectReason')
    .setCLP({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
    });
  return schema.save(null, { useMasterKey: true });
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const schema = new Parse.Schema('partners_UpgradeRequest');
  return schema.purge().then(() => schema.delete());
};
