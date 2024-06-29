import { HttpRequest, HttpResponse } from 'uWebSockets.js'
import { Router } from '../app'
import { todosDb } from '../db/queries'
import { parseBody } from '../utils/uws-utils'

export const todosHandler = new Router()
  .use(todosMiddleware)
  .get('', (req, res) => {
    const todos = todosDb.getTodos()
    res.end(JSON.stringify(todos))
  })
  .post('', async (req, res) => {
    const body = await parseBody<{ title: string }>(res)
    if (!body.title) {
      return res.writeStatus('400').end('Required field missing')
    }
    const todo = todosDb.getTodoByTitle(body.title)
    if (todo) {
      return res.writeStatus('400').end('Todo with that title already exists')
    }
    const newTodo = todosDb.createTodo(body.title)
    res.end(JSON.stringify(newTodo))
  })
  .put('/:id', async (req, res) => {
    const id = parseInt(req.getParameter(0))
    const body = await parseBody<{ completed: boolean }>(res)
    const todo = body.completed ? todosDb.completeTodo(id) : todosDb.uncompleteTodo(id)
    res.end(JSON.stringify(todo))
  })
  .delete('/:id', async (req, res) => {
    const id = req.getParameter(0)
    todosDb.deleteTodo(parseInt(id))
    const todos = todosDb.getTodos()
    res.end(JSON.stringify(todos))
  })

function todosMiddleware(req: HttpRequest, res: HttpResponse, next: () => void) {
  console.log('Todos middleware')
  next()
}
