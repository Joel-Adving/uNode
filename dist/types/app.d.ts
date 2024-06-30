import uWS, { us_listen_socket } from 'uWebSockets.js';
import { IApp, ILogger, Middleware, Request, Response } from './types';
import { Router } from './router';
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
export declare class App {
    app: IApp;
    logger: ILogger;
    middlewares: Middleware[];
    constructor({ logger }?: {
        logger?: ILogger;
    });
    private handleRequest;
    private patchRequestResponse;
    private executeMiddlewares;
    use(handler: Middleware): this;
    get(path: string, handler: (req: Request, res: Response) => void): this;
    post(path: string, handler: (req: Request, res: Response) => void): this;
    patch(path: string, handler: (req: Request, res: Response) => void): this;
    put(path: string, handler: (req: Request, res: Response) => void): this;
    delete(path: string, handler: (req: Request, res: Response) => void): this;
    options(path: string, handler: (req: Request, res: Response) => void): void;
    websocket(pattern: uWS.RecognizedString, behavior: uWS.WebSocketBehavior<unknown>): void;
    group(path: string, router: Router): this;
    listen(port: number, cb?: (listenSocket: us_listen_socket) => void): void;
    close(): void;
}
