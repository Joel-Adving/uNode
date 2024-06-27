import 'dotenv/config'
import { env } from './env'
import { App, parseBody } from './utils/uWSUtils'
import { createUser, getUserByUsername, getUsers } from './db'

const app = new App()

app.use((req, res, next) => {
  console.log('Middleware')
  next()
})

app.get('/', (req, res) => {
  res.end('Hello World')
})

app.get('/users', (req, res) => {
  const users = getUsers()
  res.end(JSON.stringify(users))
})

app.post('/users', async (req, res) => {
  const body = await parseBody<{ username: string; password: string }>(res)
  if (!body.username || !body.password) {
    return res.writeStatus('400 Bad Request').end('Username or password missing')
  }
  const user = getUserByUsername(body.username)
  if (user) {
    return res.writeStatus('400 Bad Request').end('User already exists')
  }
  createUser(body.username, body.password)
  res.end('User created')
})

app.get('/*', (req, res) => {
  res.end('404 Not Found')
})

app.listen(env.port, () => {
  console.log(`Listening to port ${env.port}`)
})
