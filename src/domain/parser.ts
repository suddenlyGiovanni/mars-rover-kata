import {
	// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
	type Array,
	Data,
	Effect,
	HashSet,
	Ref,
	pipe,
} from 'effect'

import { Command } from './command.ts'
import type { GridSize } from './grid-size.ts'
import { Int } from './int.ts'
import { Orientation } from './orientation.ts'
import { type Planet, PlanetService } from './planet.ts'
import { Position } from './position.ts'
import { type RoverState, RoverStateService } from './rover-state.ts'

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

export class CollisionDetected extends Data.TaggedError('CollisionDetected')<{
	readonly obstaclePosition: Position
	readonly roverState: RoverState
}> {}

export function processBatch(
	commands: Array.NonEmptyReadonlyArray<Command>,
): Effect.Effect<void, CollisionDetected, PlanetService | RoverStateService> {
	return RoverStateService.pipe(
		Effect.flatMap((currentRoverStateRef) => {
			return Effect.forEach(
				commands,
				(command) => move(currentRoverStateRef, command),
				{ discard: true },
			)
		}),
	)
}

export function move(
	currentRoverStateRef: Ref.Ref<RoverState>,
	command: Command,
): Effect.Effect<void, CollisionDetected, PlanetService> {
	return Effect.gen(function* () {
		const planet = yield* PlanetService

		const roverState = yield* Ref.get(currentRoverStateRef)

		const nextRover: RoverState = nextMove(roverState, planet, command)

		if (HashSet.has(planet.obstacles, nextRover.position)) {
			return yield* Effect.fail(
				new CollisionDetected({
					obstaclePosition: nextRover.position,
					roverState,
				}),
			)
		}

		yield* Ref.set(currentRoverStateRef, nextRover)
	})
}

/**
 *  Implement wrapping from one edge of the grid to another (pacman effect).
 */
function nextMove(
	roverState: RoverState,
	planet: Planet,
	command: Command,
): RoverState {
	return pipe(
		command,
		Command.$match({
			TurnLeft: () =>
				pipe(
					roverState.orientation,
					Orientation.$match({
						North: () => roverState.clone({ orientation: Orientation.West() }),

						South: () => roverState.clone({ orientation: Orientation.Est() }),

						West: () => roverState.clone({ orientation: Orientation.South() }),

						Est: () => roverState.clone({ orientation: Orientation.North() }),
					}),
				),

			TurnRight: () =>
				pipe(
					roverState.orientation,
					Orientation.$match({
						North: () => roverState.clone({ orientation: Orientation.Est() }),

						Est: () => roverState.clone({ orientation: Orientation.South() }),

						South: () => roverState.clone({ orientation: Orientation.West() }),

						West: () => roverState.clone({ orientation: Orientation.North() }),
					}),
				),

			GoForward: () =>
				pipe(
					roverState.orientation,
					Orientation.$match({
						North: () =>
							roverState.clone({
								position: roverState.position.clone({
									y: wrapGridPosition(
										Position.Y(Int.add(roverState.position.y, Int.unit)),
										planet.size.height,
									),
								}),
							}),

						South: () =>
							roverState.clone({
								position: roverState.position.clone({
									y: wrapGridPosition(
										Position.Y(Int.sub(roverState.position.y, Int.unit)),
										planet.size.height,
									),
								}),
							}),

						West: () =>
							roverState.clone({
								position: roverState.position.clone({
									x: wrapGridPosition(
										Position.X(Int.sub(roverState.position.x, Int.unit)),
										planet.size.width,
									),
								}),
							}),

						Est: () =>
							roverState.clone({
								position: roverState.position.clone({
									x: wrapGridPosition(
										Position.X(Int.add(roverState.position.x, Int.unit)),
										planet.size.width,
									),
								}),
							}),
					}),
				),

			GoBackward: () =>
				pipe(
					roverState.orientation,
					Orientation.$match({
						North: () =>
							roverState.clone({
								position: roverState.position.clone({
									y: wrapGridPosition(
										Position.Y(Int.sub(roverState.position.y, Int.unit)),
										planet.size.height,
									),
								}),
							}),

						South: () =>
							roverState.clone({
								position: roverState.position.clone({
									y: wrapGridPosition(
										Position.Y(Int.add(roverState.position.y, Int.unit)),
										planet.size.height,
									),
								}),
							}),

						Est: () =>
							roverState.clone({
								position: roverState.position.clone({
									x: wrapGridPosition(
										Position.X(Int.sub(roverState.position.x, Int.unit)),
										planet.size.width,
									),
								}),
							}),

						West: () =>
							roverState.clone({
								position: roverState.position.clone({
									x: wrapGridPosition(
										Position.X(Int.add(roverState.position.x, Int.unit)),
										planet.size.width,
									),
								}),
							}),
					}),
				),
		}),
	)
}
