import zod from 'zod'
import * as os from 'node:os'
import * as yaml from 'js-yaml'
import * as fs from 'fs-extra'
import * as path from 'node:path'
import { RecipeUsingSeconds, RecipeUsingMinutes } from './recipe'
import assert from 'node:assert'

export const SAMPLE_CONFIG = `
recipes:
  default:
    timeUnit: minutes
    workTime: 25
    breakTime: 10
    repeat: 3
  leisure: 
    timeUnit: seconds
    workTime: 5
    breakTime: 5000
    repeat: 2
  suffering:
    workTime: 40
    breakTime: 5
    repeat: 6
` as const

const configPaths = [
  path.join(process.cwd(), '.tomrc.yml'),
  path.join(process.cwd(), '.tomrc.yaml'),
  path.join(os.homedir(), '.tomrc.yml'),
  path.join(os.homedir(), '.tomrc.yaml')
].filter(p => fs.existsSync(p))

const ConfigSchema = zod.object({
  recipes: zod.record(zod.object({
    timeUnit: zod.union([zod.literal('seconds'), zod.literal('minutes')]).default('minutes'),
    workTime: zod.number().int().nonnegative().default(25),
    breakTime: zod.number().int().nonnegative().default(5),
    repeat: zod.number().int().nonnegative().default(1)
  }))
}).strict()

/** Gets run recipe from config file, with fallback to default config */
export async function getRecipe (recipeName: string): Promise<RecipeUsingSeconds> {
  let recipe: RecipeUsingMinutes | RecipeUsingSeconds | null = null

  if (configPaths.length > 0) {
    const config = ConfigSchema.safeParse(yaml.load(await fs.readFile(configPaths[0], 'utf8')))
    if (!config.success) {
      throw new Error(`Failed to parse config file! Issues are: ${JSON.stringify(config.error.issues)}`)
    }
    if (config.data.recipes[recipeName] === undefined) {
      throw new Error(`No recipe named "${recipeName}" found in config path! (${configPaths[0]})`)
    }
    recipe = config.data.recipes[recipeName]
  }

  if (recipe === null) {
    const config = ConfigSchema.parse(yaml.load(SAMPLE_CONFIG))
    console.log('No config files found in cwd or home directory, using default recipe...')
    recipe = config.recipes.default
    assert(recipe) // for ts
  }

  if (recipe.timeUnit === 'seconds') {
    return recipe
  } else {
    return convertToUsingSeconds(recipe)
  }
}

function convertToUsingSeconds (recipe: RecipeUsingMinutes): RecipeUsingSeconds {
  return {
    timeUnit: 'seconds',
    workTime: recipe.workTime * 60,
    breakTime: recipe.breakTime * 60,
    repeat: recipe.repeat
  }
}
