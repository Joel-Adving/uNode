import 'dotenv/config'
import { env } from './env'
import { serveStatic } from './utils/static'
import { middleware } from './middleware'
import { App } from './app'
import { usersHandler } from './handlers/usersHandler'
import { todosHandler } from './handlers/todosHandler'

const app = new App()
  .use(middleware)
  .get('/*', serveStatic('public'))
  .group('/todos', todosHandler)
  .group('/users', usersHandler)
  .listen(env.port, () => {
    console.log(`Listening to port ${env.port}`)
  })
