import type { IncomingMessage, ServerResponse } from 'node:http'
import app from '../server/index.ts'

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/', 'http://localhost')
  const path = url.searchParams.get('__path') || ''
  url.searchParams.delete('__path')
  req.url = `/api/${path}${url.search}`
  return app(req, res)
}
