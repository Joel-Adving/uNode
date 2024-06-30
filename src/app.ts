import uWS, { us_listen_socket } from 'uWebSockets.js'
import { sendFile } from './file'
import { HttpMethod, IApp, ILogger, Middleware, Request, Response } from './types'
import { getCookie, parseBody } from './utils'
import { Router } from './router'

/**
 *
 * This class provides methods for setting up HTTP routes, middleware, and WebSocket behavior.
 *
 * @example
 * import { App } from '@oki.gg/unode';
 *
 * const app = new App();
 *
 * app.get('/', (req, res) => {
 *   res.send('Hello, World!');
 * });
 *
 * app.listen(3000, () => {
 *   console.log('Server is running on port 3000');
 * });
 */
export class App {
  app: IApp
  logger: ILogger
  middlewares: Middleware[] = []

  constructor({ logger }: { logger?: ILogger } = {}) {
    this.app = uWS.App() as IApp
    this.logger = logger || console
  }

  private handleRequest(method: HttpMethod, path: string, handler: (req: Request, res: Response) => void) {
    ;(this.app[method] as (path: string, handler: (res: Response, req: Request) => void) => void).call(
      this.app,
      path,
      (res, req) => {
        res.cork(() => {
          this.patchRequestResponse(req, res)
          try {
            this.executeMiddlewares(req, res, this.middlewares, () => handler(req, res))
          } catch (error) {
            this.logger.error(error)
            if (!res.done) {
              res.writeStatus('500 Internal Server Error').end('Internal Server Error')
            }
          }
        })
      }
    )
  }

  private patchRequestResponse(req: Request, res: Response) {
    req.body = async <T>() => parseBody<T>(res)
    req.getCookie = (name: string) => getCookie(req, res, name)

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
        this.logger.warn('uWS DEBUG: Called end after done')
        return res
      }
      res.done = true
      res._end(body)
      return res
    }

    res.send = (body) => {
      res.end(body)
    }

    res.status = (code) => {
      res.writeStatus(String(code))
      return res
    }

    res.header = (key, value) => {
      res.writeHeader(key, value)
      return res
    }

    res.json = (body) => {
      res.writeHeader('Content-Type', 'application/json')
      try {
        res.end(JSON.stringify(body))
      } catch (error) {
        throw new Error('Failed to stringify JSON', { cause: error })
      }
    }

    res.sendFile = (filePath) => sendFile(req, res, filePath)
  }

  private executeMiddlewares(req: Request, res: Response, handlers: Middleware[], finalHandler: () => void) {
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

  get(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('get', path, handler)
    return this
  }

  post(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('post', path, handler)
    return this
  }

  patch(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('patch', path, handler)
    return this
  }

  put(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('put', path, handler)
    return this
  }

  delete(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('del', path, handler)
    return this
  }

  options(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('options', path, handler)
  }

  websocket(pattern: uWS.RecognizedString, behavior: uWS.WebSocketBehavior<unknown>) {
    this.app.ws(pattern, behavior)
  }

  group(path: string, router: Router) {
    router.routes.forEach((route) => {
      this.handleRequest(route.method as HttpMethod, path + route.path, (req, res) => {
        this.executeMiddlewares(req, res, router.middlewares, () => route.handler(req, res, () => {}))
      })
    })
    return this
  }

  listen(port: number, cb?: (listenSocket: us_listen_socket) => void) {
    this.app.listen(port, (token) => {
      if (token) {
        if (cb) {
          cb(token)
        } else {
          this.logger.log(`Server is running on port ${port}`)
        }
      } else {
        throw new Error('Failed to listen to port')
      }
    })
  }

  close() {
    this.app.close()
  }
}
