import { Router } from '../app'
import { todosDb } from '../db/queries'

export const todosHandler = new Router()
  .use((req, res, next) => {
    console.log('Todos middleware')
    next()
  })

  .get('', (req, res) => {
    const todos = todosDb.getTodos()
    res.json(todos)
  })

  .post('', async (req, res) => {
    const body = await req.body<{ title: string }>()

    if (!body.title) {
      return res.status(400).send('Required field missing')
    }

    const todo = todosDb.getTodoByTitle(body.title)
    if (todo) {
      return res.status(400).send('Todo with that title already exists')
    }

    const newTodo = todosDb.createTodo(body.title)
    res.json(newTodo)
  })

  .put('/:id', async (req, res) => {
    const id = parseInt(req.getParameter(0))
    const body = await req.body<{ completed: boolean }>()
    const todo = body.completed ? todosDb.completeTodo(id) : todosDb.uncompleteTodo(id)
    res.json(todo)
  })

  .delete('/:id', (req, res) => {
    const id = req.getParameter(0)
    todosDb.deleteTodo(parseInt(id))
    const todos = todosDb.getTodos()
    res.json(todos)
  })
