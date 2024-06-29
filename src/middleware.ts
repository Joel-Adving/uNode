import { HttpRequest, HttpResponse } from 'uWebSockets.js'
import { getIpAddress } from './utils/networking'

export function middleware(req: HttpRequest, res: HttpResponse, next: () => void) {
  console.log(
    `${req.getMethod().toUpperCase()}: ${req.getUrl()} -> ${getIpAddress(req, res)} - ${req.getHeader('user-agent')}`
  )
  next()
}
