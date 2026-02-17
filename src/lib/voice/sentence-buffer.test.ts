import { describe, it, expect, vi } from 'vitest';
import { SentenceBuffer } from './sentence-buffer';

describe('SentenceBuffer', () => {
  it('emits a sentence on period followed by space', () => {
    const onSentence = vi.fn();
    const buffer = new SentenceBuffer(onSentence);

    buffer.push('Hello world. ');
    expect(onSentence).toHaveBeenCalledWith('Hello world.');
  });

  it('emits a sentence on exclamation mark', () => {
    const onSentence = vi.fn();
    const buffer = new SentenceBuffer(onSentence);

    buffer.push('Amazing! ');
    expect(onSentence).toHaveBeenCalledWith('Amazing!');
  });

  it('emits a sentence on question mark', () => {
    const onSentence = vi.fn();
    const buffer = new SentenceBuffer(onSentence);

    buffer.push('What is life? ');
    expect(onSentence).toHaveBeenCalledWith('What is life?');
  });

  it('accumulates tokens before emitting', () => {
    const onSentence = vi.fn();
    const buffer = new SentenceBuffer(onSentence);

    buffer.push('Hello');
    buffer.push(' world');
    expect(onSentence).not.toHaveBeenCalled();

    buffer.push('. Next');
    expect(onSentence).toHaveBeenCalledWith('Hello world.');
  });

  it('emits multiple sentences', () => {
    const onSentence = vi.fn();
    const buffer = new SentenceBuffer(onSentence);

    buffer.push('First sentence. Second sentence. ');
    expect(onSentence).toHaveBeenCalledTimes(2);
    expect(onSentence).toHaveBeenNthCalledWith(1, 'First sentence.');
    expect(onSentence).toHaveBeenNthCalledWith(2, 'Second sentence.');
  });

  it('does not split on ellipsis', () => {
    const onSentence = vi.fn();
    const buffer = new SentenceBuffer(onSentence);

    buffer.push('Wait... what? ');
    expect(onSentence).toHaveBeenCalledTimes(1);
    expect(onSentence).toHaveBeenCalledWith('Wait... what?');
  });

  it('does not split on common abbreviations', () => {
    const onSentence = vi.fn();
    const buffer = new SentenceBuffer(onSentence);

    buffer.push('Dr. Smith is here. ');
    expect(onSentence).toHaveBeenCalledTimes(1);
    expect(onSentence).toHaveBeenCalledWith('Dr. Smith is here.');
  });

  it('flush emits remaining content', () => {
    const onSentence = vi.fn();
    const buffer = new SentenceBuffer(onSentence);

    buffer.push('Incomplete sentence');
    expect(onSentence).not.toHaveBeenCalled();

    buffer.flush();
    expect(onSentence).toHaveBeenCalledWith('Incomplete sentence');
  });

  it('flush does nothing on empty buffer', () => {
    const onSentence = vi.fn();
    const buffer = new SentenceBuffer(onSentence);

    buffer.flush();
    expect(onSentence).not.toHaveBeenCalled();
  });

  it('handles streaming token-by-token', () => {
    const onSentence = vi.fn();
    const buffer = new SentenceBuffer(onSentence);

    const tokens = ['The', ' cards', ' reveal', ' truth', '.', ' Listen', ' closely', '.', ' '];
    for (const token of tokens) {
      buffer.push(token);
    }

    expect(onSentence).toHaveBeenCalledTimes(2);
    expect(onSentence).toHaveBeenNthCalledWith(1, 'The cards reveal truth.');
    expect(onSentence).toHaveBeenNthCalledWith(2, 'Listen closely.');
  });
});
