import { hole, pipe } from 'effect'

import { Int } from '../types.ts'
import { Command } from './command.ts'
import { Orientation } from './orientation.ts'
import type { Planet } from './planet.ts'
import { Position } from './position.ts'
import type { Rover } from './rover.ts'

/**
 * Calculates the modulus of two integers, ensuring the result is always non-negative.
 *
 * @param dividend - The number to be divided.
 * @param divisor - The number by which the dividend is divided.
 * @return The non-negative remainder of the division operation.
 */
function nonNegativeModulus(dividend: Int.Type, divisor: Int.Type): Int.Type {
	return Int.make(Math.abs(dividend % divisor))
}

/**
 *  Implement wrapping from one edge of the grid to another (pacman effect).
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
			GoForward: () =>
				pipe(
					rover.orientation,
					Orientation.$match({
						North: () =>
							rover.clone({
								position: rover.position.clone({
									y: Position.Y(
										nonNegativeModulus(
											Int.add(rover.position.y, Int.unit),
											planet.size.height,
										),
									),
								}),
							}),
						South: () => hole(),
						West: () => hole(),
						Est: () => hole(),
					}),
				),
			GoBackward: () => hole(),
		}),
	)
}
