import { Request, Response } from './types'

export function middleware(req: Request, res: Response, next: () => void) {
  // console.log(
  //   `${req.getMethod().toUpperCase()}: ${req.getUrl()} -> ${getIpAddress(req, res)} - ${req.getHeader('user-agent')}`
  // )
  next()
}
