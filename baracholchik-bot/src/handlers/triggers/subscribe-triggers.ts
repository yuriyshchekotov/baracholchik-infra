

import UserManager from '../../db/UserManager';
import FilterManager from '../../db/FilterManager';
import Filter from '../../db/Filter';

export function generateFilterName(keywords: string[], conjunction: boolean): string {
  if (keywords.length === 1) return keywords[0];
  const joiner = conjunction ? ' И ' : ' ИЛИ ';
  return keywords.join(joiner);
}

export function isSameFilter(f1: Filter, f2: { keywords: string[]; conjunction: boolean }): boolean {
  if (f1.conjunction !== f2.conjunction) return false;
  const a = new Set(f1.keywords.map(k => k.toLowerCase()));
  const b = new Set(f2.keywords.map(k => k.toLowerCase()));
  if (a.size !== b.size) return false;
  for (const word of a) {
    if (!b.has(word)) return false;
  }
  return true;
}

export function subscribeUserToFilter(
  userId: number,
  keywords: string[],
  conjunction: boolean
): { status: 'success' | 'alreadyExists'; name?: string } {
  const user = UserManager.addUserIfNotExists(userId);
  const userFilters = user.filters
    .map(id => FilterManager.getById(id))
    .filter((f): f is Filter => f !== undefined);

  const candidate = { keywords, conjunction };
  const alreadyHas = userFilters.some(f => isSameFilter(f, candidate));

  if (alreadyHas) return { status: 'alreadyExists' };

  const name = generateFilterName(keywords, conjunction);
  const newFilter = FilterManager.addFilter({
    name,
    keywords,
    conjunction,
    regex: []
  });

  user.subscribeTo(newFilter.id);
  UserManager.saveUser(user);

  return { status: 'success', name };
}