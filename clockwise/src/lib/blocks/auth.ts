import { blocksClient } from './client';
import { isLoginConfigured, blocksConfig } from './config';
import type { BlocksOidcUserInfo } from '@seliseblocks/client';

const RETURN_TO_KEY = 'clockwise_return_to';

export async function startLogin(returnTo: string = '/dashboard'): Promise<void> {
  if (!isLoginConfigured()) {
    throw new Error(
      `Login is not configured. Please ensure VITE_BLOCKS_OIDC_CLIENT_ID and VITE_BLOCKS_OIDC_URL are set. Client ID: "${blocksConfig.oidcClientId}"`
    );
  }

  sessionStorage.setItem(RETURN_TO_KEY, returnTo);
  await blocksClient.auth.idp.redirectToProvider();
}

export interface CompleteLoginResult {
  ok: boolean;
  message?: string;
  returnTo?: string;
}

export async function completeLogin(callbackUrl: string): Promise<CompleteLoginResult> {
  const returnTo = sessionStorage.getItem(RETURN_TO_KEY) || '/dashboard';
  sessionStorage.removeItem(RETURN_TO_KEY);

  try {
    const res = await blocksClient.auth.idp.callback(callbackUrl);
    if (res.error) {
      return {
        ok: false,
        message: (res.error_description as string) || (res.error as string) || 'Authentication failed',
      };
    }
    return {
      ok: true,
      returnTo,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to complete login callback';
    return {
      ok: false,
      message,
    };
  }
}

export async function fetchSessionClaims(): Promise<BlocksOidcUserInfo | null> {
  try {
    const isAuthenticated = await blocksClient.auth.isAuthenticated();
    if (!isAuthenticated) {
      return null;
    }
    const info = await blocksClient.auth.userInfo();
    return info || null;
  } catch {
    return null;
  }
}

export async function performLogout(): Promise<void> {
  try {
    await blocksClient.auth.logout();
  } catch {
    // Ignore error if already signed out
  }
  sessionStorage.removeItem(RETURN_TO_KEY);
}
