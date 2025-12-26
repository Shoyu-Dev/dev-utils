/**
 * Diff utility functions
 * PRIVACY-CRITICAL: All diffing is done locally using the 'diff' library
 */

import { diffLines, diffWords, Change } from 'diff';

export interface DiffStats {
  added: number;
  removed: number;
}

export function computeLineDiff(textA: string, textB: string): Change[] {
  return diffLines(textA, textB);
}

export function computeWordDiff(textA: string, textB: string): Change[] {
  return diffWords(textA, textB);
}

export function computeDiffStats(changes: Change[], mode: 'lines' | 'words'): DiffStats {
  let added = 0;
  let removed = 0;

  changes.forEach((part) => {
    const count = mode === 'lines'
      ? (part.value.match(/\n/g) || []).length + (part.value.endsWith('\n') ? 0 : 1)
      : part.value.split(/\s+/).filter(Boolean).length;

    if (part.added) added += count;
    if (part.removed) removed += count;
  });

  return { added, removed };
}
