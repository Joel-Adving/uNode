import { serveStatic, getFileStats, sendFile } from './utils/file'
import { App, Router } from './app'
import { getIpAddress } from './utils/networking'
import { type Middleware, type HttpMethod, type ILogger, type Request, type Response, type IApp } from './types'

export default App

export {
  Router,
  serveStatic,
  getFileStats,
  sendFile,
  getIpAddress,
  Middleware,
  HttpMethod,
  ILogger,
  Request,
  Response,
  IApp
}
