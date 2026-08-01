import axios from 'axios';
import { cloudServerUrl, serverAppId } from '../../Utils.js';
import { PLAN_FREE, planDefaults } from '../constant/plans.js';
import { ensureOrgAndTeam } from '../../utils/OrgUtils.js';
const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
const APPID = serverAppId;
const masterKEY = process.env.MASTER_KEY;

async function saveUser(userDetails) {
  // Pre-existing upstream bug: this called an undefined `normalizeEmail()`,
  // which threw on every signup and was silently swallowed by the outer
  // try/catch below (no rethrow) — so self-serve signup never actually
  // worked, upstream or here, until this fix. Parse Server already
  // maintains its own internal case-insensitive email index; this field is
  // just a plain lowercase/trimmed copy.
  const normalizedEmail = userDetails.email.toLowerCase().replace(/\s/g, '');
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('username', userDetails.email);
  const userRes = await userQuery.first({ useMasterKey: true });

  if (userRes) {
    const url = `${serverUrl}/loginAs`;
    const axiosRes = await axios({
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'X-Parse-Application-Id': APPID,
        'X-Parse-Master-Key': masterKEY,
      },
      params: {
        userId: userRes.id,
      },
    });
    const login = await axiosRes.data;
    // console.log("login ", login);
    return { id: login.objectId, sessionToken: login.sessionToken };
  } else {
    const user = new Parse.User();
    user.set('username', userDetails.email);
    user.set('password', userDetails.password);
    user.set('email', userDetails?.email?.toLowerCase()?.replace(/\s/g, ''));
    user.set('normalizedEmail', normalizedEmail);

    if (userDetails?.phone) {
      user.set('phone', userDetails.phone);
    }
    user.set('name', userDetails.name);

    const res = await user.signUp();
    // console.log("res ", res);
    return { id: res.id, sessionToken: res.getSessionToken() };
  }
}
export default async function usersignup(request) {
  const userDetails = request.params.userDetails;

  try {
    const user = await saveUser(userDetails);
    const extClass = userDetails.role.split('_')[0];

    const extQuery = new Parse.Query(extClass + '_Users');
    extQuery.equalTo('UserId', {
      __type: 'Pointer',
      className: '_User',
      objectId: user.id,
    });
    const extUser = await extQuery.first({ useMasterKey: true });
    if (extUser) {
      return { message: 'User already exist' };
    } else {
      // console.log("role ", role);
      const partnerCls = Parse.Object.extend('partners_Tenant');
      const partnerQuery = new partnerCls();
      partnerQuery.set('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: user.id,
      });

      if (userDetails?.phone) {
        partnerQuery.set('ContactNumber', userDetails.phone);
      }
      partnerQuery.set('TenantName', userDetails.company);
      partnerQuery.set('EmailAddress', userDetails?.email?.toLowerCase()?.replace(/\s/g, ''));
      partnerQuery.set('IsActive', true);

      // New tenants start on the Free plan; upgrading to Pro/Enterprise
      // happens via billing (see PlanUtils.js for how DocLimit is enforced).
      const startingPlan = planDefaults(PLAN_FREE);
      partnerQuery.set('PlanId', PLAN_FREE);
      partnerQuery.set('PlanName', startingPlan.name);
      partnerQuery.set('DocLimit', startingPlan.docLimit); // lifetime balance, see PlanUtils.js
      partnerQuery.set('DocsUsed', 0);
      partnerQuery.set('PlanStatus', 'active');
      partnerQuery.set('CreatedBy', {
        __type: 'Pointer',
        className: '_User',
        objectId: user.id,
      });
      if (userDetails && userDetails.pincode) {
        partnerQuery.set('PinCode', userDetails.pincode);
      }
      if (userDetails && userDetails.country) {
        partnerQuery.set('Country', userDetails.country);
      }
      if (userDetails && userDetails.state) {
        partnerQuery.set('State', userDetails.state);
      }
      if (userDetails && userDetails.city) {
        partnerQuery.set('City', userDetails.city);
      }
      if (userDetails && userDetails.address) {
        partnerQuery.set('Address', userDetails.address);
      }
      const tenantRes = await partnerQuery.save(null, { useMasterKey: true });
      // console.log("tenantRes ", tenantRes);
      const extCls = Parse.Object.extend(extClass + '_Users');
      const newObj = new extCls();
      newObj.set('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: user.id,
      });
      newObj.set('UserRole', userDetails.role);
      newObj.set('Email', userDetails?.email?.toLowerCase()?.replace(/\s/g, ''));
      newObj.set('Name', userDetails.name);
      if (userDetails?.phone) {
        newObj.set('Phone', userDetails?.phone);
      }
      newObj.set('TenantId', {
        __type: 'Pointer',
        className: 'partners_Tenant',
        objectId: tenantRes.id,
      });
      if (userDetails && userDetails.company) {
        newObj.set('Company', userDetails.company);
      }
      if (userDetails && userDetails.jobTitle) {
        newObj.set('JobTitle', userDetails.jobTitle);
      }
      if (userDetails && userDetails?.timezone) {
        newObj.set('Timezone', userDetails.timezone);
      }
      const extRes = await newObj.save(null, { useMasterKey: true });

      // Without this, "Add user" (addUser.js) always fails for a self-serve
      // tenant — it requires organization.objectId, and nothing else in this
      // signup path ever created one. Same helper AddAdmin.js's bootstrap
      // flow uses.
      await ensureOrgAndTeam({
        objectId: extRes.id,
        Company: userDetails.company,
        TenantId: { objectId: tenantRes.id },
        UserId: { objectId: user.id },
      });

      return { message: 'User sign up', sessionToken: user.sessionToken };
    }
  } catch (err) {
    // Pre-existing upstream bug: this caught-and-swallowed every error with
    // no rethrow, so callers got `undefined` back on failure instead of a
    // real error (this is exactly how the normalizeEmail bug above went
    // unnoticed — Signup.jsx and the Google-onboarding modal in Login.jsx
    // both need a thrown error to show anything to the user).
    console.log('Err in usersignup ', err);
    const code = err?.code || 400;
    const message = err?.message || 'Something went wrong during signup.';
    throw new Parse.Error(code, message);
  }
}
