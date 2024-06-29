import Database from 'better-sqlite3'
import { migrateDb } from './migrations'

export const db = new Database('./data/database.db')
db.pragma('journal_mode = WAL')

migrateDb()
