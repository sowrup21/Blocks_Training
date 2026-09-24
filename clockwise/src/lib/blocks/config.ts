export const blocksConfig = {
  apiUrl: import.meta.env.VITE_BLOCKS_API_URL || 'https://blocksapi.slsblx.com',
  appDomain: import.meta.env.VITE_BLOCKS_APP_DOMAIN || 'https://dbggjs-elzzi.slsblx.com',
  devHost: import.meta.env.VITE_BLOCKS_DEV_HOST || 'dbggjs-elzzi.slsblx.com',
  devPort: import.meta.env.VITE_BLOCKS_DEV_PORT || '5173',
  oidcClientId: import.meta.env.VITE_BLOCKS_OIDC_CLIENT_ID || '64e8b4af-5d58-4bf4-bd63-bdbcdfbde222',
  oidcUrl: import.meta.env.VITE_BLOCKS_OIDC_URL || 'https://iam.seliseblocks.com/D70a2fe710f9249d39ecb14bb69a35695/.well-known/openid-configuration',
  oidcScope: import.meta.env.VITE_BLOCKS_OIDC_SCOPE || 'openid profile',
  tenantId: import.meta.env.VITE_BLOCKS_TENANT_ID || 'D70a2fe710f9249d39ecb14bb69a35695',
};

export function isLoginConfigured(): boolean {
  return Boolean(blocksConfig.apiUrl && blocksConfig.oidcClientId && blocksConfig.oidcUrl);
}
