// Shared "create the default Organization + 'All Users' Team for a new
// contracts_Users record" logic. Extracted from AddAdmin.js (upstream's
// first-time-server-bootstrap page), which is the only place this used to
// run. usersignup.js — this deployment's actual self-serve /signup flow —
// never called it, so every self-serve tenant had no Organization at all,
// meaning "Add user" (addUser.js) always failed for them since it requires
// organization.objectId, even after upgrading to the multi-user Org plan.
//
// extUser here is a plain object shape (not a Parse.Object), matching what
// AddAdmin.js already builds: { objectId, Company, TenantId: { objectId },
// UserId: { objectId } }.
export async function ensureOrgAndTeam(extUser) {
  try {
    const extUserCls = new Parse.Query('contracts_Users');
    const updateUser = await extUserCls.get(extUser.objectId, { useMasterKey: true });
    if (updateUser && !updateUser?.get('OrganizationId')) {
      const orgCls = new Parse.Object('contracts_Organizations');
      orgCls.set('Name', extUser.Company);
      orgCls.set('IsActive', true);
      orgCls.set('ExtUserId', {
        __type: 'Pointer',
        className: 'contracts_Users',
        objectId: extUser?.objectId,
      });
      orgCls.set('CreatedBy', {
        __type: 'Pointer',
        className: '_User',
        objectId: extUser?.UserId?.objectId,
      });
      orgCls.set('TenantId', {
        __type: 'Pointer',
        className: 'partners_Tenant',
        objectId: extUser?.TenantId?.objectId,
      });

      const orgRes = await orgCls.save(null, { useMasterKey: true });
      const teamCls = new Parse.Object('contracts_Teams');
      teamCls.set('Name', 'All Users');
      teamCls.set('OrganizationId', {
        __type: 'Pointer',
        className: 'contracts_Organizations',
        objectId: orgRes.id,
      });
      teamCls.set('IsActive', true);
      const teamRes = await teamCls.save(null, { useMasterKey: true });

      updateUser.set('OrganizationId', {
        __type: 'Pointer',
        className: 'contracts_Organizations',
        objectId: orgRes.id,
      });
      updateUser.set('TeamIds', [
        {
          __type: 'Pointer',
          className: 'contracts_Teams',
          objectId: teamRes.id,
        },
      ]);
      await updateUser.save(null, { useMasterKey: true });
    }
  } catch (err) {
    console.log('err in ensureOrgAndTeam', err);
  }
}
