import notifier from 'node-notifier'
import { Command } from 'commander'
import { setTimeout as setTimeoutAsync } from 'node:timers/promises'
import * as packageJson from '../package.json'
import * as config from './config'
import { ticks } from './ticks'
import * as process from 'node:process'
import * as readline from 'node:readline'
import { createDb } from './db'

const rl = readline.createInterface({
  input: process.stdin, output: process.stdout, prompt: ''
})

const program = new Command()

program.name('tom')
  .version(packageJson.version)
  .description(packageJson.description)
  .option('-r, --recipe <name>', 'Recipe name to use', 'default')
  .option('--stats', 'Print today\'s stats')
  .addHelpText('after', `Example config (~/.tomrc.yml or ./.tomrc.yml):
${config.SAMPLE_CONFIG}
All recipe fields will default to the default recipe's values when not
defined.
`)

program.parse()

const db = createDb()

if (program.opts().stats as boolean) {
  printStats()
  process.exit()
}

run().catch(err => {
  console.error(err)
  process.exit(-1)
})

const TOMATO_UTF8 = '🍅'
const SHOOTING_STAR_UTF8 = '🌠'
const WRISTWATCH_UTF8 = '⌚'
const CHECKMARK_UTF8 = '✅'

async function run (): Promise<void> {
  const recipeName = program.opts().recipe as string
  const recipe = await config.getRecipe(recipeName)

  rl.write(`${TOMATO_UTF8} Starting recipe "${recipeName}"\n`)
  const finishTime = new Date(Date.now() + (recipe.workTime + recipe.breakTime) * recipe.repeat * 1000)
  rl.write(`${TOMATO_UTF8} Finish time will be ${finishTime.toLocaleTimeString()}\n`)

  for (const timerState of ticks(recipe)) {
    if (timerState.stage === 'work') {
      if (!timerState.isFirstTick) {
        rl.write(null, { ctrl: true, name: 'u' })
      }
      rl.write(`${WRISTWATCH_UTF8} Work stage ${timerState.repeat}, remaining time: ${printTime(timerState.remaining)}`)
      if (timerState.isLastTick) {
        rl.write(null, { ctrl: true, name: 'u' })
        rl.write(`${CHECKMARK_UTF8} Work stage ${timerState.repeat} finished.\n`)
        notifier.notify('Work finished!')
        db.insertWork(Math.floor(recipe.workTime / 60))
      }
    }
    if (timerState.stage === 'break') {
      if (!timerState.isFirstTick) {
        rl.write(null, { ctrl: true, name: 'u' })
      }
      rl.write(`${WRISTWATCH_UTF8} Break stage ${timerState.repeat}, remaining time: ${printTime(timerState.remaining)}`)
      if (timerState.isLastTick) {
        rl.write(null, { ctrl: true, name: 'u' })
        rl.write(`${CHECKMARK_UTF8} Break stage ${timerState.repeat} finished.\n`)
        notifier.notify('Break finished!')
      }
    }
    await setTimeoutAsync(1000)
  }

  rl.write(`${SHOOTING_STAR_UTF8} All pomodoros completed!\n`)
  printStats()
  rl.close()
}

function printTime (secs: number): string {
  return String(Math.floor(secs / 60)) + ':' + String(secs % 60).padStart(2, '0')
}

function printStats (): void {
  console.log(`${SHOOTING_STAR_UTF8} Work time was ${db.queryWorkTimeToday()} minutes.`)
  console.log(`${SHOOTING_STAR_UTF8} Work today:`)
  for (const [mins, count] of Object.entries(db.queryWorkMinsToday())) {
    console.log(`${SHOOTING_STAR_UTF8} ${mins} mins: ${count}`)
  }
}
