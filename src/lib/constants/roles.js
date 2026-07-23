export const ROLE_PERMISSIONS = {
  admin: {
    all: true,
  },
  tecnico: {
    viewAdmin: true,
    viewTickets: true,
    viewCompanies: true,
  },
  plan_owner: {
    viewBilling: true,
    manageTeam: true,
    viewCalculators: true,
    viewLibrary: true,
  },
  team_member: {
    viewCalculators: true,
    viewLibrary: true,
    viewBilling: false,
    manageTeam: false,
  },
  user: {
    viewCalculators: true,
    viewLibrary: false,
  },
  readonly: {
    viewCalculators: true,
    viewLibrary: false,
    viewBilling: false,
  },
};

export default ROLE_PERMISSIONS;
