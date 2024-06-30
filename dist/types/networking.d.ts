import { Request, Response } from './types';
/**
 * Get the IP address of the client making the request.
 *
 * This function retrieves the IP address of the client by checking the `x-forwarded-for` and `remote-addr` headers.
 * If these headers are not present, it falls back to using the remote address provided by the `uWebSockets.js` response object.
 *
 * @example
 * ```typescript
 * const app = new App();
 *
 * app.get('/ip', (req, res) => {
 *   const ipAddress = getIpAddress(req, res);
 *   res.end(`Your IP address is: ${ipAddress}`);
 * });
 *
 * app.listen(3000);
 * ```
 */
export declare function getIpAddress(req: Request, res: Response): string;
