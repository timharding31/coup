type NordScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | -1

export type NordColor =
  | `nord-${NordScale}`
  | 'nord-11-dark'
  | 'nord-11-light'
  | 'nord-13-dark'
  | 'nord-13-light'
  | 'nord-14-dark'
  | 'nord-14-light'
