import { mkdir, copyFile, readFile, access, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const html = await readFile('index.html', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs');
if ((html.match(/<h1\b/g) || []).length !== 1) throw new Error('Expected one H1');
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.includes(id)) throw new Error(`Missing anchor: ${id}`);
}
for (const [, path] of html.matchAll(/(?:src|href)="((?:assets|styles|main)[^"]+)"/g)) await access(path);
await mkdir('dist/assets/optimized', { recursive: true });
for (const file of ['index.html', 'styles.css', 'main.js']) await copyFile(file, join('dist', file));
await copyFile('assets/logo.png', 'dist/assets/logo.png');
for (const file of await readdir('assets/optimized')) await copyFile(join('assets/optimized', file), join('dist/assets/optimized', file));
console.log('Production build successful. Anchors and asset references verified. Output: dist/');
