// Email notifications for the plan-upgrade approval flow (peenak SaaS
// deployment, not part of upstream OpenSign). Uses Parse Server's own
// configured email adapter (Parse.Cloud.sendEmail — see the emailAdapter
// block in index.js), same as sendDeleteUserMail.js, rather than the
// client-facing sendSystemMail.js (that one's built for user-triggered
// "quick send" mail with per-user quota tracking and a spam-report
// footer — wrong shape for an internal system notification).
import { appName, smtpenable } from '../Utils.js';

function mailSender() {
  const mailsender = smtpenable ? process.env.SMTP_USER_EMAIL : process.env.MAILGUN_SENDER;
  return `${appName} <${mailsender}>`;
}

export function getSaasAdminEmails() {
  return (process.env.SAAS_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
}

// Failures here are logged, never thrown — a notification email going
// missing shouldn't block the actual request/approve/reject action that
// triggered it.
export async function notifyAdminsOfUpgradeRequest({ tenantName, requesterEmail, requestedPlanName, note }) {
  const admins = getSaasAdminEmails();
  if (admins.length === 0) return;
  try {
    await Parse.Cloud.sendEmail({
      sender: mailSender(),
      recipient: admins.join(','),
      subject: `New plan upgrade request: ${tenantName} → ${requestedPlanName}`,
      text: `${tenantName} (${requesterEmail}) requested an upgrade to ${requestedPlanName}.${
        note ? `\n\nNote: ${note}` : ''
      }\n\nReview and approve from the Plan & Billing admin page.`,
      html: `<p><b>${tenantName}</b> (${requesterEmail}) requested an upgrade to <b>${requestedPlanName}</b>.</p>${
        note ? `<p>Note: ${note}</p>` : ''
      }<p>Review and approve from the Plan &amp; Billing admin page.</p>`,
    });
  } catch (err) {
    console.log('notifyAdminsOfUpgradeRequest error', err.message);
  }
}

export async function notifyTenantOfUpgradeDecision({ requesterEmail, tenantName, requestedPlanName, approved, reason }) {
  if (!requesterEmail) return;
  try {
    const subject = approved
      ? `Your upgrade to ${requestedPlanName} has been approved`
      : `Your upgrade request to ${requestedPlanName} was not approved`;
    const text = approved
      ? `Good news — ${tenantName}'s upgrade to ${requestedPlanName} has been approved and is active now.`
      : `Your request to upgrade ${tenantName} to ${requestedPlanName} was not approved.${
          reason ? ` Reason: ${reason}` : ''
        }`;
    await Parse.Cloud.sendEmail({
      sender: mailSender(),
      recipient: requesterEmail,
      subject,
      text,
      html: `<p>${text}</p>`,
    });
  } catch (err) {
    console.log('notifyTenantOfUpgradeDecision error', err.message);
  }
}
