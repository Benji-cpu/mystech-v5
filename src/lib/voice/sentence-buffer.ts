/**
 * Accumulates streaming tokens and emits complete sentences.
 * Detects sentence boundaries: `.` `!` `?` followed by whitespace or end.
 * Handles common abbreviations and ellipsis to avoid false splits.
 */
export class SentenceBuffer {
  private buffer = '';
  private onSentence: (sentence: string) => void;

  // Common abbreviations that shouldn't trigger sentence splits
  private static readonly ABBREVIATIONS = new Set([
    'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr',
    'st', 'ave', 'blvd', 'dept', 'est', 'govt',
    'inc', 'ltd', 'co', 'corp', 'vs', 'etc',
    'e.g', 'i.e', 'fig', 'vol', 'no',
  ]);

  constructor(onSentence: (sentence: string) => void) {
    this.onSentence = onSentence;
  }

  push(token: string): void {
    this.buffer += token;
    this.extractSentences();
  }

  flush(): void {
    const remaining = this.buffer.trim();
    if (remaining) {
      this.onSentence(remaining);
      this.buffer = '';
    }
  }

  private extractSentences(): void {
    // Match sentence-ending punctuation followed by whitespace
    const pattern = /([.!?])(\s+)/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = pattern.exec(this.buffer)) !== null) {
      const endPos = match.index + match[1].length;
      const candidate = this.buffer.slice(lastIndex, endPos).trim();

      if (!candidate) continue;

      // Check for ellipsis — don't split on ...
      if (match[1] === '.' && this.isEllipsis(match.index)) {
        continue;
      }

      // Check for abbreviations
      if (match[1] === '.' && this.isAbbreviation(match.index)) {
        continue;
      }

      this.onSentence(candidate);
      lastIndex = endPos + match[2].length;
    }

    if (lastIndex > 0) {
      this.buffer = this.buffer.slice(lastIndex);
    }
  }

  private isEllipsis(dotIndex: number): boolean {
    // Check if this dot is part of "..." or ".."
    const before = this.buffer[dotIndex - 1];
    const after = this.buffer[dotIndex + 1];
    return before === '.' || after === '.';
  }

  private isAbbreviation(dotIndex: number): boolean {
    // Extract the word before the dot
    const beforeDot = this.buffer.slice(0, dotIndex);
    const wordMatch = beforeDot.match(/(\w+)$/);
    if (!wordMatch) return false;
    return SentenceBuffer.ABBREVIATIONS.has(wordMatch[1].toLowerCase());
  }
}
