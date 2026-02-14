const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3003, '0.0.0.0', () => {
  console.log('[Bot Service Health] Health check server running on port 3003');
});

module.exports = server;