import { providers, type Provider } from '../mock/providers';

/**
 * Resolve stored favorite provider ids to full Provider records, preserving the
 * order the ids were given (most-recently-favorited first, per the store) and
 * dropping any id that no longer maps to a provider.
 */
export function resolveFavoriteProviders(ids: string[]): Provider[] {
  return ids
    .map((id) => providers.find((p) => p.id === id))
    .filter((p): p is Provider => p !== undefined);
}
