import { describe, expect, it } from '@effect/vitest'
import {
	// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
	Array,
	Context,
	Effect,
	Equal,
	Exit,
	HashSet,
	Ref,
	pipe,
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
import { PlanetService } from './planet.ts'
import { Position } from './position.ts'
import { RoverState, RoverStateService } from './rover-state.ts'

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
	describe(`Should '${Command.TurnLeft()._tag}'`, () => {
		it.effect.each([
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
			({ initialOrientation, expectedNextOrientation }) =>
				Effect.gen(function* () {
					const currentRoverStateRef = yield* Ref.make(
						new RoverState({
							position: new Position({
								x: Position.X(0),
								y: Position.Y(0),
							}),
							orientation: initialOrientation,
						}),
					)

					yield* Effect.exit(move(currentRoverStateRef, Command.TurnLeft()))

					const { orientation } = yield* Ref.get(currentRoverStateRef)

					expect(orientation).toEqual(expectedNextOrientation)
				}).pipe(
					Effect.provideService(
						PlanetService,
						PlanetService.Live({
							size: new GridSize({
								width: GridSize.Width(5),
								height: GridSize.Height(4),
							}),
							obstacles: HashSet.make<Position[]>(),
						}),
					),
				),
		)
	})

	describe(`Should '${Command.TurnRight()._tag}'`, () => {
		it.effect.each([
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
			({ initialOrientation, expectedNextOrientation }) =>
				Effect.gen(function* () {
					const currentRoverStateRef = yield* Ref.make(
						new RoverState({
							position: new Position({
								x: Position.X(0),
								y: Position.Y(0),
							}),
							orientation: initialOrientation,
						}),
					)

					yield* Effect.exit(move(currentRoverStateRef, Command.TurnRight()))

					const { orientation } = yield* Ref.get(currentRoverStateRef)
					expect(orientation).toEqual(expectedNextOrientation)
				}).pipe(
					Effect.provideService(
						PlanetService,
						PlanetService.Live({
							size: new GridSize({
								width: GridSize.Width(5),
								height: GridSize.Height(4),
							}),
							obstacles: HashSet.make<Position[]>(),
						}),
					),
				),
		)
	})

	describe(`Should '${Command.GoForward()._tag}'`, () => {
		const command = Command.GoForward()

		describe(`GIVEN a '${Orientation.North()._tag}' orientation`, () => {
			const orientation = Orientation.North()
			it.effect.each([
				{
					initialRoverState: new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
						orientation,
					}),
					expectedRoverState: new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
						orientation,
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRoverState.position.x, $initialRoverState.position.y) position, it SHOULD return ($expectedRoverState.position.x, $expectedRoverState.position.y)',
				({ initialRoverState, expectedRoverState }) =>
					Effect.gen(function* () {
						const currentRoverStateRef = yield* Ref.make(initialRoverState)

						yield* Effect.exit(move(currentRoverStateRef, command))

						const { position } = yield* Ref.get(currentRoverStateRef)
						expect(position).toEqual(expectedRoverState.position)
					}).pipe(
						Effect.provideService(
							PlanetService,
							PlanetService.Live({
								size: new GridSize({
									width: GridSize.Width(5),
									height: GridSize.Height(4),
								}),
								obstacles: HashSet.make<Position[]>(),
							}),
						),
					),
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverState = new RoverState({
								position: new Position({
									x: Position.X(0),
									y: Position.Y(0),
								}),
								orientation,
							})
							const currentRoverStateRef = yield* Ref.make(initialRoverState)

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(currentRoverStateRef, command),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: new Position({
											x: Position.X(0),
											y: Position.Y(1),
										}),
										roverState: initialRoverState,
									}),
								),
							)
						}).pipe(
							Effect.provideService(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make(
										new Position({
											x: Position.X(0),
											y: Position.Y(1),
										}),
									),
								}),
							),
						),
				)
			})
		})

		describe(`GIVEN a '${Orientation.South()._tag}' orientation`, () => {
			const orientation = Orientation.South()

			it.effect.each([
				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
				},
			])(
				'GIVEN ($initialRoverState.position.x, $initialRoverState.position.y) position, it SHOULD return ($expectedRoverState.position.x, $expectedRoverState.position.y)',
				({ initialRoverState, expectedRoverState }) =>
					Effect.gen(function* () {
						const currentRoverStateRef = yield* Ref.make(initialRoverState)

						yield* Effect.exit(move(currentRoverStateRef, command))

						const { position } = yield* Ref.get(currentRoverStateRef)

						expect(position).toEqual(expectedRoverState.position)
					}).pipe(
						Effect.provideService(
							PlanetService,
							PlanetService.Live({
								size: new GridSize({
									width: GridSize.Width(5),
									height: GridSize.Height(4),
								}),
								obstacles: HashSet.make<Position[]>(),
							}),
						),
					),
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverState = new RoverState({
								position: new Position({
									x: Position.X(0),
									y: Position.Y(0),
								}),
								orientation,
							})
							const currentRoverStateRef = yield* Ref.make(initialRoverState)

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(currentRoverStateRef, command),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: new Position({
											x: Position.X(0),
											y: Position.Y(3),
										}),
										roverState: initialRoverState,
									}),
								),
							)
						}).pipe(
							Effect.provideService(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make(
										new Position({
											x: Position.X(0),
											y: Position.Y(3),
										}),
									),
								}),
							),
						),
				)
			})
		})

		describe(`GIVEN a '${Orientation.Est()._tag}' orientation`, () => {
			const orientation = Orientation.Est()

			it.effect.each([
				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRoverState.position.x, $initialRoverState.position.y) position, it SHOULD return ($expectedRoverState.position.x, $expectedRoverState.position.y)',
				({ initialRoverState, expectedRoverState }) =>
					Effect.gen(function* () {
						const currentRoverStateRef = yield* Ref.make(initialRoverState)

						yield* Effect.exit(move(currentRoverStateRef, command))

						const { position } = yield* Ref.get(currentRoverStateRef)

						expect(position).toEqual(expectedRoverState.position)
					}).pipe(
						Effect.provideService(
							PlanetService,
							PlanetService.Live({
								size: new GridSize({
									width: GridSize.Width(5),
									height: GridSize.Height(4),
								}),
								obstacles: HashSet.make<Position[]>(),
							}),
						),
					),
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverState = new RoverState({
								position: new Position({
									x: Position.X(4),
									y: Position.Y(0),
								}),
								orientation,
							})
							const currentRoverStateRef = yield* Ref.make(initialRoverState)

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(currentRoverStateRef, command),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: new Position({
											x: Position.X(0),
											y: Position.Y(0),
										}),
										roverState: initialRoverState,
									}),
								),
							)
						}).pipe(
							Effect.provideService(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make(
										new Position({
											x: Position.X(0),
											y: Position.Y(0),
										}),
									),
								}),
							),
						),
				)
			})
		})

		describe(`GIVEN a '${Orientation.West()._tag}' orientation`, () => {
			const orientation = Orientation.West()

			it.effect.each([
				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRoverState.position.x, $initialRoverState.position.y) position, it SHOULD return ($expectedRoverState.position.x, $expectedRoverState.position.y)',
				({ initialRoverState, expectedRoverState }) =>
					Effect.gen(function* () {
						const currentRoverStateRef = yield* Ref.make(initialRoverState)

						yield* Effect.exit(move(currentRoverStateRef, command))

						const { position } = yield* Ref.get(currentRoverStateRef)
						expect(position).toEqual(expectedRoverState.position)
					}).pipe(
						Effect.provideService(
							PlanetService,
							PlanetService.Live({
								size: new GridSize({
									width: GridSize.Width(5),
									height: GridSize.Height(4),
								}),
								obstacles: HashSet.make<Position[]>(),
							}),
						),
					),
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverState = new RoverState({
								position: new Position({
									x: Position.X(0),
									y: Position.Y(0),
								}),
								orientation,
							})

							const currentRoverStateRef = yield* Ref.make(initialRoverState)

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(currentRoverStateRef, command),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: new Position({
											x: Position.X(4),
											y: Position.Y(0),
										}),
										roverState: initialRoverState,
									}),
								),
							)
						}).pipe(
							Effect.provideService(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make(
										new Position({
											x: Position.X(4),
											y: Position.Y(0),
										}),
									),
								}),
							),
						),
				)
			})
		})
	})

	describe(`Should '${Command.GoBackward()._tag}'`, () => {
		const command = Command.GoBackward()

		describe(`GIVEN a '${Orientation.North()._tag}' orientation`, () => {
			const orientation = Orientation.North()
			it.effect.each([
				{
					initialRoverState: new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
						orientation,
					}),
					expectedRoverState: new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
						orientation,
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRoverState.position.x, $initialRoverState.position.y) position, it SHOULD return ($expectedRoverState.position.x, $expectedRoverState.position.y)',
				({ initialRoverState, expectedRoverState }) =>
					Effect.gen(function* () {
						const currentRoverStateRef = yield* Ref.make(initialRoverState)

						yield* Effect.exit(move(currentRoverStateRef, command))

						const { position } = yield* Ref.get(currentRoverStateRef)

						expect(position).toEqual(expectedRoverState.position)
					}).pipe(
						Effect.provideService(
							PlanetService,
							PlanetService.Live({
								size: new GridSize({
									width: GridSize.Width(5),
									height: GridSize.Height(4),
								}),
								obstacles: HashSet.make<Position[]>(),
							}),
						),
					),
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverState = new RoverState({
								position: new Position({
									x: Position.X(0),
									y: Position.Y(0),
								}),
								orientation,
							})
							const currentRoverStateRef = yield* Ref.make(initialRoverState)

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(currentRoverStateRef, command),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: new Position({
											x: Position.X(0),
											y: Position.Y(3),
										}),
										roverState: initialRoverState,
									}),
								),
							)
						}).pipe(
							Effect.provideService(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make(
										new Position({
											x: Position.X(0),
											y: Position.Y(3),
										}),
									),
								}),
							),
						),
				)
			})
		})

		describe(`GIVEN a '${Orientation.South()._tag}' orientation`, () => {
			const orientation = Orientation.South()

			it.effect.each([
				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(1) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(2) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(3) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRoverState.position.x, $initialRoverState.position.y) position, it SHOULD return ($expectedRoverState.position.x, $expectedRoverState.position.y)',
				({ initialRoverState, expectedRoverState }) =>
					Effect.gen(function* () {
						const currentRoverStateRef = yield* Ref.make(initialRoverState)

						yield* Effect.exit(move(currentRoverStateRef, command))

						const currentRoverState = yield* Ref.get(currentRoverStateRef)

						expect(currentRoverState).toStrictEqual(expectedRoverState)
					}).pipe(
						Effect.provideService(
							PlanetService,
							PlanetService.Live({
								size: new GridSize({
									width: GridSize.Width(5),
									height: GridSize.Height(4),
								}),
								obstacles: HashSet.make<Position[]>(),
							}),
						),
					),
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverState = new RoverState({
								position: new Position({
									x: Position.X(0),
									y: Position.Y(3),
								}),
								orientation,
							})
							const currentRoverStateRef = yield* Ref.make(initialRoverState)

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(currentRoverStateRef, command),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: new Position({
											x: Position.X(0),
											y: Position.Y(0),
										}),
										roverState: initialRoverState,
									}),
								),
							)
						}).pipe(
							Effect.provideService(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make<Position[]>(
										new Position({
											x: Position.X(0),
											y: Position.Y(0),
										}),
									),
								}),
							),
						),
				)
			})
		})

		describe(`GIVEN a '${Orientation.Est()._tag}' orientation`, () => {
			const orientation = Orientation.Est()

			it.effect.each([
				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRoverState.position.x, $initialRoverState.position.y) position, it SHOULD return ($expectedRoverState.position.x, $expectedRoverState.position.y)',
				({ initialRoverState, expectedRoverState }) =>
					Effect.gen(function* () {
						const currentRoverStateRef = yield* Ref.make(initialRoverState)

						yield* Effect.exit(move(currentRoverStateRef, command))

						const { position } = yield* Ref.get(currentRoverStateRef)

						expect(position).toEqual(expectedRoverState.position)
					}).pipe(
						Effect.provideService(
							PlanetService,
							PlanetService.Live({
								size: new GridSize({
									width: GridSize.Width(5),
									height: GridSize.Height(4),
								}),
								obstacles: HashSet.make<Position[]>(),
							}),
						),
					),
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverState = new RoverState({
								position: new Position({
									x: Position.X(0),
									y: Position.Y(0),
								}),
								orientation,
							})
							const currentRoverStateRef = yield* Ref.make(initialRoverState)

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(currentRoverStateRef, command),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: new Position({
											x: Position.X(4),
											y: Position.Y(0),
										}),
										roverState: initialRoverState,
									}),
								),
							)
						}).pipe(
							Effect.provideService(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make(
										new Position({
											x: Position.X(4),
											y: Position.Y(0),
										}),
									),
								}),
							),
						),
				)
			})
		})

		describe(`GIVEN a '${Orientation.West()._tag}' orientation`, () => {
			const orientation = Orientation.West()

			it.effect.each([
				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(1), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(2), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(3), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
				},

				{
					initialRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(4), y: Position.Y(0) }),
					}),
					expectedRoverState: new RoverState({
						orientation,
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
					}),
				},
			])(
				'GIVEN ($initialRoverState.position.x, $initialRoverState.position.y) position, it SHOULD return ($expectedRoverState.position.x, $expectedRoverState.position.y)',
				({ initialRoverState, expectedRoverState }) =>
					Effect.gen(function* () {
						const currentRoverStateRef = yield* Ref.make(initialRoverState)
						yield* Effect.exit(move(currentRoverStateRef, command))

						const { position } = yield* Ref.get(currentRoverStateRef)
						expect(position).toEqual(expectedRoverState.position)
					}).pipe(
						Effect.provideService(
							PlanetService,
							PlanetService.Live({
								size: new GridSize({
									width: GridSize.Width(5),
									height: GridSize.Height(4),
								}),
								obstacles: HashSet.make<Position[]>(),
							}),
						),
					),
			)

			describe('GIVEN an obstacle on its path', () => {
				it.effect(
					`SHOULD return an "${CollisionDetected.name}" error`,
					({ expect }) =>
						Effect.gen(function* () {
							const initialRoverState = new RoverState({
								position: new Position({
									x: Position.X(4),
									y: Position.Y(0),
								}),
								orientation,
							})
							const currentRoverStateRef = yield* Ref.make(initialRoverState)

							// Capture the result as an Exit
							const result = yield* Effect.exit(
								move(
									currentRoverStateRef,

									command,
								),
							)

							expect(result).toStrictEqual(
								Exit.fail(
									new CollisionDetected({
										obstaclePosition: new Position({
											x: Position.X(0),
											y: Position.Y(0),
										}),
										roverState: initialRoverState,
									}),
								),
							)
						}).pipe(
							Effect.provideService(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make<Position[]>(
										new Position({
											x: Position.X(0),
											y: Position.Y(0),
										}),
									),
								}),
							),
						),
				)
			})
		})
	})
})

describe('processBatch', () => {
	describe('GIVEN a rover and a sequence of commands', () => {
		it.effect('SHOULD handle a single command correctly', ({ expect }) =>
			Effect.gen(function* () {
				const Services: Context.Context<RoverStateService | PlanetService> =
					Context.empty().pipe(
						Context.add(
							PlanetService,
							PlanetService.Live({
								size: new GridSize({
									width: GridSize.Width(5),
									height: GridSize.Height(4),
								}),
								obstacles: HashSet.make<Position[]>(),
							}),
						),

						Context.add(
							RoverStateService,
							/**
							 * Arrange: Initial rover at (0,0) facing North
							 */
							RoverStateService.Live({
								position: new Position({ x: Position.X(0), y: Position.Y(0) }),
								orientation: Orientation.North(),
							}),
						),
					)

				/**
				 * Act: Single command Turn left
				 */
				const program: Effect.Effect<void, CollisionDetected, never> =
					processBatch(Array.make(Command.TurnLeft())).pipe(
						Effect.provide(Services),
					)

				const result: Exit.Exit<void, CollisionDetected> =
					yield* Effect.exit(program)

				expect(result).toStrictEqual(Exit.void)

				const finalRoverState = yield* pipe(
					Services, //
					Context.get(RoverStateService),
					Ref.get,
				)

				expect(
					Equal.equals(
						finalRoverState,
						new RoverState({
							position: new Position({
								x: Position.X(0),
								y: Position.Y(0),
							}),
							orientation: Orientation.West(),
						}),
					),
				).toBe(true)
			}),
		)

		it.effect(
			'SHOULD handle commands that cancel each other out by returning the initial rover state unchanged',
			({ expect }) =>
				Effect.gen(function* () {
					const initialRoverState = new RoverState({
						position: new Position({ x: Position.X(0), y: Position.Y(0) }),
						orientation: Orientation.North(),
					})

					const Services: Context.Context<RoverStateService | PlanetService> =
						Context.empty().pipe(
							Context.add(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make<Position[]>(),
								}),
							),

							Context.add(
								RoverStateService,
								/**
								 * Arrange: Initial rover at (0,0) facing North
								 */
								RoverStateService.of(Ref.unsafeMake(initialRoverState)),
							),
						)

					/**
					 * Act: Commands that cancel each other out (turn left then turn right)
					 */
					const program: Effect.Effect<void, CollisionDetected, never> =
						processBatch(
							Array.make(Command.TurnLeft(), Command.TurnRight()),
						).pipe(Effect.provide(Services))

					const result: Exit.Exit<void, CollisionDetected> =
						yield* Effect.exit(program)

					expect(result).toStrictEqual(Exit.void)

					const currentRoverState = yield* pipe(
						Services, //
						Context.get(RoverStateService),
						Ref.get,
					)

					/**
					 * Assert: Check the final rover state (should be unchanged)
					 */
					expect(Equal.equals(currentRoverState, initialRoverState)).toBe(true)
				}),
		)

		it.effect(
			'SHOULD process all commands and return the final rover state with no collision',
			({ expect }) =>
				Effect.gen(function* () {
					const Services: Context.Context<RoverStateService | PlanetService> =
						Context.empty().pipe(
							Context.add(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make<Position[]>(),
								}),
							),
							Context.add(
								RoverStateService,
								/**
								 * Arrange: Initial rover at (0,0) facing North
								 */
								RoverStateService.Live({
									position: new Position({
										x: Position.X(0),
										y: Position.Y(0),
									}),
									orientation: Orientation.North(),
								}),
							),
						)

					/**
					 * Act: batch Commands
					 */
					const program: Effect.Effect<void, CollisionDetected, never> =
						processBatch(
							Array.make(
								Command.GoForward(),
								Command.TurnRight(),
								Command.GoForward(),
							),
						).pipe(Effect.provide(Services))

					const result: Exit.Exit<void, CollisionDetected> =
						yield* Effect.exit(program)

					expect(result).toStrictEqual(Exit.void)

					/**
					 * Assert Expected final position: (1,1) facing East
					 */
					const currentRoverState = yield* pipe(
						Services,
						Context.get(RoverStateService),
						Ref.get,
					)

					expect(
						Equal.equals(
							currentRoverState,
							new RoverState({
								position: new Position({
									x: Position.X(1),
									y: Position.Y(1),
								}),
								orientation: Orientation.Est(),
							}),
						),
					).toBe(true)
				}),
		)

		it.effect(
			'SHOULD stop processing when a collision is detected and return the last valid state',
			({ expect }) =>
				Effect.gen(function* () {
					/**
					 * Arrange: Place an obstacle at (0,2)
					 */
					const obstacle = new Position({
						x: Position.X(0),
						y: Position.Y(2),
					})

					const Services: Context.Context<RoverStateService | PlanetService> =
						Context.empty().pipe(
							Context.add(
								PlanetService,
								PlanetService.Live({
									size: new GridSize({
										width: GridSize.Width(5),
										height: GridSize.Height(4),
									}),
									obstacles: HashSet.make(obstacle),
								}),
							),

							Context.add(
								RoverStateService,
								/**
								 * Arrange: Initial rover at (0,0) facing North
								 */
								RoverStateService.Live({
									position: new Position({
										x: Position.X(0),
										y: Position.Y(0),
									}),
									orientation: Orientation.North(),
								}),
							),
						)

					/**
					 * Act: Commands Move forward twice (second move will cause collision), then turn right
					 */
					const program: Effect.Effect<void, CollisionDetected, never> =
						processBatch(
							/**
							 * Commands Move forward twice (second move will cause collision), then turn right
							 */
							Array.make(
								Command.GoForward(),
								Command.GoForward(),
								Command.TurnRight(),
							),
						).pipe(Effect.provide(Services))

					const result: Exit.Exit<void, CollisionDetected> =
						yield* Effect.exit(program)

					/**
					 * Assert:
					 * - Check that a collision was detected
					 * - Expected final position (0,1) facing North (before collision)
					 */
					expect(result).toEqual(
						Exit.fail(
							new CollisionDetected({
								obstaclePosition: obstacle,
								roverState: new RoverState({
									position: new Position({
										x: Position.X(0),
										y: Position.Y(1),
									}),
									orientation: Orientation.North(),
								}),
							}),
						),
					)
				}),
		)
	})
})
