// Zero-dependency static + real-time Band Sync SSE server for TenorSaxSongs
// Usage: node server.js (defaults to port 8790)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8790;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

// Active SSE clients by room: Map<room, Set<res>>
const rooms = new Map();
// Latest state per room so late joiners sync immediately
const roomState = new Map();

function broadcastToRoom(room, payload) {
  const clients = rooms.get(room);
  if (!clients) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    try {
      res.write(data);
    } catch {
      clients.delete(res);
    }
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // CORS for cross-origin or tunnel requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. SSE Stream endpoint: GET /api/sync/stream?room=JOY
  if (url.pathname === '/api/sync/stream' && req.method === 'GET') {
    const room = (url.searchParams.get('room') || 'JOY').toUpperCase();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    if (!rooms.has(room)) rooms.set(room, new Set());
    const clientSet = rooms.get(room);
    clientSet.add(res);

    // Send initial connection + peer count + last known state
    res.write(`data: ${JSON.stringify({ type: 'hello', serverTime: Date.now(), peers: clientSet.size, state: roomState.get(room) || null })}\n\n`);
    broadcastToRoom(room, { type: 'peers', peers: clientSet.size, serverTime: Date.now() });

    req.on('close', () => {
      clientSet.delete(res);
      broadcastToRoom(room, { type: 'peers', peers: clientSet.size, serverTime: Date.now() });
    });
    return;
  }

  // 2. Broadcast Command endpoint: POST /api/sync/command
  if (url.pathname === '/api/sync/command' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const msg = JSON.parse(body || '{}');
        const room = (msg.room || 'JOY').toUpperCase();
        const payload = { ...msg, room, serverTime: Date.now() };
        roomState.set(room, payload);
        broadcastToRoom(room, payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, serverTime: payload.serverTime }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // 3. Static file server
  let reqPath = decodeURIComponent(url.pathname);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  const safePath = path.normalize(path.join(ROOT, reqPath));
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath, (err, stat) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    if (stat.isDirectory()) {
      res.writeHead(302, { Location: url.pathname + '/' + url.search });
      res.end();
      return;
    }
    const ext = path.extname(safePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TenorSaxSongs + Band Sync Server running at http://127.0.0.1:${PORT}`);
});
