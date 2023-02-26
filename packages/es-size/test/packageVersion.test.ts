import { describe, test } from 'vitest';
import { getNodeModulesFolderPath } from '../src/packageVersion';

describe('Test packageVersion functions', () => {
  test('getNodeModulePath', () => {
    const result = getNodeModulesFolderPath(__filename);
    console.log('result:', result);
  });
});