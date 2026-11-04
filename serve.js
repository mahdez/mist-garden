// Runs the game locally at http://localhost:8766 (start with: node serve.js)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8766;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(__dirname, urlPath === '/' ? 'index.html' : path.normalize(urlPath));
  const type = TYPES[path.extname(file)];
  if (!type || !file.startsWith(__dirname + path.sep)) {
    res.statusCode = 404;
    return res.end();
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.statusCode = 404;
      return res.end();
    }
    res.setHeader('content-type', type);
    res.setHeader('cache-control', 'no-store');
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`http://localhost:${PORT}`));
