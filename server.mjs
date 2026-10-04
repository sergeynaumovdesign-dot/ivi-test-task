import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) throw new Error('Outside workspace');
    const details = await stat(file);
    if (!details.isFile()) throw new Error('Not a file');
    const headers = {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'Accept-Ranges': 'bytes',
    };
    const match = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range || '');
    let start = 0, end = details.size - 1, status = 200;
    if (match) {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), end) : end;
      if (start > end || start >= details.size) {
        response.writeHead(416, { ...headers, 'Content-Range': `bytes */${details.size}` });
        response.end();
        return;
      }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${details.size}`;
    }
    headers['Content-Length'] = String(end - start + 1);
    response.writeHead(status, headers);
    if (request.method === 'HEAD') response.end();
    else createReadStream(file, { start, end }).pipe(response);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(4173, '127.0.0.1', () => console.log('IVI Lab: http://127.0.0.1:4173'));
