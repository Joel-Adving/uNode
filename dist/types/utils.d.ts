import { Response, Request, SetCookieOptions } from './types';
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
export declare function parseBody<T>(res: Response): Promise<T>;
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
export declare function getCookie(req: Request, res: Response, name: string): string;
export declare function setCookie(res: Response, name: string, value: string, options?: SetCookieOptions): void;
export declare function getQueryParams(req: Request): {
    [key: string]: string;
};
