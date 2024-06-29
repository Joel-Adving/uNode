import { HttpRequest, HttpResponse } from 'uWebSockets.js'

export function getIpAddress(req: HttpRequest, res: HttpResponse) {
  const xForwardedFor = req.getHeader('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  const remoteAddress = req.getHeader('remote-addr')
  if (remoteAddress) {
    return remoteAddress
  }

  const remoteAddr = new Uint8Array(res.getRemoteAddressAsText()) as unknown as number[]
  const ipAddress = String.fromCharCode.apply(null, remoteAddr)

  if (ipAddress === '::1' || ipAddress === '0000:0000:0000:0000:0000:0000:0000:0001') {
    return '127.0.0.1'
  }

  // If it is an IPv4 mapped address, convert to IPv4 format
  if (ipAddress.includes('::ffff:')) {
    return ipAddress.split('::ffff:')[1]
  }

  return ipAddress
}
