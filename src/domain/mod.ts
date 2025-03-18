import { hole, pipe } from 'effect'

import { rotate } from 'effect/Array'
import { Int } from '../int.ts'
import { Command } from './command.ts'
import type { GridSize } from './grid-size.ts'
import { Orientation } from './orientation.ts'
import type { Planet } from './planet.ts'
import { Position } from './position.ts'
import type { Rover } from './rover.ts'

/**
 * Wraps a position coordinate around grid boundaries (pacman effect).
 *
 * This function handles the wrapping behavior when a position exceeds the grid limits
 * or becomes negative. It ensures the position always stays within the valid grid range
 * by wrapping it to the opposite edge when necessary.
 *
 * For example:
 * - If position = 5 and gridSize = 5, returns 0 (wraps to beginning)
 * - If position = -1 and gridSize = 5, returns 4 (wraps to end)
 *
 * @typeParam P - The type of position coordinate (Position.X or Position.Y)
 * @param position - The position coordinate to wrap
 * @param gridSize - The grid boundary size (width or height)
 * @returns The wrapped position coordinate of the same type as input
 *
 * @example
 * ```ts
 * // Wrap X position 5 in a grid of width 5 (returns 0)
 * const wrappedX = wrapGridPosition(Position.X(5), GridSize.Width(5));
 *
 * // Wrap Y position -1 in a grid of height 4 (returns 3)
 * const wrappedY = wrapGridPosition(Position.Y(-1), GridSize.Height(4));
 * ```
 */
export function wrapGridPosition<P extends Position.X | Position.Y>(
	position: P,
	gridSize: GridSize.Height | GridSize.Width,
): P {
	return Int.modulus(position, gridSize) as P
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
									y: wrapGridPosition(
										Position.Y(Int.add(rover.position.y, Int.unit)),
										planet.size.height,
									),
								}),
							}),

						South: () =>
							rover.clone({
								position: rover.position.clone({
									y: wrapGridPosition(
										Position.Y(Int.sub(rover.position.y, Int.unit)),
										planet.size.height,
									),
								}),
							}),

						West: () =>
							rover.clone({
								position: rover.position.clone({
									x: wrapGridPosition(
										Position.X(Int.sub(rover.position.x, Int.unit)),
										planet.size.width,
									),
								}),
							}),

						Est: () =>
							rover.clone({
								position: rover.position.clone({
									x: wrapGridPosition(
										Position.X(Int.add(rover.position.x, Int.unit)),
										planet.size.width,
									),
								}),
							}),
					}),
				),

			GoBackward: () =>
				pipe(
					rover.orientation,
					Orientation.$match({
						North: () =>
							rover.clone({
								position: rover.position.clone({
									y: wrapGridPosition(
										Position.Y(Int.sub(rover.position.y, Int.unit)),
										planet.size.height,
									),
								}),
							}),
						South: () =>
							rover.clone({
								position: rover.position.clone({
									y: wrapGridPosition(
										Position.Y(Int.add(rover.position.y, Int.unit)),
										planet.size.height,
									),
								}),
							}),
						Est: () => rover.clone(),
						West: () => rover.clone(),
					}),
				),
		}),
	)
}
