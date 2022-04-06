export interface RecipeUsingMinutes {
  timeUnit: 'minutes'
  workTime: number
  breakTime: number
  repeat: number
}

export interface RecipeUsingSeconds {
  timeUnit: 'seconds'
  workTime: number
  breakTime: number
  repeat: number
}
