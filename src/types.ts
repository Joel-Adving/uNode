import { HttpRequest, HttpResponse, TemplatedApp } from 'uWebSockets.js'

export type Middleware = (req: Request, res: Response, next: () => void) => void
export type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'del' | 'options'
export type SetCookieOptions = {
  maxAge?: number
  path?: string
  domain?: string
  isSecure?: boolean
  isHttpOnly?: boolean
  sameSite?: 'Lax' | 'Strict' | 'None'
}

export interface ILogger {
  log: (message: unknown) => void
  error: (message: unknown) => void
  warn: (message: unknown) => void
  info: (message: unknown) => void
}

export interface Request extends HttpRequest {
  body: <T>() => Promise<T>
  getCookie: (name: string) => string
  getQueryParams: () => { [key: string]: string }
  params: { [key: string]: string }
}

export interface Response extends HttpResponse {
  done: boolean
  abortEvents: (() => void)[]
  send: (body: string) => void
  json: (body: unknown) => void
  status: (code: number) => Response
  header: (key: string, value: string) => Response
  sendFile: (filePath: string) => void
  setCookie: (name: string, value: string, options?: SetCookieOptions) => void
}

export interface IApp extends TemplatedApp {
  get: (path: string, handler: (res: Response, req: Request) => void) => TemplatedApp
  post: (path: string, handler: (res: Response, req: Request) => void) => TemplatedApp
  patch: (path: string, handler: (res: Response, req: Request) => void) => TemplatedApp
  put: (path: string, handler: (res: Response, req: Request) => void) => TemplatedApp
  delete: (path: string, handler: (res: Response, req: Request) => void) => TemplatedApp
  options: (path: string, handler: (res: Response, req: Request) => void) => TemplatedApp
}
