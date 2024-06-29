import { Router } from '../app'
import { usersDb } from '../db/queries'

export const usersHandler = new Router()
  .use((req, res, next) => {
    console.log('Users middleware')
    next()
  })

  .get('', (req, res) => {
    const users = usersDb.getUsers()
    res.json(users)
  })

  .post('', async (req, res) => {
    const body = await req.body<{ username: string; password: string }>()
    if (!body.username || !body.password) {
      return res.status(400).send('Username or password missing')
    }
    const user = usersDb.getUserByUsername(body.username)
    if (user) {
      return res.status(400).send('User already exists')
    }
    usersDb.createUser(body.username, body.password)
    res.send('User created')
  })
