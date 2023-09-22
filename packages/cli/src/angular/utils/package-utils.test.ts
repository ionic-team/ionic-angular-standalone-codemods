import { afterEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

import { getActualPackageVersion } from './package-utils';

vi.mock('node:fs');
vi.mock('node:fs/promises');

describe('getActualPackageVersion', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  })

  it('should return null if package is not installed', async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const actual = await getActualPackageVersion('invalidDir', '@ionic/angular');

    expect(actual).toBeNull();
  });

  it('should return null if package.json cannot be read', async () => {
    vi.mocked(existsSync).mockResolvedValue(true);
    vi.mocked(readFile).mockRejectedValue(new Error('Invalid JSON'));

    const actual = await getActualPackageVersion('validDir', '@ionic/angular');

    expect(actual).toBeNull();
  });

  it('should return the package version', async () => {
    vi.mocked(existsSync).mockResolvedValue(true);
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ version: '1.0.0' }));

    const actual = await getActualPackageVersion('validDir', '@ionic/angular');

    expect(actual).toBe('1.0.0');
  });

});