/**
 * Router class for defining and handling group routes.
 *
 * This class allows you to define routes and middleware for various HTTP methods.
 * It provides methods to add routes for GET, POST, PATCH, PUT, and DELETE requests.
 *
 * @example
 * import { App, Router } from '@oki.gg/unode';
 *
 * const apiv2 = new Router()
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
 * const app = new App()
 *
 * app.group('/api/v2', apiv2)
 *
 * app.listen(3000, () => {
 *   console.log('Server is running on port 3000');
 * });
 */
export class Router {
    constructor() {
        this.routes = [];
        this.middlewares = [];
    }
    addRoute(method, path, handler) {
        this.routes.push({ method, path, handler });
    }
    use(handler) {
        this.middlewares.push(handler);
        return this;
    }
    get(path, handler) {
        this.addRoute('get', path, handler);
        return this;
    }
    post(path, handler) {
        this.addRoute('post', path, handler);
        return this;
    }
    patch(path, handler) {
        this.addRoute('patch', path, handler);
        return this;
    }
    put(path, handler) {
        this.addRoute('put', path, handler);
        return this;
    }
    delete(path, handler) {
        this.addRoute('del', path, handler);
        return this;
    }
}
