var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import uWS from 'uWebSockets.js';
import { sendFile } from './file.mjs';
import { getCookie, parseBody } from './utils.mjs';
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
    constructor({ logger } = {}) {
        this.middlewares = [];
        this.app = uWS.App();
        this.logger = logger || console;
    }
    handleRequest(method, path, handler) {
        ;
        this.app[method].call(this.app, path, (res, req) => {
            res.cork(() => {
                this.patchRequestResponse(req, res);
                try {
                    this.executeMiddlewares(req, res, this.middlewares, () => {
                        const result = handler(req, res);
                        if (typeof result === 'string' && !res.done) {
                            res.end(result);
                        }
                    });
                }
                catch (error) {
                    this.logger.error(error);
                    if (!res.done) {
                        res.writeStatus('500 Internal Server Error').end('Internal Server Error');
                    }
                }
            });
        });
    }
    patchRequestResponse(req, res) {
        req.body = () => __awaiter(this, void 0, void 0, function* () { return parseBody(res); });
        req.getCookie = (name) => getCookie(req, res, name);
        res._end = res.end;
        res.onAborted(() => {
            res.done = true;
            if (res.abortEvents) {
                res.abortEvents.forEach((f) => f());
            }
        });
        res.onAborted = (handler) => {
            res.abortEvents = res.abortEvents || [];
            res.abortEvents.push(handler);
            return res;
        };
        res.end = (body) => {
            if (res.done) {
                this.logger.warn('uWS DEBUG: Called end after done');
                return res;
            }
            res.done = true;
            res._end(body);
            return res;
        };
        res.send = (body) => {
            res.end(body);
        };
        res.status = (code) => {
            res.writeStatus(String(code));
            return res;
        };
        res.header = (key, value) => {
            res.writeHeader(key, value);
            return res;
        };
        res.json = (body) => {
            res.writeHeader('Content-Type', 'application/json');
            try {
                res.end(JSON.stringify(body));
            }
            catch (error) {
                throw new Error('Failed to stringify JSON', { cause: error });
            }
        };
        res.sendFile = (filePath) => sendFile(req, res, filePath);
    }
    executeMiddlewares(req, res, handlers, finalHandler) {
        const next = (index) => {
            if (index < handlers.length) {
                handlers[index](req, res, () => next(index + 1));
            }
            else {
                finalHandler();
            }
        };
        next(0);
    }
    use(handler) {
        this.middlewares.push(handler);
        return this;
    }
    get(path, handler) {
        this.handleRequest('get', path, handler);
        return this;
    }
    post(path, handler) {
        this.handleRequest('post', path, handler);
        return this;
    }
    patch(path, handler) {
        this.handleRequest('patch', path, handler);
        return this;
    }
    put(path, handler) {
        this.handleRequest('put', path, handler);
        return this;
    }
    delete(path, handler) {
        this.handleRequest('del', path, handler);
        return this;
    }
    options(path, handler) {
        this.handleRequest('options', path, handler);
    }
    websocket(pattern, behavior) {
        this.app.ws(pattern, behavior);
    }
    group(path, router) {
        router.routes.forEach((route) => {
            this.handleRequest(route.method, path + route.path, (req, res) => {
                this.executeMiddlewares(req, res, router.middlewares, () => route.handler(req, res, () => { }));
            });
        });
        return this;
    }
    listen(port, cb) {
        this.app.listen(port, (token) => {
            if (token) {
                if (cb) {
                    cb(token);
                }
                else {
                    this.logger.log(`Server is running on port ${port}`);
                }
            }
            else {
                throw new Error('Failed to listen to port');
            }
        });
    }
    close() {
        this.app.close();
    }
}
