import { Middleware } from './types';
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
export declare class Router {
    routes: {
        method: string;
        path: string;
        handler: Middleware;
    }[];
    middlewares: Middleware[];
    private addRoute;
    use(handler: Middleware): this;
    get(path: string, handler: Middleware): this;
    post(path: string, handler: Middleware): this;
    patch(path: string, handler: Middleware): this;
    put(path: string, handler: Middleware): this;
    delete(path: string, handler: Middleware): this;
}
