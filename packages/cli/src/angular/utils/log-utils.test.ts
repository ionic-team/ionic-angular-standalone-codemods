import { saveFileChanges } from './log-utils';

import { describe, expect, it, vi } from 'vitest';

describe('saveFileChanges', () => {

  it('should not save changes if dryRun is true', async () => {
    const sourceFile: any = {
      getFilePath: () => 'foo.ts',
      getFullText: () => 'foo',
      save: vi.fn()
    };
    const cliOptions = {
      dryRun: true,
    };

    await saveFileChanges(sourceFile, cliOptions);

    expect(sourceFile.save).not.toHaveBeenCalled();
  });

  it('should save changes if dryRun is false', async () => {
    const sourceFile: any = {
      save: vi.fn()
    };
    const cliOptions = {
      dryRun: false,
    };

    await saveFileChanges(sourceFile, cliOptions);

    expect(sourceFile.save).toHaveBeenCalled();
  });

});