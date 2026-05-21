import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDir = path.resolve(__dirname, '..', '..', 'docs');
const indexPath = path.join(docsDir, 'index.html');
const notFoundPath = path.join(docsDir, '404.html');
const noJekyllPath = path.join(docsDir, '.nojekyll');

await copyFile(indexPath, notFoundPath);
await writeFile(noJekyllPath, '');

console.log('GitHub Pages: 404.html et .nojekyll generes dans docs.');

