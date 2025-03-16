import { pipe } from 'effect'

import { Command } from './command.ts'
import { Orientation } from './orientation.ts'
import type { Planet } from './planet.ts'
import type { Rover } from './rover.ts'

/**
 *  Implement wrapping from one edge of the grid to another (pacman effect).
 *
 *
 */
export function move(rover: Rover, planet: Planet, command: Command): Rover {
	return pipe(
		command,
		Command.$match({
			TurnLeft: () =>
				pipe(
					rover.orientation,
					Orientation.$match({
						North: () => rover.clone({ orientation: Orientation.West() }),
						South: () => rover.clone({ orientation: Orientation.Est() }),
						West: () => rover.clone({ orientation: Orientation.South() }),
						Est: () => rover.clone({ orientation: Orientation.North() }),
					}),
				),
			TurnRight: () =>
				pipe(
					rover.orientation,
					Orientation.$match({
						North: () => rover.clone({ orientation: Orientation.Est() }),
						Est: () => rover.clone({ orientation: Orientation.South() }),
						South: () => rover.clone({ orientation: Orientation.West() }),
						West: () => rover.clone({ orientation: Orientation.North() }),
					}),
				),
			GoForward: () => rover,
			GoBackward: () => rover,
		}),
	)
}
