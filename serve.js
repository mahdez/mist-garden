// Runs the game locally at http://localhost:8766 (start with: node serve.js)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8766;
const GAME = path.join(__dirname, 'mist-garden.html');
const HEAD = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}</style></head><body>';

http.createServer((req, res) => {
  if (req.url !== '/') {
    res.statusCode = 404;
    return res.end();
  }
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(HEAD + fs.readFileSync(GAME, 'utf8') + '</body></html>');
}).listen(PORT, '127.0.0.1', () => console.log(`http://localhost:${PORT}`));
