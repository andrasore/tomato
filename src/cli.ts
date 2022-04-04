import notifier from 'node-notifier'
import { Command } from 'commander'
import { setTimeout as setTimeoutAsync } from 'node:timers/promises'
import * as packageJson from '../package.json'
import * as config from './config'
import { ticks } from './ticks'
import * as process from 'node:process'
import * as readline from 'node:readline'

const rl = readline.createInterface({
  input: process.stdin, output: process.stdout, prompt: ''
})

const program = new Command()

program.name('tom')
  .version(packageJson.version)
  .description(packageJson.description)
  .option('-r, --recipe <name>', 'Recipe name to use', 'default')

program.parse()

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

  rl.write(`${TOMATO_UTF8} Starting recipe "${recipeName}"...\n`)

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
}

function printTime (secs: number): string {
  return String(Math.floor(secs / 60)) + ':' + String(secs % 60).padStart(2, '0')
}
