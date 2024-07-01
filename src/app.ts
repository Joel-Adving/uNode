import uWS, { us_listen_socket } from 'uWebSockets.js'
import { cpus } from 'os'
import cluster from 'cluster'
import { Router } from './router'
import { sendFile } from './file'
import { getCookie, getQueryParams, isAsyncFunction, parseBody, setCookie } from './utils'
import { HttpMethod, IApp, ILogger, Middleware, Request, Response } from './types'

/**
 *
 * Main uNode class that provides methods for setting up HTTP routes, middleware, and WebSocket behavior.
 *
 * @example
 * import { App } from '@oki.gg/unode'
 *
 * const app = new App({ threads: 4 })
 *
 * app.get('/', () => 'Hello, World!')
 *
 * app.listen(3000)
 */
export class App {
  app: IApp
  logger: ILogger
  middlewares: Middleware[] = []
  #threads: number

  constructor({ logger, threads }: { logger?: ILogger; threads?: number } = {}) {
    this.app = uWS.App() as IApp
    this.logger = logger || console
    this.#threads = threads || 1

    if (Number(threads) > cpus().length) {
      throw new Error(
        `Threads count cannot be higher than the number of current CPU threads. Max allowed number of threads: ${
          cpus().length
        }`
      )
    }
  }

  private handleRequest(
    method: HttpMethod,
    path: string,
    handler: (req: Request, res: Response) => void | Promise<void>,
    paramKeys: string[] = []
  ) {
    ;(this.app[method] as (path: string, handler: (res: Response, req: Request) => void) => void).call(
      this.app,
      path,
      (res, req) => {
        const isAsync = isAsyncFunction(handler)
        // Add custom properties and methods to the request and response objects
        this.patchRequestResponse(req, res, paramKeys, isAsync)
        try {
          // Execute middlewares before the route handler
          this.executeMiddlewares(req, res, this.middlewares, () => {
            if (isAsync) {
              ;(async () => {
                const returnValue = await handler(req, res)
                this.handleReturn(returnValue, res)
              })()
            } else {
              const returnValue = handler(req, res)
              this.handleReturn(returnValue, res)
            }
          })
        } catch (error) {
          // Global error handler
          this.logger.error(error)
          if (!res.done) {
            res.writeStatus('500 Internal Server Error').end('Internal Server Error')
          }
        }
      }
    )
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

  private handleReturn(value: any, res: Response) {
    if (!res.done) {
      if (typeof value === 'string') {
        res.end(value)
      }
      if (typeof value === 'object') {
        res.json(value)
      }
    }
  }

  private extractKeysFromPath(path: string): string[] {
    const keys: string[] = []
    const segments = path.split('/')
    for (const segment of segments) {
      if (segment.startsWith(':')) {
        keys.push(segment.substring(1))
      }
    }
    return keys
  }

  private extractParams(req: Request, paramKeys: string[]): { [key: string]: string } {
    const params: { [key: string]: string } = {}
    paramKeys.forEach((key, index) => {
      params[key] = req.getParameter(index)
    })
    return params
  }

  private patchRequestResponse(req: Request, res: Response, paramKeys: string[], isAsync: boolean) {
    res._end = res.end
    res.end = (body) => {
      if (res.done) {
        return res
      }
      res.done = true
      if (isAsync) {
        return res.cork(() => {
          res._end(body)
        })
      }
      return res._end(body)
    }

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

    res.send = (body) => res.end(body)

    res.status = (code) => {
      res.writeStatus(String(code))
      return res
    }

    res.header = (key, value) => {
      res.writeHeader(key, value)
      return res
    }

    res.json = (body) => {
      if (isAsync) {
        return res.cork(() => {
          res.writeHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        })
      }
      res.writeHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    }

    const ifModifiedSince = req.getHeader('if-modified-since')

    res.sendFile = (filePath) => {
      if (isAsync) {
        return res.cork(() => {
          sendFile(ifModifiedSince, res, filePath)
        })
      }
      sendFile(ifModifiedSince, res, filePath)
    }

    res.setCookie = (name, value, options) => {
      setCookie(res, name, value, options)
    }

    req.body = async <T>() => parseBody<T>(res)

    req.getCookie = (name: string) => getCookie(req, res, name)

    req.getQueryParams = () => getQueryParams(req)

    if (paramKeys.length > 0) {
      req.params = this.extractParams(req, paramKeys)
    }
  }

  group(path: string, router: Router) {
    router.routes.forEach((route) => {
      this.handleRequest(
        route.method as HttpMethod,
        path + route.path,
        (req, res) => {
          this.executeMiddlewares(req, res, router.middlewares, () => {
            const result = route.handler(req, res, () => {})
            if (typeof result === 'string' && !res.done) {
              res.end(result)
            }
          })
        },
        route.paramKeys
      )
    })
    return this
  }

  use(handler: Middleware) {
    this.middlewares.push(handler)
    return this
  }

  get(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('get', path, handler, this.extractKeysFromPath(path))
    return this
  }

  post(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('post', path, handler, this.extractKeysFromPath(path))
    return this
  }

  patch(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('patch', path, handler, this.extractKeysFromPath(path))
    return this
  }

  put(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('put', path, handler, this.extractKeysFromPath(path))
    return this
  }

  delete(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('del', path, handler, this.extractKeysFromPath(path))
    return this
  }

  options(path: string, handler: (req: Request, res: Response) => void) {
    this.handleRequest('options', path, handler, this.extractKeysFromPath(path))
  }

  websocket(pattern: uWS.RecognizedString, behavior: uWS.WebSocketBehavior<unknown>) {
    this.app.ws(pattern, behavior)
  }

  listen(port: number, cb?: (listenSocket: us_listen_socket) => void) {
    if (this.#threads > 1 && cluster.isPrimary) {
      console.log(`Master ${process.pid} is running`)

      for (let i = 0; i < this.#threads; i++) {
        cluster.fork()
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`Process  ${worker.process.pid} died`)
        if (!worker.exitedAfterDisconnect) {
          console.log('Starting a new process')
          cluster.fork()
        }
      })

      const shutdown = () => {
        console.log('Master is shutting down')
        for (const id in cluster.workers) {
          console.log(`Killing process ${id}`)
          cluster?.workers[id]!.kill('SIGTERM')
        }
        process.exit(0)
      }

      process.on('SIGTERM', shutdown)
      process.on('SIGINT', shutdown)
    } else {
      if (this.#threads > 1) {
        console.log(`Process ${process.pid} started`)
        process.on('SIGTERM', () => {
          console.log(`Process ${process.pid} shutting down`)
          this.app.close()
          process.exit(0)
        })
      }
      this.app.listen(port, (listenSocket) => {
        if (!listenSocket) {
          throw new Error('Failed to listen to port')
        }
        cb ? cb(listenSocket) : this.logger.log(`Server is running on port ${port}`)
      })
    }
  }

  close() {
    this.app.close()
  }
}
