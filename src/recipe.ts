export interface RecipeUsingMinutes {
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
