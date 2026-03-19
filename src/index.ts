import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { handle } from './gateway.js';

const PORT = Number(process.env.PORT || 8080);
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  void handle(req, res);
});

server.listen(PORT, () => {
  console.log(`yuryo-contents server listening on http://localhost:${PORT}`);
  console.log('Payable endpoint: GET/POST /api/celebrate');
});
