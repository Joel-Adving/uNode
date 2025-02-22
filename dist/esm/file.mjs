import path from 'path';
import { lookup } from 'mrmime';
import { createReadStream, lstatSync } from 'fs';
import { Writable } from 'stream';
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
export function serveStatic(dir) {
    return (req, res) => {
        try {
            const url = req.getUrl().slice(1) || 'index.html';
            const filePath = path.resolve(dir, url);
            const isFileOutsideDir = filePath.indexOf(path.resolve(dir)) !== 0;
            if (isFileOutsideDir) {
                return res.writeStatus('403').res.end();
            }
            const fileStats = getFileStats(filePath);
            if (!fileStats) {
                return res.writeStatus('404').end();
            }
            const { contentType, lastModified } = fileStats;
            const ifModifiedSince = req.getHeader('if-modified-since');
            if (ifModifiedSince === lastModified) {
                return res.writeStatus('304').res.end();
            }
            res.writeHeader('Content-Type', contentType);
            res.writeHeader('Last-Modified', lastModified);
            streamFile(res, fileStats);
        }
        catch (error) {
            res.writeStatus('500').end();
        }
    };
}
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
export function getFileStats(filePath) {
    const stats = lstatSync(filePath, { throwIfNoEntry: false });
    if (!stats || stats.isDirectory()) {
        return;
    }
    const fileExtension = path.extname(filePath);
    const contentType = lookup(fileExtension) || 'application/octet-stream';
    const { mtime, size } = stats;
    const lastModified = mtime.toUTCString();
    return { filePath, lastModified, size, contentType };
}
function toArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
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
export function streamFile(res, fileStats) {
    const filePath = fileStats === null || fileStats === void 0 ? void 0 : fileStats.filePath;
    const size = fileStats === null || fileStats === void 0 ? void 0 : fileStats.size;
    if (!filePath || !size) {
        return res.writeStatus('404').end('File not found');
    }
    const readStream = createReadStream(filePath);
    const destroyReadStream = () => {
        !readStream.destroyed && readStream.destroy();
    };
    const onError = (error) => {
        destroyReadStream();
        throw error;
    };
    const onDataChunk = (chunk) => {
        const arrayBufferChunk = toArrayBuffer(chunk);
        res.cork(() => {
            const lastOffset = res.getWriteOffset();
            const [ok, done] = res.tryEnd(arrayBufferChunk, size);
            if (!done && !ok) {
                readStream.pause();
                res.onWritable((offset) => {
                    const [ok, done] = res.tryEnd(arrayBufferChunk.slice(offset - lastOffset), size);
                    if (!done && ok) {
                        readStream.resume();
                    }
                    return ok;
                });
            }
        });
    };
    res.onAborted(destroyReadStream);
    readStream.on('data', onDataChunk).on('error', onError).on('end', destroyReadStream);
}
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
export function sendFile(ifModifiedSince, res, filePath) {
    const fileStats = getFileStats(filePath);
    if (!fileStats) {
        return res.writeStatus('404').end('File not found');
    }
    const { contentType, lastModified } = fileStats;
    if (ifModifiedSince === lastModified) {
        return res.writeStatus('304').end();
    }
    res.writeHeader('Content-Type', contentType);
    res.writeHeader('Last-Modified', lastModified);
    streamFile(res, fileStats);
}
export class uNodeWritable extends Writable {
    constructor(res) {
        super();
        this.res = res;
    }
    _write(chunk, encoding, callback) {
        if (this.res.done) {
            callback();
            return;
        }
        this.res.cork(() => {
            if (this.res.done) {
                callback();
                return;
            }
            const arrayBufferChunk = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
            const [ok, done] = this.res.tryEnd(arrayBufferChunk, chunk.byteLength);
            if (done) {
                this.res.done = true;
                this.res.end();
                callback();
            }
            else if (!ok) {
                // @ts-ignore
                this.res.onWritable((offset) => {
                    this.res.cork(() => {
                        if (this.res.done) {
                            callback();
                            return false;
                        }
                        const [ok, done] = this.res.tryEnd(arrayBufferChunk.slice(offset), chunk.byteLength);
                        if (done) {
                            this.res.done = true;
                            this.res.end();
                        }
                        callback();
                        return ok;
                    });
                });
            }
            else {
                callback();
            }
        });
    }
    _final(callback) {
        if (!this.res.done) {
            this.res.cork(() => {
                if (!this.res.done) {
                    this.res.end();
                    this.res.done = true;
                }
                callback();
            });
        }
        else {
            callback();
        }
    }
}
