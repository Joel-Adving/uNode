import uWS, { us_listen_socket } from 'uWebSockets.js';
import { Router } from './router';
import { IApp, ILogger, Middleware, Request, Response } from './types';
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
export declare class App {
    #private;
    app: IApp;
    logger: ILogger;
    middlewares: Middleware[];
    constructor({ logger, threads }?: {
        logger?: ILogger;
        threads?: number;
    });
    private handleRequest;
    private patchRequestResponse;
    private executeMiddlewares;
    group(path: string, router: Router): this;
    use(handler: Middleware): this;
    get(path: string, handler: (req: Request, res: Response) => void): this;
    post(path: string, handler: (req: Request, res: Response) => void): this;
    patch(path: string, handler: (req: Request, res: Response) => void): this;
    put(path: string, handler: (req: Request, res: Response) => void): this;
    delete(path: string, handler: (req: Request, res: Response) => void): this;
    options(path: string, handler: (req: Request, res: Response) => void): void;
    websocket(pattern: uWS.RecognizedString, behavior: uWS.WebSocketBehavior<unknown>): void;
    listen(port: number, cb?: (listenSocket: us_listen_socket) => void): void;
    close(): void;
}
