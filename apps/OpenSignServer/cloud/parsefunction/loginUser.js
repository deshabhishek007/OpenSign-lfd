import crypto from 'node:crypto';
import { getTenantForUser, assertTenantActive } from '../../utils/PlanUtils.js';
export default async function loginUser(request) {
  const username = request.params.email;
  const password = request.params.password;

  if (username && password) {
    try {
      // Pass the username and password to logIn function
      const user = await Parse.User.logIn(username, password);
      // console.log('user ', user);
      if (user) {
        // Block login for a tenant the SaaS admin has suspended (see
        // PlanUtils.js / adminTenants.js) — checked here rather than only
        // at document-creation time so a suspended account can't do
        // anything at all, not just stop at the signing quota.
        const tenant = await getTenantForUser(user);
        if (tenant) {
          assertTenantActive(tenant);
        }
        const _user = user?.toJSON();
        return {
          ..._user,
        };
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'user not found.');
      }
    } catch (err) {
      console.log('err in login user', err);
      throw err;
    }
  } else {
    throw new Parse.Error(Parse.Error.PASSWORD_MISSING, 'username/password is missing.');
  }
}
