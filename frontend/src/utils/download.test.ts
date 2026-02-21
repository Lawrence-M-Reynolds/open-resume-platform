import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadBlob } from './download';

describe('downloadBlob', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:mock-url'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: originalCreateObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: originalRevokeObjectURL,
    });
  });

  it('creates an object url, triggers download, and revokes the url', () => {
    const clickSpy = vi.fn();
    const anchor = {
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement;
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(anchor);
    const blob = new Blob(['hello world'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    downloadBlob(blob, 'resume.docx');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(anchor.href).toBe('blob:mock-url');
    expect(anchor.download).toBe('resume.docx');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
