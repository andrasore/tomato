import { RecipeUsingSeconds } from './recipe'
import EventEmitter from 'events'

interface TimerState {
  remaining: number
  stage: 'work' | 'break'
  repeat: number
}

/** Returns a generator function which can iterate through the whole run,
 * returning a structure with all the useful data for display etc.
 * An event emitter is used for sending completion events. */
export function * ticks (recipe: RecipeUsingSeconds, emitter: EventEmitter): Generator<TimerState> {
  for (let r = 0; r < recipe.repeats; r++) {
    for (let t = 0; t < recipe.workTime; t++) {
      yield {
        stage: 'work',
        remaining: recipe.workTime - (t + 1),
        repeat: r + 1
      }
    }
    emitter.emit('workFinish')
    for (let t = 0; t < recipe.breakTime; t++) {
      yield {
        stage: 'break',
        remaining: recipe.breakTime - (t + 1),
        repeat: r + 1
      }
    }
    emitter.emit('breakFinish')
  }
  emitter.emit('recipeFinish')
}
