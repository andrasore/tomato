import * as notifier from 'node-notifier'
import { Command } from 'commander'
import { setTimeout as setTimeoutAsync } from 'timers/promises'
import * as packageJson from '../package.json'
import * as config from './config'
import ora from 'ora'
import { RecipeUsingSeconds } from './config'

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

async function run (): Promise<void> {
  const recipeName = program.opts().recipe as string
  const recipe = await config.getRecipe(recipeName)

  const spinner = ora(`Starting recipe "${recipeName}"...`).start()

  for (const timerState of ticks(recipe)) {
    if (timerState.stage === 'work') {
      spinner.text = `Work stage ${timerState.repeat}, remaining time: ${printTime(timerState.remaining)}`
      if (timerState.finished) {
        spinner.succeed()
      }
      await setTimeoutAsync(1000)
    }
    if (timerState.stage === 'break') {
      spinner.text = `Break stage ${timerState.repeat}, remaining time: ${printTime(timerState.remaining)}`
      if (timerState.finished) {
        spinner.succeed()
      }
      await setTimeoutAsync(1000)
    }
  }
}

interface TimerState {
  remaining: number
  stage: 'work' | 'break'
  repeat: number
  finished: boolean
}

function * ticks (recipe: RecipeUsingSeconds): Generator<TimerState> {
  for (let r = 0; r < recipe.repeats; r++) {
    for (let t = 0; t < recipe.workTime; t++) {
      yield { stage: 'work', remaining: recipe.workTime - (t + 1), finished: t + 1 === recipe.workTime, repeat: r + 1 }
    }
    for (let t = 0; t < recipe.breakTime; t++) {
      yield { stage: 'break', remaining: recipe.breakTime - (t + 1), finished: t + 1 === recipe.breakTime, repeat: r + 1 }
    }
  }
}

function printTime (secs: number): string {
  return String(Math.floor(secs / 60)) + ':' + String(secs % 60).padStart(2, '0')
}
