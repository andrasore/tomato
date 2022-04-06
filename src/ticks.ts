import { RecipeUsingSeconds } from './recipe'

interface TimerState {
  remaining: number
  stage: 'work' | 'break'
  repeat: number
  isFirstTick: boolean
  isLastTick: boolean
}

/** Returns a generator function which can iterate through the whole run,
 * returning a structure with all the useful data for display etc.
 * An event emitter is used for sending completion events. */
export function * ticks (recipe: RecipeUsingSeconds): Generator<TimerState> {
  for (let r = 0; r < recipe.repeat; r++) {
    for (let t = 0; t < recipe.workTime; t++) {
      yield {
        stage: 'work',
        remaining: recipe.workTime - (t + 1),
        repeat: r + 1,
        isFirstTick: t === 0,
        isLastTick: t === recipe.workTime - 1
      }
    }
    for (let t = 0; t < recipe.breakTime; t++) {
      yield {
        stage: 'break',
        remaining: recipe.breakTime - (t + 1),
        repeat: r + 1,
        isFirstTick: t === 0,
        isLastTick: t === recipe.breakTime - 1
      }
    }
  }
}
