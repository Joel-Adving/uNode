import { HttpResponse, HttpRequest } from 'uWebSockets.js';
/**
 * Serve static files from a specified directory.
 *
 * @example
 * ```typescript
 * const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.');
 *
 * app.get('/*', serveStatic(path.resolve(rootDir, 'public')));
 * ```
 */
export declare function serveStatic(dir: string): (req: HttpRequest, res: HttpResponse) => any;
/**
 * Get the file statistics for a given file path.
 * @example
 * ```typescript
 * const fileStats = getFileStats('/path/to/file.txt');
 * if (fileStats) {
 *   console.log(`File Size: ${fileStats.size}`);
 *   console.log(`Content Type: ${fileStats.contentType}`);
 *   console.log(`Last Modified: ${fileStats.lastModified}`);
 * } else {
 *   console.log('File does not exist or is a directory');
 * }
 * ```
 */
export declare function getFileStats(filePath: string): {
    filePath: string;
    lastModified: string;
    size: number;
    contentType: string;
} | undefined;
/**
 * Stream a file to the HTTP response.
 *
 * This function streams a file to the HTTP response using a read stream. It handles backpressure,
 * ensures efficient data transfer, and manages errors and clean-up.
 *
 * @example
 * ```typescript
 * app.get('/file', (req, res) => {
 *   const fileStats = getFileStats('/path/to/file.txt');
 *   if (fileStats) {
 *     streamFile(res, fileStats);
 *   } else {
 *     res.writeStatus('404').end('File not found');
 *   }
 * });
 * ```
 */
export declare function streamFile(res: HttpResponse, fileStats: ReturnType<typeof getFileStats>): HttpResponse | undefined;
/**
 * Send a file in the HTTP response.
 *
 * This function sends a file in the HTTP response. It sets appropriate headers such as `Content-Type` and `Last-Modified`,
 * and handles conditional requests using the `If-Modified-Since` header.
 *
 * @example
 * ```typescript
 * app.get('/file', (req, res) => {
 *   sendFile(req, res, '/path/to/file.txt');
 * });
 *
 * // Alternatively, you can use it directly on the response object:
 * app.get('/file-2', (req, res) => {
 *  res.sendFile('/path/to/file.txt');
 * });
 * ```
 */
export declare function sendFile(headers: Record<string, string>, res: HttpResponse, filePath: string): HttpResponse | undefined;
