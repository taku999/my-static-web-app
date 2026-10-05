import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import createConfig from './vite.config.mjs';

test('preserves the API proxy and deployment output directory', () => {
  const config = createConfig({ mode: 'test' });
  expect(config.server.host).toBe('127.0.0.1');
  expect(config.server.proxy['/api'].target).toBe('http://localhost:7071');
  expect(config.build.outDir).toBe('build');
});

test('transforms JSX in existing JavaScript source files', async () => {
  const config = createConfig({ mode: 'test' });
  const plugin = config.plugins.find((entry) => entry.name === 'jsx-in-js');
  const result = await plugin.transform('export default <div>Products</div>;', '/src/App.js');
  expect(result.code).toContain('react/jsx-runtime');
  expect(result.code).not.toContain('<div>');
  expect(await plugin.transform('export default 1;', '/node_modules/example.js')).toBeNull();
});

test('includes the existing hosting configuration in the build', () => {
  const config = createConfig({ mode: 'test' });
  const plugin = config.plugins.find((entry) => entry.name === 'hosting-config');
  const assets = [];
  plugin.generateBundle.call({ emitFile: (asset) => assets.push(asset) });
  expect(assets[0].fileName).toBe('staticwebapp.config.json');
  expect(assets[0].source).toEqual(
    readFileSync(new URL('./staticwebapp.config.json', import.meta.url)),
  );
});