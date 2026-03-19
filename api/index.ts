import type { IncomingMessage, ServerResponse } from 'node:http';
import { handle } from '../src/gateway';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  void handle(req, res);
}
