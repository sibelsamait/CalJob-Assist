export const PLANS = {
  personal: {
    label: 'Personal',
    price: 15000,
    maxUsers: 1,
    color: '#003087',
  },
  team: {
    label: 'Equipo',
    price: 49000,
    maxUsers: 10,
    color: '#0050a0',
  },
  enterprise: {
    label: 'Empresarial',
    price: 149000,
    maxUsers: -1,
    color: '#C0392B',
  },
  internal: {
    label: 'Interno DT',
    price: 0,
    maxUsers: -1,
    color: '#2e7d32',
  },
};

export default PLANS;
