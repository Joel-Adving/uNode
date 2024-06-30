import { serveStatic, getFileStats, sendFile } from './utils/file'
import { App, Router } from './app'
import { getIpAddress } from './utils/networking'
import { type Middleware, type ILogger, type Request, type Response, type IApp } from './types'

export default App

export { App, serveStatic, getFileStats, sendFile, getIpAddress, Router, IApp, ILogger, Middleware, Request, Response }
