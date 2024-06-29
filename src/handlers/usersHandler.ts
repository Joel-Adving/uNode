import { HttpRequest, HttpResponse } from 'uWebSockets.js'
import { Router } from '../app'
import { usersDb } from '../db/queries'
import { parseBody } from '../utils/uws-utils'

export const usersHandler = new Router()
  .use(userMiddleware)
  .get('', (req, res) => {
    const users = usersDb.getUsers()
    res.end(JSON.stringify(users))
  })
  .post('', async (req, res) => {
    const body = await parseBody<{ username: string; password: string }>(res)
    if (!body.username || !body.password) {
      return res.writeStatus('400').end('Username or password missing')
    }
    const user = usersDb.getUserByUsername(body.username)
    if (user) {
      return res.writeStatus('400').end('User already exists')
    }
    usersDb.createUser(body.username, body.password)
    res.end('User created')
  })

function userMiddleware(req: HttpRequest, res: HttpResponse, next: () => void) {
  console.log('User middleware')
  next()
}
