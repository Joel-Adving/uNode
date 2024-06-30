import { HttpRequest, HttpResponse } from 'uWebSockets.js';
/**
 * Parse the JSON body of the request.
 *
 * This function reads and parses the JSON body of the incoming request. It returns a promise that resolves with the parsed body.
 * If the request is aborted, the promise is rejected with an error.
 *
 * Can be used as a standalone function or added as a method on the `req` object.
 *
 * @example
 * // Using parseBody as a standalone function
 * import { App } from '@oki.gg/unode';
 * import { parseBody } from './path/to/your/module';
 *
 * const app = new App();
 *
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
 *
 * app.post('/other-data', async (req, res) => {
 *   try {
 *     const body = await req.parseBody<{ key: string }>();
 *     res.json(body);
 *   } catch (error) {
 *     res.status(400).send(error.message);
 *   }
 * });
 *
 * app.listen(3000, () => {
 *   console.log('Server is running on port 3000');
 * });
 */
export declare function parseBody<T>(res: HttpResponse): Promise<T>;
/**
 * Get the value of a cookie from the request.
 *
 * This function retrieves the value of a specified cookie from the request headers.
 * It caches the cookies on the response object for efficient subsequent lookups.
 *
 * Can be used as a standalone function or added as a method on the `req` object.

 * @example
 * // Using getCookie as a standalone function
 * import { App } from '@oki.gg/unode';
 * import { getCookie } from './path/to/your/module';
 *
 * const app = new App();
 *
 * app.get('/cookie', (req, res) => {
 *   const cookieValue = getCookie(req, res, 'cookieName');
 *   res.send(`Cookie Value: ${cookieValue}`);
 * });
 *
 * // Alternatively, you can use the `req` object to access the `getCookie` method
 *
 * app.get('/cookie', (req, res) => {
 *   const cookieValue = req.getCookie('cookieName');
 *   res.send(`Cookie Value: ${cookieValue}`);
 * });
 *
 * app.listen(3000, () => {
 *   console.log('Server is running on port 3000');
 * });

 */
export declare function getCookie(req: HttpRequest, res: HttpResponse, name: string): string;
