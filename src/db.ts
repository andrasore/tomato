import * as os from 'node:os'
import * as path from 'node:path'
import Database from 'better-sqlite3'
import fs from 'fs-extra'

const DB_DIR = path.join(os.homedir(), '.local', 'tomato')
const DB_NAME = 'db.sqlite3'

interface Db {
  insertWork: (workMins: number) => void
  queryWorkMinsToday: () => Record<number, number>
  queryWorkTimeToday: () => number
}

export function createDb (): Db {
  fs.ensureDirSync(DB_DIR)
  const sqliteDb = new Database(path.join(DB_DIR, DB_NAME))

  sqliteDb.exec('CREATE TABLE IF NOT EXISTS WORK (workDate TEXT, workMins REAL)')

  const insertWorkStmt = sqliteDb.prepare("INSERT INTO WORK (workDate, workMins) values (date('now'), ?)")
  const queryWorksTodayStmt = sqliteDb.prepare("SELECT workMins, COUNT(workMins) FROM WORK WHERE workDate = date('now') GROUP BY workMins")
  const queryWorkMinsTodayStmt = sqliteDb.prepare("SELECT SUM(workMins) FROM WORK WHERE workDate = date('now')")

  return {
    insertWork (workMins: number) {
      return insertWorkStmt.run(workMins)
    },
    queryWorkMinsToday () {
      const workMins = queryWorksTodayStmt.all()
      const result: Record<number, number> = {}
      for (const elem of workMins) {
        result[elem.workMins] = elem['COUNT(workMins)']
      }
      return result
    },
    queryWorkTimeToday () {
      return queryWorkMinsTodayStmt.all()[0]['SUM(workMins)']
    }
  }
}
