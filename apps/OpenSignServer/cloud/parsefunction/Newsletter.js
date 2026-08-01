// Upstream OpenSign forwards this to OpenSign Labs' own newsletter service
// (app.opensignlabs.com) — a third-party data leak that doesn't belong under
// the LDF Sign brand. No-op until this deployment has its own newsletter
// backend to wire up instead.
export default async function Newsletter() {
  return 'success';
}
