import { describe, expect, it } from 'vitest'

import { Command } from './command.ts'
import { GridSize } from './grid-size.ts'
import { move } from './mod.ts'
import { Orientation } from './orientation.ts'
import { Planet } from './planet.ts'
import { Position } from './position.ts'
import { Rover } from './rover.ts'

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
			width: GridSize.Width(4),
			height: GridSize.Height(3),
		})
		const planet = new Planet({ size })

		const initialPosition = new Position({ x: Position.X(0), y: Position.Y(0) })
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
})
