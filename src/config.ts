import zod from 'zod'
import * as yaml from 'js-yaml'
import * as os from 'os'
import * as fs from 'fs-extra'
import * as path from 'path'

interface RecipeUsingMinutes {
  timeUnit: 'minutes'
  workTime: number
  breakTime: number
  repeats: number
}

export interface RecipeUsingSeconds {
  timeUnit: 'seconds'
  workTime: number
  breakTime: number
  repeats: number
}

const ConfigSchema = zod.object({
  recipes: zod.record(zod.object({
    timeUnit: zod.union([zod.literal('seconds'), zod.literal('minutes')]).default('minutes'),
    workTime: zod.number().int().nonnegative().default(25),
    breakTime: zod.number().int().nonnegative().default(5),
    repeats: zod.number().int().nonnegative().default(2)
  }))
}).strict()

/** Gets run recipe from config file, with fallback to default config */
export async function getRecipe (recipeName: string): Promise<RecipeUsingSeconds> {
  const localCfgPath = path.join(process.cwd(), '.tomrc.yml')
  const userCfgPath = path.join(os.homedir(), '.tomrc.yml')

  let recipe: RecipeUsingMinutes | RecipeUsingSeconds | null = null

  if (await fs.pathExists(localCfgPath)) {
    const config = ConfigSchema.safeParse(yaml.load(await fs.readFile(localCfgPath, 'utf8')))
    if (!config.success) {
      throw new Error(`Failed to parse config file! Issues are: ${JSON.stringify(config.error.issues)}`)
    }
    if (config.data.recipes[recipeName] === undefined) {
      throw new Error(`No recipe named "${recipeName}" found in local config path! (${localCfgPath})`)
    }
    recipe = config.data.recipes[recipeName]
  }

  if (await fs.pathExists(userCfgPath)) {
    const config = ConfigSchema.safeParse(yaml.load(await fs.readFile(userCfgPath, 'utf8')))
    if (!config.success) {
      throw new Error(`Failed to parse config file! Issues are: ${JSON.stringify(config.error.issues)}`)
    }
    if (config.data.recipes[recipeName] === undefined) {
      throw new Error(`No recipe named "${recipeName}" found in user config path! (${userCfgPath})`)
    }
    recipe = config.data.recipes[recipeName]
  }

  if (recipe === null) {
    console.log('No config files found in cwd or home directory, using default recipe...')
    recipe = {
      timeUnit: 'minutes',
      workTime: 25,
      breakTime: 5,
      repeats: 1
    }
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
    repeats: recipe.repeats
  }
}
