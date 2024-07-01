var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _App_threads;
import uWS from 'uWebSockets.js';
import { cpus } from 'os';
import cluster from 'cluster';
import { sendFile } from './file.mjs';
import { getCookie, getQueryParams, isAsyncFunction, parseBody, setCookie } from './utils.mjs';
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
    constructor({ logger, threads } = {}) {
        this.middlewares = [];
        _App_threads.set(this, void 0);
        this.app = uWS.App();
        this.logger = logger || console;
        __classPrivateFieldSet(this, _App_threads, threads || 1, "f");
        if (Number(threads) > cpus().length) {
            throw new Error(`Threads count cannot be higher than the number of current CPU threads. Max allowed number of threads: ${cpus().length}`);
        }
    }
    handleRequest(method, path, handler, paramKeys = []) {
        ;
        this.app[method].call(this.app, path, (res, req) => {
            const isAsync = isAsyncFunction(handler);
            // Add custom properties and methods to the request and response objects
            this.patchRequestResponse(req, res, paramKeys, isAsync);
            try {
                // Execute middlewares before the route handler
                this.executeMiddlewares(req, res, this.middlewares, () => {
                    if (isAsync) {
                        ;
                        (() => __awaiter(this, void 0, void 0, function* () {
                            const result = yield handler(req, res);
                            if (!res.done) {
                                res.cork(() => {
                                    if (typeof result === 'string') {
                                        res.end(result);
                                    }
                                    if (typeof result === 'object') {
                                        res.json(result);
                                    }
                                });
                            }
                        }))();
                    }
                    else {
                        const result = handler(req, res);
                        if (!res.done) {
                            if (typeof result === 'string') {
                                res.end(result);
                            }
                            if (typeof result === 'object') {
                                res.json(result);
                            }
                        }
                    }
                });
            }
            catch (error) {
                // Global error handler
                this.logger.error(error);
                if (!res.done) {
                    res.writeStatus('500 Internal Server Error').end('Internal Server Error');
                }
            }
        });
    }
    patchRequestResponse(req, res, paramKeys, isAsync) {
        res._end = res.end;
        res.end = (body) => {
            if (res.done) {
                this.logger.warn('uWS DEBUG: Called end after done');
                return res;
            }
            res.done = true;
            if (isAsync) {
                return res.cork(() => {
                    res._end(body);
                });
            }
            return res._end(body);
        };
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
        res.send = (body) => res.end(body);
        res.status = (code) => {
            res.writeStatus(String(code));
            return res;
        };
        res.header = (key, value) => {
            res.writeHeader(key, value);
            return res;
        };
        res.json = (body) => {
            if (isAsync) {
                return res.cork(() => {
                    res.writeHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(body));
                });
            }
            res.writeHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(body));
        };
        const ifModifiedSince = req.getHeader('if-modified-since');
        res.sendFile = (filePath) => {
            if (isAsync) {
                return res.cork(() => {
                    sendFile(ifModifiedSince, res, filePath);
                });
            }
            sendFile(ifModifiedSince, res, filePath);
        };
        res.setCookie = (name, value, options) => {
            setCookie(res, name, value, options);
        };
        req.body = () => __awaiter(this, void 0, void 0, function* () { return parseBody(res); });
        req.getCookie = (name) => getCookie(req, res, name);
        req.getQueryParams = () => getQueryParams(req);
        if (paramKeys.length > 0) {
            req.params = this.extractParams(req, paramKeys);
        }
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
    extractKeysFromPath(path) {
        const keys = [];
        const segments = path.split('/');
        for (const segment of segments) {
            if (segment.startsWith(':')) {
                keys.push(segment.substring(1));
            }
        }
        return keys;
    }
    extractParams(req, paramKeys) {
        const params = {};
        paramKeys.forEach((key, index) => {
            params[key] = req.getParameter(index);
        });
        return params;
    }
    group(path, router) {
        router.routes.forEach((route) => {
            this.handleRequest(route.method, path + route.path, (req, res) => {
                this.executeMiddlewares(req, res, router.middlewares, () => {
                    const result = route.handler(req, res, () => { });
                    if (typeof result === 'string' && !res.done) {
                        res.end(result);
                    }
                });
            }, route.paramKeys);
        });
        return this;
    }
    use(handler) {
        this.middlewares.push(handler);
        return this;
    }
    get(path, handler) {
        this.handleRequest('get', path, handler, this.extractKeysFromPath(path));
        return this;
    }
    post(path, handler) {
        this.handleRequest('post', path, handler, this.extractKeysFromPath(path));
        return this;
    }
    patch(path, handler) {
        this.handleRequest('patch', path, handler, this.extractKeysFromPath(path));
        return this;
    }
    put(path, handler) {
        this.handleRequest('put', path, handler, this.extractKeysFromPath(path));
        return this;
    }
    delete(path, handler) {
        this.handleRequest('del', path, handler, this.extractKeysFromPath(path));
        return this;
    }
    options(path, handler) {
        this.handleRequest('options', path, handler, this.extractKeysFromPath(path));
    }
    websocket(pattern, behavior) {
        this.app.ws(pattern, behavior);
    }
    listen(port, cb) {
        if (__classPrivateFieldGet(this, _App_threads, "f") > 1 && cluster.isPrimary) {
            console.log(`Master ${process.pid} is running`);
            for (let i = 0; i < __classPrivateFieldGet(this, _App_threads, "f"); i++) {
                cluster.fork();
            }
            cluster.on('exit', (worker, code, signal) => {
                console.log(`Process  ${worker.process.pid} died`);
                if (!worker.exitedAfterDisconnect) {
                    console.log('Starting a new process');
                    cluster.fork();
                }
            });
            const shutdown = () => {
                console.log('Master is shutting down');
                for (const id in cluster.workers) {
                    console.log(`Killing process ${id}`);
                    cluster === null || cluster === void 0 ? void 0 : cluster.workers[id].kill('SIGTERM');
                }
                process.exit(0);
            };
            process.on('SIGTERM', shutdown);
            process.on('SIGINT', shutdown);
        }
        else {
            if (__classPrivateFieldGet(this, _App_threads, "f") > 1) {
                console.log(`Process ${process.pid} started`);
                process.on('SIGTERM', () => {
                    console.log(`Process ${process.pid} shutting down`);
                    this.app.close();
                    process.exit(0);
                });
            }
            this.app.listen(port, (listenSocket) => {
                if (!listenSocket) {
                    throw new Error('Failed to listen to port');
                }
                cb ? cb(listenSocket) : this.logger.log(`Server is running on port ${port}`);
            });
        }
    }
    close() {
        this.app.close();
    }
}
_App_threads = new WeakMap();
