import { HttpResponse } from 'uWebSockets.js'

export function parseBody<T>(res: HttpResponse): Promise<T> {
  return new Promise((resolve, reject) => {
    let buffer: Buffer

    res.onData((chunk, isLast) => {
      if (res.done) {
        reject(new Error('Request aborted'))
        return
      }

      const curBuf = Buffer.from(chunk)
      buffer = buffer ? Buffer.concat([buffer, curBuf]) : isLast ? curBuf : Buffer.concat([curBuf])

      if (isLast) {
        resolve(JSON.parse(buffer.toString()) as T)
      }
    })

    res.onAborted(() => {
      reject(new Error('Request aborted'))
    })
  })
}