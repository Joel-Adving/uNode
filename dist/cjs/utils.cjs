"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBody = parseBody;
exports.getCookie = getCookie;
exports.setCookie = setCookie;
exports.getQueryParams = getQueryParams;
/**
 * Parse the JSON body of the request.
 *
 * This function reads and parses the JSON body of the incoming request. It returns a promise that resolves with the parsed body.
 * If the request is aborted, the promise is rejected with an error.
 *
 * Can be used as a standalone function or added as a method on the `req` object.
 *
 * @example
 * app.post('/data', async (req, res) => {
 *   try {
 *     const body = await parseBody<{ key: string }>(res);
 *     res.json(body);
 *   } catch (error) {
 *     res.status(400).send(error.message);
 *   }
 * });
 *
 * // Alternatively, you can use the `req` object to access the `parseBody` method
 * app.post('/other-data', async (req, res) => {
 *   try {
 *     const body = await req.parseBody<{ key: string }>();
 *     res.json(body);
 *   } catch (error) {
 *     res.status(400).send(error.message);
 *   }
 * });
 */
function parseBody(res) {
    return new Promise((resolve, reject) => {
        let buffer;
        res.onData((chunk, isLast) => {
            if (res.done) {
                reject(new Error('Request aborted'));
                return;
            }
            const curBuf = Buffer.from(chunk);
            buffer = buffer ? Buffer.concat([buffer, curBuf]) : isLast ? curBuf : Buffer.concat([curBuf]);
            if (isLast) {
                resolve(JSON.parse(buffer.toString()));
            }
        });
        res.onAborted(() => {
            reject(new Error('Request aborted'));
        });
    });
}
/**
 * Get the value of a cookie from the request.
 *
 * This function retrieves the value of a specified cookie from the request headers.
 * It caches the cookies on the response object for efficient subsequent lookups.
 *
 * Can be used as a standalone function or added as a method on the `req` object.

 * @example
 * // Using getCookie as a standalone function
 * app.get('/cookie', (req, res) => {
 *   const cookieValue = getCookie(req, res, 'cookieName');
 *   res.send(`Cookie Value: ${cookieValue}`);
 * });
 *
 * // Alternatively, you can use the `req` object to access the `getCookie` method
 * app.get('/cookie', (req, res) => {
 *   const cookieValue = req.getCookie('cookieName');
 *   res.send(`Cookie Value: ${cookieValue}`);
 * });
 */
function getCookie(req, res, name) {
    var _a, _b, _c;
    (_a = res.cookies) !== null && _a !== void 0 ? _a : (res.cookies = req.getHeader('cookie'));
    return (res.cookies &&
        ((_c = res.cookies.match(
        // @ts-ignore
        ((_b = getCookie[name]) !== null && _b !== void 0 ? _b : (getCookie[name] = new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`))))) === null || _c === void 0 ? void 0 : _c[2]));
}
function setCookie(res, name, value, options = {}) {
    const { maxAge, path = '/', domain, isSecure = false, isHttpOnly = true, sameSite = 'Lax' } = options;
    let cookie = `${name}=${value}`;
    if (maxAge) {
        cookie += `; Max-Age=${maxAge}`;
    }
    if (path) {
        cookie += `; Path=${path}`;
    }
    if (domain) {
        cookie += `; Domain=${domain}`;
    }
    if (isSecure) {
        cookie += '; Secure';
    }
    if (isHttpOnly) {
        cookie += '; HttpOnly';
    }
    if (sameSite) {
        cookie += `; SameSite=${sameSite}`;
    }
    res.writeHeader('Set-Cookie', cookie);
}
function getQueryParams(req) {
    const searchParams = new URLSearchParams(req.getQuery());
    const params = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}
