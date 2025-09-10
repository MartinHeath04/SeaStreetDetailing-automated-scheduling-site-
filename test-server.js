const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Basic Node.js Server Works!</h1>');
});

server.listen(3009, '0.0.0.0', () => {
  console.log('Server running on http://localhost:3009');
});