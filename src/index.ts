import http from 'node:http';
import { handle } from './gateway';

const PORT = Number(process.env.PORT || 8080);
const server = http.createServer((req, res) => {
  void handle(req, res);
});

server.listen(PORT, () => {
  console.log(`yuryo-contents server listening on http://localhost:${PORT}`);
  console.log('Payable endpoint: GET/POST /api/celebrate');
});
