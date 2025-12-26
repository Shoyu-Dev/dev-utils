import { describe, it, expect } from 'vitest';
import { computeLineDiff, computeWordDiff, computeDiffStats } from '../utils/diff';

describe('Line Diff', () => {
  it('should detect no changes for identical text', () => {
    const diff = computeLineDiff('hello\nworld', 'hello\nworld');
    expect(diff.every(part => !part.added && !part.removed)).toBe(true);
  });

  it('should detect added lines', () => {
    const diff = computeLineDiff('hello', 'hello\nworld');
    const addedParts = diff.filter(part => part.added);
    expect(addedParts.length).toBeGreaterThan(0);
    expect(addedParts.some(p => p.value.includes('world'))).toBe(true);
  });

  it('should detect removed lines', () => {
    const diff = computeLineDiff('hello\nworld', 'hello');
    const removedParts = diff.filter(part => part.removed);
    expect(removedParts.length).toBeGreaterThan(0);
    expect(removedParts.some(p => p.value.includes('world'))).toBe(true);
  });

  it('should detect modified lines', () => {
    const diff = computeLineDiff('hello world', 'hello there');
    const changes = diff.filter(part => part.added || part.removed);
    expect(changes.length).toBeGreaterThan(0);
  });

  it('should handle empty strings', () => {
    const diff = computeLineDiff('', '');
    // diff library may return an empty array or a single unchanged part
    expect(diff.every(part => !part.added && !part.removed)).toBe(true);
  });

  it('should handle adding to empty', () => {
    const diff = computeLineDiff('', 'hello');
    expect(diff.some(p => p.added)).toBe(true);
  });

  it('should handle removing to empty', () => {
    const diff = computeLineDiff('hello', '');
    expect(diff.some(p => p.removed)).toBe(true);
  });
});

describe('Word Diff', () => {
  it('should detect no changes for identical text', () => {
    const diff = computeWordDiff('hello world', 'hello world');
    expect(diff.every(part => !part.added && !part.removed)).toBe(true);
  });

  it('should detect added words', () => {
    const diff = computeWordDiff('hello', 'hello world');
    const addedParts = diff.filter(part => part.added);
    expect(addedParts.length).toBeGreaterThan(0);
  });

  it('should detect removed words', () => {
    const diff = computeWordDiff('hello world', 'hello');
    const removedParts = diff.filter(part => part.removed);
    expect(removedParts.length).toBeGreaterThan(0);
  });

  it('should detect changed words', () => {
    const diff = computeWordDiff('hello world', 'hello there');
    const changes = diff.filter(part => part.added || part.removed);
    expect(changes.length).toBeGreaterThan(0);
  });
});

describe('Diff Stats', () => {
  it('should count added and removed lines', () => {
    const diff = computeLineDiff('line1\nline2', 'line1\nline3');
    const stats = computeDiffStats(diff, 'lines');
    expect(stats.added).toBeGreaterThan(0);
    expect(stats.removed).toBeGreaterThan(0);
  });

  it('should count added and removed words', () => {
    const diff = computeWordDiff('hello world', 'hello there');
    const stats = computeDiffStats(diff, 'words');
    expect(stats.added).toBeGreaterThan(0);
    expect(stats.removed).toBeGreaterThan(0);
  });

  it('should return zero for identical text', () => {
    const diff = computeLineDiff('hello', 'hello');
    const stats = computeDiffStats(diff, 'lines');
    expect(stats.added).toBe(0);
    expect(stats.removed).toBe(0);
  });

  it('should count multiple lines correctly', () => {
    const diff = computeLineDiff('a\nb\nc', 'x\ny\nz');
    const stats = computeDiffStats(diff, 'lines');
    expect(stats.added).toBe(3);
    expect(stats.removed).toBe(3);
  });
});

describe('Complex Diff Scenarios', () => {
  it('should handle large text blocks', () => {
    const lines = Array.from({ length: 100 }, (_, i) => `line ${i}`);
    const original = lines.join('\n');
    const modified = lines.map((l, i) => i === 50 ? 'changed line' : l).join('\n');

    const diff = computeLineDiff(original, modified);
    const stats = computeDiffStats(diff, 'lines');
    expect(stats.added).toBe(1);
    expect(stats.removed).toBe(1);
  });

  it('should handle special characters', () => {
    const diff = computeLineDiff('hello <world>', 'hello "world"');
    expect(diff.length).toBeGreaterThan(0);
  });

  it('should handle unicode', () => {
    const diff = computeLineDiff('hello 世界', 'hello мир');
    const changes = diff.filter(p => p.added || p.removed);
    expect(changes.length).toBeGreaterThan(0);
  });

  it('should handle tabs and spaces', () => {
    const diff = computeLineDiff('hello\tworld', 'hello  world');
    const changes = diff.filter(p => p.added || p.removed);
    expect(changes.length).toBeGreaterThan(0);
  });
});
