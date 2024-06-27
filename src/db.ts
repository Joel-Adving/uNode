import Database from 'better-sqlite3'

export const db = new Database('./data/database.db')
db.pragma('journal_mode = WAL')
migrateDb()

function migrateDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `)
}

const createUserPrepared = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
export function createUser(username: string, password: string) {
  createUserPrepared.run(username, password)
}

const getUserByUsernamePrepared = db.prepare('SELECT * FROM users WHERE username = ?')
export function getUserByUsername(username: string) {
  return getUserByUsernamePrepared.get(username)
}

const getUsersPrepared = db.prepare('SELECT * FROM users')
export function getUsers() {
  return getUsersPrepared.all()
}
