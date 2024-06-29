import { db } from './client'

const getUsersPrepared = db.prepare('SELECT * FROM users')
const createUserPrepared = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
const getUserByUsernamePrepared = db.prepare('SELECT * FROM users WHERE username = ?')

function getUsers() {
  return getUsersPrepared.all()
}

function createUser(username: string, password: string) {
  createUserPrepared.run(username, password)
}

function getUserByUsername(username: string) {
  return getUserByUsernamePrepared.get(username)
}

export const usersDb = {
  getUsers,
  createUser,
  getUserByUsername
}

const getTodosPrepared = db.prepare('SELECT * FROM todos')
const createTodoPrepared = db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?) RETURNING *')
const completeTodoPrepared = db.prepare('UPDATE todos SET completed = 1 WHERE id = ? RETURNING *')
const uncompleteTodoPrepared = db.prepare('UPDATE todos SET completed = 0 WHERE id = ? RETURNING *')
const deleteTodoPrepared = db.prepare('DELETE FROM todos WHERE id = ?')
const getTodoByTitlePrepared = db.prepare('SELECT * FROM todos WHERE title = ?')
const getTodoByIdPrepared = db.prepare('SELECT * FROM todos WHERE id = ?')

function getTodos() {
  return getTodosPrepared.all()
}

function createTodo(title: string) {
  const newTodo = createTodoPrepared.run(title, 0)
  return getTodoByIdPrepared.get(newTodo.lastInsertRowid)
}

function completeTodo(id: number) {
  completeTodoPrepared.run(id)
  return getTodoByIdPrepared.get(id)
}

function uncompleteTodo(id: number) {
  uncompleteTodoPrepared.run(id)
  return getTodoByIdPrepared.get(id)
}

function deleteTodo(id: number) {
  deleteTodoPrepared.run(id)
}

function getTodoByTitle(title: string) {
  return getTodoByTitlePrepared.get(title)
}

export const todosDb = {
  getTodoByTitle,
  getTodos,
  createTodo,
  completeTodo,
  uncompleteTodo,
  deleteTodo
}
