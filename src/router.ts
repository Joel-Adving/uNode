import { Middleware } from './types'

/**
 * Router class for defining and handling routes and middleware.
 *
 * This class allows you to define routes and middleware for various HTTP methods.
 * It provides methods to add routes for GET, POST, PATCH, PUT, and DELETE requests.
 *
 * @example
 * // Creating and using a router
 * import { Router } from './path/to/your/module';
 * import { App } from '@oki.gg/unode';
 *
 * const app = new App()
 * const groupRoute = new Router()
 *
 * app.group('/api', groupRoute)
 *
 * const groupRoute
 *   .get('', (req, res) => {
 *     res.send('Hello, World!')
 *   })
 *   .get('/:id', (req, res) => {
 *     const id = req.getParameter(0)
 *     res.send(`Received ID: ${id}`)
 *   })
 *   .post('', async (req, res) => {
 *     const body = await req.parseBody()
 *     res.json(body)
 *   })
 *
 * app.listen(3000, () => {
 *   console.log('Server is running on port 3000');
 * });
 */
export class Router {
  routes: { method: string; path: string; handler: Middleware }[] = []
  middlewares: Middleware[] = []

  private addRoute(method: string, path: string, handler: Middleware) {
    this.routes.push({ method, path, handler })
  }

  use(handler: Middleware) {
    this.middlewares.push(handler)
    return this
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
