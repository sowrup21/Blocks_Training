import { createBlocksClient } from '@seliseblocks/client';
import { blocksConfig } from './config';

export const blocksClient = createBlocksClient({
  apiUrl: blocksConfig.apiUrl,
  appDomain: blocksConfig.appDomain,
  xBlocksKey: blocksConfig.tenantId,
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      cache: 'no-cache',
    });
  },
  oidc: {
    clientId: blocksConfig.oidcClientId,
    url: blocksConfig.oidcUrl,
    scope: blocksConfig.oidcScope,
  },
});
