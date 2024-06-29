import uWS, { TemplatedApp, us_listen_socket } from 'uWebSockets.js'
import { HttpRequest, HttpResponse } from 'uWebSockets.js'
import { sendFile } from './utils/file'
import { HttpMethod, IApp, ILogger, Middleware, Response } from './types'

export class App {
  app: IApp
  logger: ILogger
  middlewares: Middleware[] = []

  constructor({ logger }: { logger?: ILogger } = {}) {
    this.app = uWS.App() as IApp
    this.logger = logger || console
  }

  private handleRequest(
    method: HttpMethod,
    path: string,
    handler: (req: HttpRequest, res: Response) => void | Promise<void>
  ) {
    ;(this.app[method] as (path: string, handler: (res: Response, req: HttpRequest) => void) => void).call(
      this.app,
      path,
      (res, req) => {
        this.patchResponse(res, req)
        try {
          this.executeMiddlewares(req, res, this.middlewares, () => handler(req, res))
        } catch (error) {
          this.logger.log(error)
          if (!res.done) {
            res.writeStatus('500 Internal Server Error').end('Internal Server Error')
          }
        }
      }
    )
  }

  private patchResponse(res: Response, req: HttpRequest) {
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

    res.send = (body) => {
      res.end(body)
    }

    res.json = (body) => {
      res.writeHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    }

    res.status = (code) => {
      res.writeStatus(String(code))
      return res
    }

    res.header = (key, value) => {
      res.writeHeader(key, value)
      return res
    }

    res.sendFile = (filePath) => sendFile(req, res, filePath)
  }

  private executeMiddlewares(
    req: HttpRequest,
    res: HttpResponse,
    handlers: Middleware[],
    finalHandler: () => void | Promise<void>
  ) {
    const next = (index: number) => {
      if (index < handlers.length) {
        handlers[index](req, res, () => next(index + 1))
      } else {
        finalHandler()
      }
    }
    next(0)
  }

  use(handler: Middleware) {
    this.middlewares.push(handler)
    return this
  }

  options(path: string, handler: (req: HttpRequest, res: Response) => void) {
    this.handleRequest('options', path, handler)
  }

  websocket(pattern: uWS.RecognizedString, behavior: uWS.WebSocketBehavior<unknown>) {
    this.app.ws(pattern, behavior)
  }

  get(path: string, handler: (req: HttpRequest, res: Response) => void) {
    this.handleRequest('get', path, handler)
    return this
  }

  post(path: string, handler: (req: HttpRequest, res: Response) => void) {
    this.handleRequest('post', path, handler)
    return this
  }

  patch(path: string, handler: (req: HttpRequest, res: Response) => void) {
    this.handleRequest('patch', path, handler)
    return this
  }

  put(path: string, handler: (req: HttpRequest, res: Response) => void) {
    this.handleRequest('put', path, handler)
    return this
  }

  delete(path: string, handler: (req: HttpRequest, res: Response) => void) {
    this.handleRequest('del', path, handler)
    return this
  }

  group(path: string, router: Router) {
    router.routes.forEach((route) => {
      this.handleRequest(route.method as HttpMethod, path + route.path, (req, res) => {
        this.executeMiddlewares(req, res, router.middlewares, () => route.handler(req, res, () => {}))
      })
    })
    return this
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

export class Router {
  routes: { method: string; path: string; handler: Middleware }[] = []
  middlewares: Middleware[] = []

  use(handler: Middleware) {
    this.middlewares.push(handler)
    return this
  }

  private addRoute(method: string, path: string, handler: Middleware) {
    this.routes.push({ method, path, handler })
  }

  get(path: string, handler: Middleware) {
    this.addRoute('get', path, handler)
    return this
  }

  post(path: string, handler: Middleware) {
    this.addRoute('post', path, handler)
    return this
  }

  patch(path: string, handler: Middleware) {
    this.addRoute('patch', path, handler)
    return this
  }

  put(path: string, handler: Middleware) {
    this.addRoute('put', path, handler)
    return this
  }

  delete(path: string, handler: Middleware) {
    this.addRoute('del', path, handler)
    return this
  }
}
