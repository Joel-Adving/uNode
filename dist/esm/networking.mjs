/**
 * Get the IP address of the client making the request.
 *
 * This function retrieves the IP address of the client by checking the `x-forwarded-for` and `remote-addr` headers.
 * If these headers are not present, it falls back to using the remote address provided by the `uWebSockets.js` response object.
 *
 * @example
 * ```typescript
 * import { App } from '@oki.gg/unode';
 * import { getIpAddress } from './path/to/your/module.mjs';
 *
 * const app = new App();
 *
 * app.get('/ip', (req, res) => {
 *   const ipAddress = getIpAddress(req, res);
 *   res.end(`Your IP address is: ${ipAddress}`);
 * });
 *
 * app.listen(3000, () => {
 *   console.log('Server is running on port 3000');
 * });
 * ```
 */
export function getIpAddress(req, res) {
    const xForwardedFor = req.getHeader('x-forwarded-for');
    if (xForwardedFor) {
        return xForwardedFor.split(',')[0].trim();
    }
    const remoteAddress = req.getHeader('remote-addr');
    if (remoteAddress) {
        return remoteAddress;
    }
    const remoteAddr = new Uint8Array(res.getRemoteAddressAsText());
    const ipAddress = String.fromCharCode.apply(null, remoteAddr);
    if (ipAddress === '::1' || ipAddress === '0000:0000:0000:0000:0000:0000:0000:0001') {
        return '127.0.0.1';
    }
    // If it is an IPv4 mapped address, convert to IPv4 format
    if (ipAddress.includes('::ffff:')) {
        return ipAddress.split('::ffff:')[1];
    }
    return ipAddress;
}
