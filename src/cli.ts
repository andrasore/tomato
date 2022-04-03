import notifier from 'node-notifier'
import { Command } from 'commander'
import { setTimeout as setTimeoutAsync } from 'timers/promises'
import * as packageJson from '../package.json'
import * as config from './config'
import ora from 'ora'
import { ticks } from './ticks'
import EventEmitter from 'events'

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

  const spinner = ora()

  spinner.stopAndPersist({ symbol: '🍅', text: `Starting recipe "${recipeName}"...` })
  spinner.start()

  const emitter = new EventEmitter()

  emitter.on('workFinish', () => {
    spinner.succeed()
    notifier.notify('Work finished!')
    spinner.start()
  })

  emitter.on('breakFinish', () => {
    spinner.succeed()
    notifier.notify('Break finished!')
    spinner.start()
  })

  emitter.on('recipeFinish', () => {
    spinner.stopAndPersist({ symbol: '🌠', text: 'All pomodoros completed!' })
  })

  for (const timerState of ticks(recipe, emitter)) {
    if (timerState.stage === 'work') {
      spinner.text = `Work stage ${timerState.repeat}, remaining time: ${printTime(timerState.remaining)}`
      spinner.color = 'green'
    }
    if (timerState.stage === 'break') {
      spinner.text = `Break stage ${timerState.repeat}, remaining time: ${printTime(timerState.remaining)}`
      spinner.color = 'magenta'
    }
    await setTimeoutAsync(1000)
  }
}

function printTime (secs: number): string {
  return String(Math.floor(secs / 60)) + ':' + String(secs % 60).padStart(2, '0')
}
