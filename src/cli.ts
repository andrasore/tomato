import * as notifier from 'node-notifier'
import { Command } from 'commander'
import { setTimeout as setTimeoutPromise } from 'timers/promises'
import * as packageJson from '../package.json'
import * as config from './config'

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

  const { default: ora } = await import('ora') // esm package, dynamic import only

  const spinner = ora(`Starting recipe "${recipeName}" pomodoros...`).start()

  await setTimeoutPromise(INTERVAL)
  notifier.notify({ sound: true, message: 'butt' })
}
