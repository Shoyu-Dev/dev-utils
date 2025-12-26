import { useState, useMemo } from 'react';
import { diffLines, diffWords, Change } from 'diff';

type DiffMode = 'lines' | 'words';
type ViewMode = 'unified' | 'split';

function DiffChecker() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [diffMode, setDiffMode] = useState<DiffMode>('lines');
  const [viewMode, setViewMode] = useState<ViewMode>('unified');

  const diff = useMemo(() => {
    if (!textA && !textB) return [];
    return diffMode === 'lines'
      ? diffLines(textA, textB)
      : diffWords(textA, textB);
  }, [textA, textB, diffMode]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diff.forEach((part) => {
      const count = diffMode === 'lines'
        ? (part.value.match(/\n/g) || []).length + (part.value.endsWith('\n') ? 0 : 1)
        : part.value.split(/\s+/).filter(Boolean).length;
      if (part.added) added += count;
      if (part.removed) removed += count;
    });
    return { added, removed };
  }, [diff, diffMode]);

  const renderUnifiedDiff = () => {
    return diff.map((part: Change, index: number) => {
      const className = part.added
        ? 'diff-line diff-added'
        : part.removed
        ? 'diff-line diff-removed'
        : 'diff-line diff-unchanged';

      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';

      if (diffMode === 'lines') {
        return part.value.split('\n').filter((_, i, arr) => i < arr.length - 1 || part.value.slice(-1) !== '\n').map((line, lineIndex) => (
          <div key={`${index}-${lineIndex}`} className={className}>
            {prefix}{line}
          </div>
        ));
      }

      return (
        <span key={index} className={className}>
          {part.value}
        </span>
      );
    });
  };

  const renderSplitDiff = () => {
    const leftLines: { value: string; type: 'removed' | 'unchanged' | 'empty' }[] = [];
    const rightLines: { value: string; type: 'added' | 'unchanged' | 'empty' }[] = [];

    diff.forEach((part: Change) => {
      const lines = part.value.split('\n').filter((_, i, arr) => i < arr.length - 1 || part.value.slice(-1) !== '\n');

      if (part.removed) {
        lines.forEach(line => {
          leftLines.push({ value: line, type: 'removed' });
          rightLines.push({ value: '', type: 'empty' });
        });
      } else if (part.added) {
        lines.forEach(line => {
          leftLines.push({ value: '', type: 'empty' });
          rightLines.push({ value: line, type: 'added' });
        });
      } else {
        lines.forEach(line => {
          leftLines.push({ value: line, type: 'unchanged' });
          rightLines.push({ value: line, type: 'unchanged' });
        });
      }
    });

    // Compact the split view by matching removed/added pairs
    const compacted: { left: typeof leftLines[0]; right: typeof rightLines[0] }[] = [];
    let leftIdx = 0;
    let rightIdx = 0;

    while (leftIdx < leftLines.length || rightIdx < rightLines.length) {
      const left = leftLines[leftIdx] || { value: '', type: 'empty' as const };
      const right = rightLines[rightIdx] || { value: '', type: 'empty' as const };

      if (left.type === 'unchanged' && right.type === 'unchanged') {
        compacted.push({ left, right });
        leftIdx++;
        rightIdx++;
      } else if (left.type === 'removed' && right.type === 'empty') {
        // Look ahead for added line
        const nextAddedIdx = rightLines.findIndex((r, i) => i > rightIdx && r.type === 'added');
        if (nextAddedIdx !== -1 && rightLines.slice(rightIdx, nextAddedIdx).every(r => r.type === 'empty')) {
          compacted.push({ left, right: rightLines[nextAddedIdx] });
          leftIdx++;
          rightIdx = nextAddedIdx + 1;
        } else {
          compacted.push({ left, right: { value: '', type: 'empty' } });
          leftIdx++;
          rightIdx++;
        }
      } else {
        compacted.push({ left, right });
        leftIdx++;
        rightIdx++;
      }
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
        <div>
          {leftLines.map((line, i) => (
            <div
              key={i}
              className={`diff-line ${line.type === 'removed' ? 'diff-removed' : line.type === 'empty' ? '' : 'diff-unchanged'}`}
              style={{ minHeight: '1.5em' }}
            >
              {line.type !== 'empty' && line.value}
            </div>
          ))}
        </div>
        <div>
          {rightLines.map((line, i) => (
            <div
              key={i}
              className={`diff-line ${line.type === 'added' ? 'diff-added' : line.type === 'empty' ? '' : 'diff-unchanged'}`}
              style={{ minHeight: '1.5em' }}
            >
              {line.type !== 'empty' && line.value}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">Diff Checker</h1>
        <p className="tool-description">
          Compare two texts and highlight the differences between them.
        </p>
      </div>

      <div className="btn-group">
        <button
          className={`btn ${diffMode === 'lines' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDiffMode('lines')}
        >
          Line Diff
        </button>
        <button
          className={`btn ${diffMode === 'words' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDiffMode('words')}
        >
          Word Diff
        </button>
        <span style={{ width: '1rem' }} />
        <button
          className={`btn ${viewMode === 'unified' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('unified')}
        >
          Unified
        </button>
        <button
          className={`btn ${viewMode === 'split' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('split')}
          disabled={diffMode === 'words'}
        >
          Split
        </button>
      </div>

      <div className="two-column">
        <div className="input-group">
          <label className="input-label">Original Text</label>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Paste original text here..."
          />
        </div>
        <div className="input-group">
          <label className="input-label">Modified Text</label>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="Paste modified text here..."
          />
        </div>
      </div>

      {(textA || textB) && (
        <div className="output-area">
          <div className="output-header">
            <span className="output-title">Differences</span>
            <span style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-secondary)' }}>+{stats.added}</span>
              {' / '}
              <span style={{ color: 'var(--accent-error)' }}>-{stats.removed}</span>
              {' '}
              {diffMode === 'lines' ? 'lines' : 'words'}
            </span>
          </div>
          <div className="diff-container">
            {viewMode === 'unified' || diffMode === 'words'
              ? renderUnifiedDiff()
              : renderSplitDiff()
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default DiffChecker;
