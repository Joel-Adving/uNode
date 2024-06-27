import uWS, { TemplatedApp, us_listen_socket } from 'uWebSockets.js'
import { HttpRequest, HttpResponse } from 'uWebSockets.js'

type Middleware = (req: HttpRequest, res: HttpResponse, next: () => void) => void

export class App {
  app: TemplatedApp
  middlewares: Middleware[] = []

  constructor() {
    this.app = uWS.App()
  }

  use(handler: Middleware) {
    this.middlewares.push(handler)
  }

  private executeMiddlewares(req: HttpRequest, res: HttpResponse, handlers: Middleware[], finalHandler: () => void) {
    const next = (index: number) => {
      if (index < handlers.length) {
        handlers[index](req, res, () => next(index + 1))
      } else {
        finalHandler()
      }
    }
    next(0)
  }

  private handleRequest(
    method: (path: string, handler: (res: HttpResponse, req: HttpRequest) => void) => void,
    path: string,
    handler: (req: HttpRequest, res: HttpResponse) => void
  ) {
    method.call(this.app, path, (res, req) => {
      patchRes(res)
      this.executeMiddlewares(req, res, this.middlewares, () => {
        handler(req, res)
      })
    })
  }

  get(path: string, handler: (req: HttpRequest, res: HttpResponse) => void) {
    this.handleRequest(this.app.get, path, handler)
  }

  post(path: string, handler: (req: HttpRequest, res: HttpResponse) => void) {
    this.handleRequest(this.app.post, path, handler)
  }

  patch(path: string, handler: (req: HttpRequest, res: HttpResponse) => void) {
    this.handleRequest(this.app.patch, path, handler)
  }

  put(path: string, handler: (req: HttpRequest, res: HttpResponse) => void) {
    this.handleRequest(this.app.put, path, handler)
  }

  delete(path: string, handler: (req: HttpRequest, res: HttpResponse) => void) {
    this.handleRequest(this.app.del, path, handler)
  }

  listen(port: number, cb: (listenSocket: us_listen_socket) => void) {
    this.app.listen(port, (token) => {
      if (token) {
        cb(token)
      } else {
        throw new Error('Failed to listen to port')
      }
    })
  }

  close() {
    this.app.close()
  }
}

export function patchRes(res: HttpResponse) {
  res._end = res.end

  res.onAborted(() => {
    res.done = true
    if (res.abortEvents) {
      res.abortEvents.forEach((f: () => void) => f())
    }
  })

  res.onAborted = (handler) => {
    res.abortEvents = res.abortEvents || []
    res.abortEvents.push(handler)
    return res
  }

  res.end = (body) => {
    if (res.done) {
      console.log(`uWS DEBUG: Called end after done`)
      return res
    }
    res.done = true
    res.cork(() => {
      res._end(body)
    })
    return res
  }
}

export function handleAsync(handler: (res: HttpResponse, req: HttpRequest, next?: () => void) => Promise<void> | void) {
  return async (res: HttpResponse, req: HttpRequest, next?: () => void) => {
    patchRes(res)
    try {
      await handler(res, req, next)
      if (!res.done && !next) {
        throw new Error('Async handler did not respond')
      }
    } catch (e) {
      if (!res.done) {
        res.writeStatus('500 Internal Server Error').end()
      }
      console.error(e)
    }
  }
}

export function parseBody<T>(res: HttpResponse): Promise<T> {
  return new Promise((resolve, reject) => {
    let buffer: Buffer
    res.onData((chunk, isLast) => {
      if (res.done) {
        reject(new Error('Request aborted'))
        return
      }
      const curBuf = Buffer.from(chunk)
      buffer = buffer ? Buffer.concat([buffer, curBuf]) : isLast ? curBuf : Buffer.concat([curBuf])
      if (isLast) {
        resolve(JSON.parse(buffer.toString()) as T)
      }
    })

    res.onAborted(() => {
      reject(new Error('Request aborted'))
    })
  })
}
