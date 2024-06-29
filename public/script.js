/**
 * @typedef {Object} Todo
 * @property {number} id - The unique identifier for the todo item.
 * @property {string} title - The title of the todo item.
 * @property {number} completed - The completion status of the todo item.
 */

/** @returns {Promise<Todo[]>} */
async function getTodos() {
  const todos = await fetch('/todos').then((res) => res.json())
  return todos
}

/** @param {string} id*/
function toggleTodo(id) {
  const completed = document.getElementById(`todo-${id}`)?.getAttribute('data-completed') === 'true'
  fetch(`/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !completed })
  })
    .then((res) => res.json())
    .then(async (updatedTodo) => {
      if (updatedTodo) {
        const todos = await getTodos()
        const todoList = document.querySelector('#todo-list')
        if (todoList) {
          todoList.innerHTML = todos.map(todoTempalte).join('')
        }
      }
    })
    .catch((error) => {
      console.error('Failed to update todo: ', error)
    })
}

/** @param {string} id*/
function deleteDoto(id) {
  fetch(`/todos/${id}`, { method: 'DELETE' })
    .then((res) => res.json())
    .then(async (deletedTodo) => {
      if (deletedTodo) {
        const todos = await getTodos()
        const todoList = document.querySelector('#todo-list')
        if (todoList) {
          todoList.innerHTML = todos.map(todoTempalte).join('')
        }
      }
    })
    .catch((error) => {
      console.error('Failed to delete todo: ', error)
    })
}

window.addEventListener('DOMContentLoaded', async () => {
  const todosForm = document.querySelector('#todo-form')
  const todoList = document.querySelector('#todo-list')

  const todos = await getTodos()
  if (todos && todoList) {
    todos.forEach((todo) => {
      todoList.innerHTML += todoTempalte(todo)
    })
  }

  /** * @param {any} event*/
  async function handleSubmitTodo(event) {
    event.preventDefault()

    if (!event.target) {
      return
    }

    const formData = new FormData(event.target)
    const todoInput = formData.get('todo-input')
    event.target.reset()

    if (!todoInput) {
      return
    }

    const todo = await fetch('/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: todoInput })
    }).then((res) => res.json())

    if (!todo) {
      console.error('Failed to create todo: ', todo)
      return
    }

    if (todoList) {
      todoList.innerHTML += todoTempalte(todo)
    }
  }

  todosForm?.addEventListener('submit', handleSubmitTodo)
})

/** @param {Todo} todo*/
function todoTempalte(todo) {
  const comleted = todo.completed === 1 ? true : false
  return `<div
            id="todo-${todo.id}" 
            data-completed="${comleted}"
            style="display: flex; gap: 1rem; cursor: pointer;"
          >
            <div 
              onclick="toggleTodo(${todo.id})" 
              style="text-decoration: ${comleted ? 'line-through' : 'none'};"
            > 
              ${todo.title} ${comleted ? '✅' : ''}
            </div>
            <button onclick="deleteDoto(${todo.id})" style="cursor: pointer;">Delete</button>
          </div>`
}
