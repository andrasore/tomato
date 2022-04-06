import * as os from 'node:os'
import * as path from 'node:path'
import Database from 'better-sqlite3'
import fs from 'fs-extra'

const DB_DIR = path.join(os.homedir(), '.local', 'tomato')
const DB_NAME = 'db.sqlite3'

interface Db {
  db: Database.Database
  insertWork: Database.Statement
  queryWorksToday: Database.Statement
}

export function createDb (): Db {
  fs.ensureDirSync(DB_DIR)
  const sqliteDb = new Database(path.join(DB_DIR, DB_NAME))

  sqliteDb.exec('CREATE TABLE IF NOT EXISTS WORK (workDate TEXT, workMins REAL)')

  return {
    db: sqliteDb,
    insertWork: sqliteDb.prepare("INSERT INTO WORK (workDate, workMins) values (date('now'), ?)"),
    queryWorksToday: sqliteDb.prepare("SELECT * FROM WORK WHERE workDate = date('now')")
  }
}
