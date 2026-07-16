const PLAN_ENV_NAMES = {
  personal: ['PAYPAL_PERSONAL_PLAN_ID', 'PERSONAL_PLAN_ID', 'PAYPAL_PLAN_ID'],
  team: ['PAYPAL_TEAM_PLAN_ID', 'TEAM_PLAN_ID', 'PAYPAL_PLAN_ID'],
  enterprise: ['PAYPAL_ENTERPRISE_PLAN_ID', 'ENTERPRISE_PLAN_ID', 'PAYPAL_PLAN_ID'],
};

export function resolvePayPalPlanId(planKey) {
  const envNames = PLAN_ENV_NAMES[planKey] || ['PAYPAL_PLAN_ID'];

  for (const envName of envNames) {
    const value = process.env[envName]?.trim();
    if (value) return value;
  }

  return null;
}
