import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('index.html is self-contained for direct local opening', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /<style[^>]*data-embedded-style/);
  assert.match(html, /<script>\s*\/\* embedded app bundle \*\//);
  assert.doesNotMatch(html, /<link[^>]+href=["']\.\/styles\.css/);
  assert.doesNotMatch(html, /<script[^>]+type=["']module["'][^>]+src=["']\.\/app\.js/);
  assert.match(html, /const questions = \[/);
  assert.match(html, /function scoreAssessment\(/);
});
