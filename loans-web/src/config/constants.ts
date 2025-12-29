// Environment configuration
export const DEVICES_API_BASE = import.meta.env.VITE_DEVICES_API_BASE as string | undefined;
export const LOANS_API_BASE = import.meta.env.VITE_LOANS_API_BASE as string | undefined;
export const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;

// Custom Auth0 claim for roles
export const ROLES_CLAIM = "https://loans-app.da007/roles";
