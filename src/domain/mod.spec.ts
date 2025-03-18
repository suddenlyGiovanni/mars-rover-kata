import { describe, expect, it } from 'vitest'

import { Command } from './command.ts'
import { GridSize } from './grid-size.ts'
import { move, wrapGridPosition } from './mod.ts'
import { Orientation } from './orientation.ts'
import { Planet } from './planet.ts'
import { Position } from './position.ts'
import { Rover } from './rover.ts'

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
 * GIVEN the following Planet with GridSize of 4*3
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
	describe('responds to the orientation changes commands', () => {
		const size = new GridSize({
			width: GridSize.Width(5),
			height: GridSize.Height(4),
		})
		const planet = new Planet({ size })

		const initialPosition = new Position({
			x: Position.X(0),
			y: Position.Y(0),
		})
		const initialOrientation = Orientation.North()

		const rover = new Rover({
			position: initialPosition,
			orientation: initialOrientation,
		})

		describe('Should turn left', () => {
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
				'Given the initial orientation $initialOrientation._tag should return $expectedNextOrientation._tag',
				({ initialOrientation, expectedNextOrientation }) => {
					// act
					const { orientation: actualOrientation } = move(
						rover.clone({ orientation: initialOrientation }),
						planet,
						Command.TurnLeft(),
					)
					// assert
					expect(actualOrientation).toEqual(expectedNextOrientation)
				},
			)
		})

		describe('Should turn Right', () => {
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
				'Given the initial orientation $initialOrientation._tag should return $expectedNextOrientation._tag',
				({ initialOrientation, expectedNextOrientation }) => {
					// act
					const { orientation: actualOrientation } = move(
						rover.clone({ orientation: initialOrientation }),
						planet,
						Command.TurnRight(),
					)
					// assert
					expect(actualOrientation).toEqual(expectedNextOrientation)
				},
			)
		})
	})
	describe('responds to the movement commands', () => {
		const size = new GridSize({
			width: GridSize.Width(5),
			height: GridSize.Height(4),
		})
		const planet = new Planet({ size })

		const initialPosition = new Position({
			x: Position.X(0),
			y: Position.Y(0),
		})
		const initialOrientation = Orientation.North()

		const rover = new Rover({
			position: initialPosition,
			orientation: initialOrientation,
		})

		/**
		 * Given a world of with 4 and height 3
		 * and a Rover located at position `[x: 0, y:0]` oriented North
		 * as depicted by the following ascii art map
		 *
		 *                   North
		 *         +-----+-----+-----+-----+-----+
		 *         | 0,3 |     |     |     | 4,3 |
		 *         +-----+-----+-----+-----+-----+
		 *         |     |     |     |     |     |
		 *   West  +-----+-----+-----+-----+-----+  Est
		 *         |     |     |     |     |     |
		 *         +-----+-----+-----+-----+-----+
		 *         |[0,0]|     |     |     | 4,0 |
		 *         +-----+-----+-----+-----+-----+
		 *                   South
		 */
		describe('responds to the move commands', () => {
			describe('Should go forward', () => {
				describe('Given a North orientation', () => {
					const rover = new Rover({
						position: initialPosition,
						orientation: Orientation.North(),
					})

					it.each([
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(1) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(1) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(2) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(2) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(3) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(3) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(0) }),
							}),
						},
					])(
						'Given the initial position `[$initial.position.x,$initial.position.y]`, it should move to `[$expected.position.x,$expected.position.y]`',
						({ initial, expected }) => {
							const { position: actualPosition } = move(
								initial,
								planet,
								Command.GoForward(),
							)

							/**
							 *                   North
							 *         +-----+-----+-----+-----+-----+
							 *         |[0,3]|     |     |     | 4,3 |
							 *         +-----+-----+-----+-----+-----+
							 *         |[0,2]|     |     |     |     |
							 *   West  +-----+-----+-----+-----+-----+  Est
							 *         |[0,1]|     |     |     |     |
							 *         +-----+-----+-----+-----+-----+
							 *         |[0,0]|     |     |     | 4,0 |
							 *         +-----+-----+-----+-----+-----+
							 *                   South
							 */
							expect(actualPosition).toEqual(expected.position)
						},
					)
				})

				describe.skip('Given a South orientation', () => {
					const rover = new Rover({
						position: initialPosition,
						orientation: Orientation.South(),
					})
					it.each([
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(3) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(3) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(2) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(2) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(1) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(1) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(0) }),
							}),
						},
					])(
						'Given the initial position `[$initial.position.x,$initial.position.y]`, it should move to `[$expected.position.x,$expected.position.y]`',
						({ initial, expected }) => {
							const { position: actualPosition } = move(
								initial,
								planet,
								Command.GoForward(),
							)

							/**
							 *                   North
							 *         +-----+-----+-----+-----+-----+
							 *         |[0,3]|     |     |     | 4,3 |
							 *         +-----+-----+-----+-----+-----+
							 *         |[0,2]|     |     |     |     |
							 *   West  +-----+-----+-----+-----+-----+  Est
							 *         |[0,1]|     |     |     |     |
							 *         +-----+-----+-----+-----+-----+
							 *         |[0,0]|     |     |     | 4,0 |
							 *         +-----+-----+-----+-----+-----+
							 *                   South
							 */
							expect(actualPosition).toEqual(expected.position)
						},
					)
				})

				describe('Given a Est orientation', () => {
					const rover = new Rover({
						position: initialPosition,
						orientation: Orientation.Est(),
					})
					it.each([
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(1), y: Position.Y(0) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(1), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(2), y: Position.Y(0) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(2), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(3), y: Position.Y(0) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(3), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(4), y: Position.Y(0) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(4), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(0) }),
							}),
						},
					])(
						'Given the initial position `[$initial.position.x,$initial.position.y]`, it should move to `[$expected.position.x,$expected.position.y]`',
						({ initial, expected }) => {
							const { position: actualPosition } = move(
								initial,
								planet,
								Command.GoForward(),
							)

							/**
							 *                   North
							 *         +-----+-----+-----+-----+-----+
							 *         |     |     |     |     | 4,3 |
							 *         +-----+-----+-----+-----+-----+
							 *         |     |     |     |     |     |
							 *   West  +-----+-----+-----+-----+-----+  Est
							 *         |     |     |     |     |     |
							 *         +-----+-----+-----+-----+-----+
							 *         |[0,0]|[1,0]|[2,0]|[3,0]|[4,0]|
							 *         +-----+-----+-----+-----+-----+
							 *                   South
							 */
							expect(actualPosition).toEqual(expected.position)
						},
					)
				})

				describe.skip('Given a West orientation', () => {
					const rover = new Rover({
						position: initialPosition,
						orientation: Orientation.West(),
					})
					it.each([
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(4), y: Position.Y(0) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(4), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(3), y: Position.Y(0) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(3), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(2), y: Position.Y(0) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(2), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(1), y: Position.Y(0) }),
							}),
						},
						{
							initial: rover.clone({
								position: new Position({ x: Position.X(1), y: Position.Y(0) }),
							}),
							expected: rover.clone({
								position: new Position({ x: Position.X(0), y: Position.Y(0) }),
							}),
						},
					])(
						'Given the initial position `[$initial.position.x,$initial.position.y]`, it should move to `[$expected.position.x,$expected.position.y]`',
						({ initial, expected }) => {
							const { position: actualPosition } = move(
								initial,
								planet,
								Command.GoForward(),
							)

							/**
							 *                   North
							 *         +-----+-----+-----+-----+-----+
							 *         |     |     |     |     | 4,3 |
							 *         +-----+-----+-----+-----+-----+
							 *         |     |     |     |     |     |
							 *   West  +-----+-----+-----+-----+-----+  Est
							 *         |     |     |     |     |     |
							 *         +-----+-----+-----+-----+-----+
							 *         |[0,0]|[1,0]|[2,0]|[3,0]|[4,0]|
							 *         +-----+-----+-----+-----+-----+
							 *                   South
							 */
							expect(actualPosition).toEqual(expected.position)
						},
					)
				})
			})

			describe.todo('Should go backward')
		})
	})
})
