import type { Category, DuplicateMatch, Report } from './types';

export const DUPLICATE_THRESHOLD = 0.55;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'it', 'its', 'this', 'that', 'these', 'those', 'to', 'of', 'in', 'on',
  'at', 'for', 'and', 'or', 'but', 'with', 'when', 'then', 'than', 'so',
  'i', 'my', 'me', 'we', 'our', 'you', 'your', 'they', 'them',
  'do', 'does', 'did', 'doing', 'not', 'no', 'cant', 'cannot', 'dont',
  'doesnt', 'didnt', 'wont', 'isnt', 'wasnt', 'has', 'have', 'had',
  'if', 'as', 'up', 'out', 'from', 'by', 'about', 'into', 'just', 'some'
]);

export function normalizeTitle(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Content words only, with a crude plural fold so "items" matches "item". */
export function tokenize(input: string): Set<string> {
  const words = normalizeTitle(input).split(' ').filter(Boolean);
  const tokens = new Set<string>();

  for (const word of words) {
    if (STOPWORDS.has(word)) continue;
    const folded =
      word.length > 3 && word.endsWith('s') && !word.endsWith('ss')
        ? word.slice(0, -1)
        : word;
    tokens.add(folded);
  }

  return tokens;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const item of a) if (b.has(item)) shared += 1;
  return shared / (a.size + b.size - shared);
}

export function trigrams(input: string): Set<string> {
  const padded = ` ${normalizeTitle(input)} `;
  const out = new Set<string>();
  for (let i = 0; i <= padded.length - 3; i += 1) {
    out.add(padded.slice(i, i + 3));
  }
  return out;
}

export function dice(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const item of a) if (b.has(item)) shared += 1;
  return (2 * shared) / (a.size + b.size);
}

export interface DuplicateCandidate {
  title: string;
  category: Category;
  area: string;
}

/**
 * Explainable duplicate score.
 *
 * Text similarity alone fails on vague titles like "shop doesn't work", which are
 * exactly the reports that need help. Category and area agreement carry real
 * weight so a vague report still surfaces the build-up of bugs in the same place.
 */
export function similarityScore(
  candidate: DuplicateCandidate,
  report: Report
): { score: number; sharedWords: number; sameCategory: boolean; sameArea: boolean } {
  const aTokens = tokenize(candidate.title);
  const bTokens = tokenize(report.title);

  let sharedWords = 0;
  for (const word of aTokens) if (bTokens.has(word)) sharedWords += 1;

  const textScore = jaccard(aTokens, bTokens);
  const spellingScore = dice(trigrams(candidate.title), trigrams(report.title));

  const sameCategory = candidate.category === report.category;
  const sameArea =
    normalizeTitle(candidate.area) !== '' &&
    normalizeTitle(candidate.area) === normalizeTitle(report.area);

  const score =
    0.35 * textScore +
    0.15 * spellingScore +
    (sameCategory ? 0.3 : 0) +
    (sameArea ? 0.2 : 0);

  return { score: Math.min(1, score), sharedWords, sameCategory, sameArea };
}

export function findDuplicates(
  candidate: DuplicateCandidate,
  reports: Report[],
  options: { excludeId?: string; limit?: number } = {}
): DuplicateMatch[] {
  const limit = options.limit ?? 3;

  const matches = reports
    .filter((report) => report.id !== options.excludeId)
    .map((report) => {
      const detail = similarityScore(candidate, report);

      const reasons: string[] = [];
      if (detail.sameCategory) reasons.push('same category');
      if (detail.sameArea) reasons.push('same area');
      if (detail.sharedWords > 0) {
        reasons.push(
          `${detail.sharedWords} shared word${detail.sharedWords === 1 ? '' : 's'}`
        );
      }
      if (reasons.length === 0) reasons.push('similar wording');

      return {
        report,
        score: detail.score,
        reason: reasons.join(', ')
      };
    })
    .filter((match) => match.score >= DUPLICATE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return matches;
}
