import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDir = path.resolve(__dirname, '..', '..', 'docs');
const port = 8123;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  try {
    const rawUrl = req.url ?? '/';
    if (!rawUrl.startsWith('/planning')) {
      res.writeHead(302, { Location: '/planning/' });
      res.end();
      return;
    }

    let relativePath = rawUrl.replace(/^\/planning\/?/, '');
    if (!relativePath || rawUrl.endsWith('/')) {
      relativePath = 'index.html';
    }

    const fsPath = path.resolve(docsDir, relativePath.split('?')[0]);
    let filePath = fsPath;
    try {
      const data = await readFile(filePath);
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': contentTypes[ext] ?? 'application/octet-stream' });
      res.end(data);
    } catch {
      const fallback = await readFile(path.join(docsDir, '404.html'));
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fallback);
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(String(error));
  }
});

server.listen(port, () => {
  console.log(`Local Pages check server running at http://localhost:${port}/planning/`);
});

