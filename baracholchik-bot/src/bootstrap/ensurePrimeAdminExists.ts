

import UserManager from "../db/UserManager";
import User from "../db/User";

/**
 * Ensure the prime admin exists and has baseline permissions.
 *
 * This is a bootstrap/preflight step, not a Telegram handler.
 * It is idempotent and safe to call on every startup.
 *
 * Behaviour:
 * 1) Reads ADMIN_TGID from env.
 * 2) Creates the user if missing (via UserManager.addFirstAdmin()).
 * 3) Grants baseline permissions (admin_all, user_casuall) to that user.
 * 4) Persists changes if any.
 */
export default function ensurePrimeAdminExists(): void {
  // Step 1: validate env
  const raw = process.env.ADMIN_TGID;
  if (!raw) {
    console.warn("[bootstrap] ensurePrimeAdminExists: ADMIN_TGID is not set; skipping prime admin bootstrap");
    return;
  }

  const adminId = Number(raw);
  if (!Number.isFinite(adminId)) {
    console.error(`[bootstrap] ensurePrimeAdminExists: ADMIN_TGID="${raw}" is not a valid number; skipping`);
    return;
  }

  // Step 2: create user record if missing
  try {
    UserManager.addFirstAdmin();
  } catch (e) {
    console.error("[bootstrap] ensurePrimeAdminExists: failed to add first admin via UserManager", e);
    return;
  }

  const user = UserManager.getById(adminId);
  if (!user) {
    console.error(`[bootstrap] ensurePrimeAdminExists: user ${adminId} not found after addFirstAdmin(); aborting`);
    return;
  }

  // Step 3: grant baseline permissions using the User API
  const requiredPerms = ["admin_all", "user_casuall"] as const;
  let changed = false;

  for (const p of requiredPerms) {
    if (!user.hasPermission(p)) {
      user.permitTo(p);
      changed = true;
    }
  }

  // Step 4: persist if anything changed
  if (changed) {
    UserManager.saveUser(user as unknown as User);
    console.log(`[bootstrap] ensurePrimeAdminExists: ensured admin ${adminId} permissions [${requiredPerms.join(", ")}]`);
  } else {
    console.log(`[bootstrap] ensurePrimeAdminExists: admin ${adminId} already has required permissions`);
  }
}