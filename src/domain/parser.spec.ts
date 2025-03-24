import { describe, expect, it } from '@effect/vitest'
import {
	// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
	Array,
	Effect,
	Equal,
	Exit,
	HashSet,
	Option,
	Ref,
} from 'effect'

import { Command } from './command.ts'
import { GridSize } from './grid-size.ts'
import { Orientation } from './orientation.ts'
import {
	CollisionDetected,
	move,
	processBatch,
	wrapGridPosition,
} from './parser.ts'
import { Planet } from './planet.ts'
import { Position } from './position.ts'
import { RoverState } from './rover-state.ts'

describe('wrapGridPosition', () => {
	// Define common grid sizes for tests
	const width5 = GridSize.Width(5)
	const height4 = GridSize.Height(4)

	describe('with X coordinates', () => {
		it('leaves valid positions unchanged', () => {
			expect(wrapGridPosition(Position.X(0), width5)).toEqual(Position.X(0))
			expect(wrapGridPosition(Position.X(3), width5)).toEqual(Position.X(3))
			expect(wrapGridPosition(Position.X(4), width5)).toEqual(Position.X(4))
		})

		it('wraps positions at grid boundary', () => {
			expect(wrapGridPosition(Position.X(5), width5)).toEqual(Position.X(0))
			expect(wrapGridPosition(Position.X(10), width5)).toEqual(Position.X(0))
		})

		it('wraps positions beyond grid boundary', () => {
			expect(wrapGridPosition(Position.X(6), width5)).toEqual(Position.X(1))
			expect(wrapGridPosition(Position.X(9), width5)).toEqual(Position.X(4))
		})

		it('correctly wraps negative positions', () => {
			expect(wrapGridPosition(Position.X(-1), width5)).toEqual(Position.X(4))
			expect(wrapGridPosition(Position.X(-5), width5)).toEqual(Position.X(0))
			expect(wrapGridPosition(Position.X(-6), width5)).toEqual(Position.X(4))
		})
	})

	describe('with Y coordinates', () => {
		it('leaves valid positions unchanged', () => {
			expect(wrapGridPosition(Position.Y(0), height4)).toEqual(Position.Y(0))
			expect(wrapGridPosition(Position.Y(2), height4)).toEqual(Position.Y(2))
			expect(wrapGridPosition(Position.Y(3), height4)).toEqual(Position.Y(3))
		})

		it('wraps positions at grid boundary', () => {
			expect(wrapGridPosition(Position.Y(4), height4)).toEqual(Position.Y(0))
			expect(wrapGridPosition(Position.Y(8), height4)).toEqual(Position.Y(0))
		})

		it('wraps positions beyond grid boundary', () => {
			expect(wrapGridPosition(Position.Y(5), height4)).toEqual(Position.Y(1))
			expect(wrapGridPosition(Position.Y(7), height4)).toEqual(Position.Y(3))
		})

		it('correctly wraps negative positions', () => {
			expect(wrapGridPosition(Position.Y(-1), height4)).toEqual(Position.Y(3))
			expect(wrapGridPosition(Position.Y(-4), height4)).toEqual(Position.Y(0))
			expect(wrapGridPosition(Position.Y(-5), height4)).toEqual(Position.Y(3))
		})
	})
})

/**
 * GIVEN the following Planet with GridSize of 5*4
 * AND an Initial Position of (0,0) and oriented toward North....
 *
 *                   North
 *         +-----+-----+-----+-----+-----+
 *         | 0,3 |     |     |     | 4,3 |
 *         +-----+-----+-----+-----+-----+
 *         |     |     |     |     |     |
 *   West  +-----+-----+-----+-----+-----+  Est
 *         |     |*1,1*|     |     |*4,1*|
 *         +-----+-----+-----+-----+-----+
 *         | 0,0 |     |     |     | 4,0 |
 *         +-----+-----+-----+-----+-----+
 *                   South
 */
describe('move', () => {
	const planet = new Planet({
		size: new GridSize({
			width: GridSize.Width(5),
			height: GridSize.Height(4),
		}),
		obstacles: HashSet.make<Position[]>(),
	})

	describe(`Should '${Command.TurnLeft()._tag}'`, () => {
		it.each([
			{
				initialOrientation: Orientation.North(),
				expectedNextOrientation: Orientation.West(),
			},
			{
				initialOrientation: Orientation.West(),
				expectedNextOrientation: Orientation.South(),
			},
			{
				initialOrientation: Orientation.South(),
				expectedNextOrientation: Orientation.Est(),
			},
			{
				initialOrientation: Orientation.Est(),
				expectedNextOrientation: Orientation.North(),
			},
		])(
			'Given $initialOrientation._tag should return $expectedNextOrientation._tag',
			async ({ initialOrientation, expectedNextOrientation }) => {
				const { orientation } = await Effect.runPromise(
					move(
						new RoverState({
							position: new Position({ x: Position.X(0), y: Position.Y(0) }),
							orientation: initialOrientation,
						}),
						planet,
						Command.TurnLeft(),
					),
				)
				expect(orientation).toEqual(expectedNextOrientation)
			},
		)
	})

	describe(`Should '${Command.TurnRight()._tag}'`, () => {
		it.each([
			{
				initialOrientation: Orientation.North(),
				expectedNextOrientation: Orientation.Est(),
			},
			{
				initialOrientation: Orientation.Est(),
				expectedNextOrientation: Orientation.South(),
			},
			{
				initialOrientation: Orientation.South(),
				expectedNextOrientation: Orientation.West(),
			},
			{
				initialOrientation: Orientation.West(),
				expectedNextOrientation: Orientation.North(),
			},
		])(
			'Given $initialOrientation._tag should return $expectedNextOrientation._tag',
			async ({ initialOrientation, expectedNextOrientation }) => {
				const { orientation } = await Effect.runPromise(
					move(
						new RoverState({
							position: new Position({ x: Position.X(0), y: Position.Y(0) }),
							orientation: initialOrientation,
						}),
						planet,
						Command.TurnRight(),
					),
				)
				expect(orientation).toEqual(expectedNextOrientation)
			},
		)
	})

	describe(`Should '${Command.GoForward()._tag}'`, () => {
		const command = Command.GoForward()

		describe(`GIVEN a '${Orientation.North()._tag}' orientation`, () => {
			const orientation = Orientation.North()
			it.for([
				{
					initialRover: new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
						orientation,
					}),
					expectedRover: new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
						orientation,
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRover.position.x, $initialRover.position.y) position, it SHOULD return ($expectedRover.position.x, $expectedRover.position.y)',
				async ({ initialRover, expectedRover }) => {
					const { position } = await Effect.runPromise(
						move(initialRover, planet, command),
					)
					expect(position).toEqual(expectedRover.position)
				},
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverPosition = new Position({
								x: Position.X(0),
								y: Position.Y(0),
							})

							const initialRover = new RoverState({
								position: initialRoverPosition,
								orientation,
							})

							const obstaclePosition = new Position({
								x: Position.X(0),
								y: Position.Y(1),
							})

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(
									initialRover,
									planet.clone({ obstacles: HashSet.make(obstaclePosition) }),
									command,
								),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: obstaclePosition,
										roverPosition: initialRoverPosition,
									}),
								),
							)
						}),
				)
			})
		})

		describe(`GIVEN a '${Orientation.South()._tag}' orientation`, () => {
			const orientation = Orientation.South()

			it.for([
				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
				},
			])(
				'GIVEN ($initialRover.position.x, $initialRover.position.y) position, it SHOULD return ($expectedRover.position.x, $expectedRover.position.y)',
				async ({ initialRover, expectedRover }) => {
					const { position } = await Effect.runPromise(
						move(initialRover, planet, command),
					)
					expect(position).toEqual(expectedRover.position)
				},
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverPosition = new Position({
								x: Position.X(0),
								y: Position.Y(0),
							})

							const initialRover = new RoverState({
								position: initialRoverPosition,
								orientation,
							})

							const obstaclePosition = new Position({
								x: Position.X(0),
								y: Position.Y(3),
							})

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(
									initialRover,
									planet.clone({ obstacles: HashSet.make(obstaclePosition) }),
									command,
								),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: obstaclePosition,
										roverPosition: initialRoverPosition,
									}),
								),
							)
						}),
				)
			})
		})

		describe(`GIVEN a '${Orientation.Est()._tag}' orientation`, () => {
			const orientation = Orientation.Est()

			it.for([
				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRover.position.x, $initialRover.position.y) position, it SHOULD return ($expectedRover.position.x, $expectedRover.position.y)',
				async ({ initialRover, expectedRover }) => {
					const { position } = await Effect.runPromise(
						move(initialRover, planet, command),
					)

					expect(position).toEqual(expectedRover.position)
				},
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverPosition = new Position({
								x: Position.X(4),
								y: Position.Y(0),
							})

							const initialRover = new RoverState({
								position: initialRoverPosition,
								orientation,
							})

							const obstaclePosition = new Position({
								x: Position.X(0),
								y: Position.Y(0),
							})

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(
									initialRover,
									planet.clone({ obstacles: HashSet.make(obstaclePosition) }),
									command,
								),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: obstaclePosition,
										roverPosition: initialRoverPosition,
									}),
								),
							)
						}),
				)
			})
		})

		describe(`GIVEN a '${Orientation.West()._tag}' orientation`, () => {
			const orientation = Orientation.West()

			it.for([
				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRover.position.x, $initialRover.position.y) position, it SHOULD return ($expectedRover.position.x, $expectedRover.position.y)',
				async ({ initialRover, expectedRover }) => {
					const { position } = await Effect.runPromise(
						move(initialRover, planet, command),
					)
					expect(position).toEqual(expectedRover.position)
				},
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverPosition = new Position({
								x: Position.X(0),
								y: Position.Y(0),
							})

							const initialRover = new RoverState({
								position: initialRoverPosition,
								orientation,
							})

							const obstaclePosition = new Position({
								x: Position.X(4),
								y: Position.Y(0),
							})

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(
									initialRover,
									planet.clone({ obstacles: HashSet.make(obstaclePosition) }),
									command,
								),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: obstaclePosition,
										roverPosition: initialRoverPosition,
									}),
								),
							)
						}),
				)
			})
		})
	})

	describe(`Should '${Command.GoBackward()._tag}'`, () => {
		const command = Command.GoBackward()

		describe(`GIVEN a '${Orientation.North()._tag}' orientation`, () => {
			const orientation = Orientation.North()
			it.for([
				{
					initialRover: new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
						orientation,
					}),
					expectedRover: new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
						orientation,
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRover.position.x, $initialRover.position.y) position, it SHOULD return ($expectedRover.position.x, $expectedRover.position.y)',
				async ({ initialRover, expectedRover }) => {
					const { position } = await Effect.runPromise(
						move(initialRover, planet, command),
					)
					expect(position).toEqual(expectedRover.position)
				},
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverPosition = new Position({
								x: Position.X(0),
								y: Position.Y(0),
							})

							const initialRover = new RoverState({
								position: initialRoverPosition,
								orientation,
							})

							const obstaclePosition = new Position({
								x: Position.X(0),
								y: Position.Y(3),
							})

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(
									initialRover,
									planet.clone({ obstacles: HashSet.make(obstaclePosition) }),
									command,
								),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: obstaclePosition,
										roverPosition: initialRoverPosition,
									}),
								),
							)
						}),
				)
			})
		})

		describe(`GIVEN a '${Orientation.South()._tag}' orientation`, () => {
			const orientation = Orientation.South()

			it.for([
				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRover.position.x, $initialRover.position.y) position, it SHOULD return ($expectedRover.position.x, $expectedRover.position.y)',
				async ({ initialRover, expectedRover }) => {
					await expect(
						Effect.runPromise(move(initialRover, planet, command)),
					).resolves.toMatchObject({ position: expectedRover.position })
				},
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverPosition = new Position({
								x: Position.X(0),
								y: Position.Y(3),
							})

							const initialRover = new RoverState({
								position: initialRoverPosition,
								orientation,
							})

							const obstaclePosition = new Position({
								x: Position.X(0),
								y: Position.Y(0),
							})

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(
									initialRover,
									planet.clone({ obstacles: HashSet.make(obstaclePosition) }),
									command,
								),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: obstaclePosition,
										roverPosition: initialRoverPosition,
									}),
								),
							)
						}),
				)
			})
		})

		describe(`GIVEN a '${Orientation.Est()._tag}' orientation`, () => {
			const orientation = Orientation.Est()

			it.for([
				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRover.position.x, $initialRover.position.y) position, it SHOULD return ($expectedRover.position.x, $expectedRover.position.y)',
				async ({ initialRover, expectedRover }) => {
					const { position } = await Effect.runPromise(
						move(initialRover, planet, command),
					)
					expect(position).toEqual(expectedRover.position)
				},
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverPosition = new Position({
								x: Position.X(0),
								y: Position.Y(0),
							})

							const initialRover = new RoverState({
								position: initialRoverPosition,
								orientation,
							})

							const obstaclePosition = new Position({
								x: Position.X(4),
								y: Position.Y(0),
							})

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(
									initialRover,
									planet.clone({ obstacles: HashSet.make(obstaclePosition) }),
									command,
								),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: obstaclePosition,
										roverPosition: initialRoverPosition,
									}),
								),
							)
						}),
				)
			})
		})

		describe(`GIVEN a '${Orientation.West()._tag}' orientation`, () => {
			const orientation = Orientation.West()

			it.for([
				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
				},

				{
					initialRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
					expectedRover: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRover.position.x, $initialRover.position.y) position, it SHOULD return ($expectedRover.position.x, $expectedRover.position.y)',
				async ({ initialRover, expectedRover }) => {
					const { position } = await Effect.runPromise(
						move(initialRover, planet, command),
					)
					expect(position).toEqual(expectedRover.position)
				},
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverPosition = new Position({
								x: Position.X(4),
								y: Position.Y(0),
							})

							const initialRover = new RoverState({
								position: initialRoverPosition,
								orientation,
							})

							const obstaclePosition = new Position({
								x: Position.X(0),
								y: Position.Y(0),
							})

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(
									initialRover,
									planet.clone({ obstacles: HashSet.make(obstaclePosition) }),
									command,
								),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: obstaclePosition,
										roverPosition: initialRoverPosition,
									}),
								),
							)
						}),
				)
			})
		})
	})
})

describe('processBatch', () => {
	const planet = new Planet({
		size: new GridSize({
			width: GridSize.Width(5),
			height: GridSize.Height(4),
		}),
		obstacles: HashSet.make<Position[]>(),
	})

	describe('GIVEN a rover and a sequence of commands', () => {
		it.effect('SHOULD handle a single command correctly', ({ expect }) =>
			Effect.gen(function* () {
				/**
				 * Arrange: Initial rover at (0,0) facing North
				 */
				const currentRoverRef: Ref.Ref<RoverState> = yield* Ref.make(
					new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
						orientation: Orientation.North(),
					}),
				)

				/**
				 * Act: Single command Turn left
				 */
				const result = yield* Effect.exit(
					processBatch(currentRoverRef, planet, Array.make(Command.TurnLeft())),
				)

				/**
				 * Assert: Expected (0,0) facing West
				 */
				expect(result).toStrictEqual(Exit.void)

				const finalRover = yield* Ref.get(currentRoverRef)

				expect(finalRover.position).toEqual(
					new Position({
						x: Position.X(0),
						y: Position.Y(0),
					}),
				)
				expect(finalRover.orientation).toEqual(Orientation.West())
			}),
		)

		it.effect(
			'SHOULD handle commands that cancel each other out by returning the initial rover state unchanged',
			({ expect }) =>
				Effect.gen(function* () {
					/**
					 * Arrange: Initial rover at (0,0) facing North
					 */
					const initialRover = new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
						orientation: Orientation.North(),
					})

					const currentRoverRef: Ref.Ref<RoverState> =
						yield* Ref.make(initialRover)

					/**
					 * Act: Commands that cancel each other out (turn left then turn right)
					 */
					const result: Exit.Exit<void, CollisionDetected> = yield* Effect.exit(
						processBatch(
							currentRoverRef,
							planet,
							Array.make(Command.TurnLeft(), Command.TurnRight()),
						),
					)

					/**
					 * Assert: Check the final rover state (should be unchanged)
					 */
					expect(result).toStrictEqual(Exit.void)
					expect(yield* Ref.get(currentRoverRef)).toStrictEqual(initialRover)
				}),
		)

		it.effect(
			'SHOULD process all commands and return the final rover state with no collision',
			({ expect }) =>
				Effect.gen(function* () {
					/**
					 * Arrange: Initial rover at (0,0) facing North
					 */
					const initialRover = new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
						orientation: Orientation.North(),
					})

					const currentRoverRef: Ref.Ref<RoverState> =
						yield* Ref.make(initialRover)

					/**
					 * Act: batch Commands
					 */
					const result: Exit.Exit<void, CollisionDetected> = yield* Effect.exit(
						processBatch(
							currentRoverRef,
							planet,
							Array.make(
								Command.GoForward(),
								Command.TurnRight(),
								Command.GoForward(),
							),
						),
					)

					/**
					 * Assert Expected final position: (1,1) facing East
					 */
					expect(result).toStrictEqual(Exit.void)

					const finalRover = yield* Ref.get(currentRoverRef)

					expect(finalRover.position).toStrictEqual(
						new Position({
							x: Position.X(1),
							y: Position.Y(1),
						}),
					)

					expect(Equal.equals(finalRover.orientation, Orientation.Est())).toBe(
						true,
					)
				}),
		)

		it.effect(
			'SHOULD stop processing when a collision is detected and return the last valid state',
			({ expect }) =>
				Effect.gen(function* () {
					/**
					 * Arrange: Initial rover at (0,0) facing North
					 */
					const initialRover = new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
						orientation: Orientation.North(),
					})

					/**
					 * Arrange: Place an obstacle at (0,2)
					 */
					const obstaclePosition = new Position({
						x: Position.X(0),
						y: Position.Y(2),
					})

					const currentRoverRef: Ref.Ref<RoverState> =
						yield* Ref.make(initialRover)

					/**
					 * Act: Commands Move forward twice (second move will cause collision), then turn right
					 */
					const result: Exit.Exit<void, CollisionDetected> = yield* Effect.exit(
						processBatch(
							currentRoverRef,
							planet.clone({
								obstacles: HashSet.add(planet.obstacles, obstaclePosition),
							}),
							/**
							 * Commands Move forward twice (second move will cause collision), then turn right
							 */
							Array.make(
								Command.GoForward(),
								Command.GoForward(),
								Command.TurnRight(),
							),
						),
					)

					/**
					 * Assert:
					 * - Check that a collision was detected
					 * - Expected final position (0,1) facing North (before collision)
					 */
					expect(result).toStrictEqual(
						Exit.fail(
							new CollisionDetected({
								obstaclePosition: obstaclePosition,
								roverPosition: new Position({
									x: Position.X(0),
									y: Position.Y(1),
								}),
							}),
						),
					)

					const finalRover = yield* Ref.get(currentRoverRef)
					expect(
						Equal.equals(finalRover.orientation, Orientation.North()),
					).toBe(true)
				}),
		)
	})
})
