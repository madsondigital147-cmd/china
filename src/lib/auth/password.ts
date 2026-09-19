import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Enforce a reasonable password policy for the platform.
 */
export function passwordPolicyIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push("Password must be at least 8 characters.");
  if (!/[A-Z]/.test(password)) issues.push("Password must include an uppercase letter.");
  if (!/[a-z]/.test(password)) issues.push("Password must include a lowercase letter.");
  if (!/[0-9]/.test(password)) issues.push("Password must include a number.");
  return issues;
}