import path from 'path'
import { lookup } from 'mrmime'
import { createReadStream, lstatSync, Stats } from 'fs'
import { HttpResponse, HttpRequest } from 'uWebSockets.js'
import { fileURLToPath } from 'url'

export function serveStatic(dir: string) {
  return (req: HttpRequest, res: HttpResponse) => {
    try {
      const _dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../', dir)
      const url = req.getUrl().slice(1) || 'index.html'
      const filePath = path.resolve(_dir, url)
      const isFileOutsideDir = filePath.indexOf(path.resolve(_dir)) !== 0

      if (isFileOutsideDir) {
        return res.writeStatus('403').res.end()
      }

      const fileStats = getFileStats(filePath)

      if (!fileStats) {
        return res.writeStatus('404').end()
      }

      const { contentType, lastModified } = fileStats
      const ifModifiedSince = req.getHeader('if-modified-since')

      if (ifModifiedSince === lastModified) {
        return res.writeStatus('304').res.end()
      }

      res.writeHeader('Content-Type', contentType)
      res.writeHeader('Last-Modified', lastModified)

      streamFile(res, fileStats)
    } catch (error: any) {
      res.writeStatus('500').end()
    }
  }
}

function getFileStats(filePath: string) {
  const stats: Stats | undefined = lstatSync(filePath, { throwIfNoEntry: false })

  if (!stats || stats.isDirectory()) {
    return
  }

  const fileExtension = path.extname(filePath)
  const contentType = lookup(fileExtension) || 'application/octet-stream'
  const { mtime, size } = stats
  const lastModified = mtime.toUTCString()

  return { filePath, lastModified, size, contentType }
}

function toArrayBuffer(buffer: Buffer) {
  const { buffer: arrayBuffer, byteOffset, byteLength } = buffer
  return arrayBuffer.slice(byteOffset, byteOffset + byteLength)
}

function streamFile(res: HttpResponse, fileStats: ReturnType<typeof getFileStats>) {
  const filePath = fileStats?.filePath
  const size = fileStats?.size

  if (!filePath || !size) {
    return res.writeStatus('404').end('File not found')
  }

  const readStream = createReadStream(filePath)
  function destroyReadStream() {
    !readStream.destroyed && readStream.destroy()
  }

  function onError(error: Error) {
    destroyReadStream()
    throw error
  }

  function onDataChunk(chunk: Buffer) {
    const arrayBufferChunk = toArrayBuffer(chunk)

    res.cork(() => {
      const lastOffset = res.getWriteOffset()
      const [ok, done] = res.tryEnd(arrayBufferChunk, size!)

      if (!done && !ok) {
        readStream.pause()

        res.onWritable((offset) => {
          const [ok, done] = res.tryEnd(arrayBufferChunk.slice(offset - lastOffset), size!)

          if (!done && ok) {
            readStream.resume()
          }

          return ok
        })
      }
    })
  }

  res.onAborted(destroyReadStream)
  readStream.on('data', onDataChunk).on('error', onError).on('end', destroyReadStream)
}
