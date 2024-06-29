import 'dotenv/config'
import path from 'path'
import { env } from './env'
import { fileURLToPath } from 'url'
import { serveStatic } from './utils/file'
import { middleware } from './middleware'
import { usersHandler } from './handlers/usersHandler'
import { todosHandler } from './handlers/todosHandler'
import { App } from './app'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../')

new App()
  .use(middleware)
  .get('/*', serveStatic('public'))

  .get('/file', (req, res) => {
    res.sendFile(path.resolve(rootDir, 'public/image.webp'))
  })

  .group('/todos', todosHandler)
  .group('/users', usersHandler)

  .get('/stress-test', (req, res) => {
    res.send('Stress test')
  })

  .listen(env.port, () => {
    console.log(`Listening to port ${env.port}`)
  })
