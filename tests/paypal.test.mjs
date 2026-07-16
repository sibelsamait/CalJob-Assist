import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePayPalPlanId } from '../src/lib/paypal.js';

test('resuelve el plan de PayPal desde variables específicas por tipo de plan', () => {
  process.env.PAYPAL_PERSONAL_PLAN_ID = 'personal-plan-id';
  process.env.PAYPAL_TEAM_PLAN_ID = 'team-plan-id';
  process.env.PAYPAL_ENTERPRISE_PLAN_ID = 'enterprise-plan-id';

  assert.equal(resolvePayPalPlanId('personal'), 'personal-plan-id');
  assert.equal(resolvePayPalPlanId('team'), 'team-plan-id');
  assert.equal(resolvePayPalPlanId('enterprise'), 'enterprise-plan-id');
});

test('usa el fallback global cuando no existe un plan específico', () => {
  delete process.env.PAYPAL_PERSONAL_PLAN_ID;
  process.env.PAYPAL_PLAN_ID = 'fallback-plan-id';

  assert.equal(resolvePayPalPlanId('personal'), 'fallback-plan-id');
});
