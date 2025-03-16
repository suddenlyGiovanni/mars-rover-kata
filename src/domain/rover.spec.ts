import { describe, expect, it } from 'vitest'
import { Orientation } from './orientation.ts'
import { Position } from './position.ts'
import { Rover } from './rover.ts'

describe('Rover', () => {
	describe('.clone', () => {
		const originalPosition = new Position({
			x: Position.X(1),
			y: Position.Y(2),
		})

		const originalOrientation = Orientation.North()
		const originalRover = new Rover({
			position: originalPosition,
			orientation: originalOrientation,
		})

		it('should create an exact clone of the rover when no parameters are provided', () => {
			const clonedRover = originalRover.clone()

			expect(clonedRover).not.toBe(originalRover)
			expect(clonedRover.position).not.toBe(originalRover.position)
			expect(clonedRover.position).toEqual(originalRover.position)
			expect(clonedRover.orientation).toBe(originalRover.orientation)
		})

		it('should override the position while cloning if a new position is provided', () => {
			const newPosition = new Position({
				x: Position.X(10),
				y: Position.Y(20),
			})

			const clonedRover = originalRover.clone({ position: newPosition })

			expect(clonedRover).not.toBe(originalRover)
			expect(clonedRover.position).toEqual(newPosition)
			expect(clonedRover.orientation).toBe(originalRover.orientation)
		})

		it('should override the orientation while cloning if a new orientation is provided', () => {
			const newOrientation = Orientation.South()

			const clonedRover = originalRover.clone({ orientation: newOrientation })

			expect(clonedRover).not.toBe(originalRover)
			expect(clonedRover.position).not.toBe(originalRover.position)
			expect(clonedRover.position).toEqual(originalRover.position)
			expect(clonedRover.orientation).toBe(newOrientation)
		})

		it('should override both position and orientation if both are provided', () => {
			const newPosition = new Position({
				x: Position.X(10),
				y: Position.Y(20),
			})

			const newOrientation = Orientation.South()

			const clonedRover = originalRover.clone({
				position: newPosition,
				orientation: newOrientation,
			})

			expect(clonedRover).not.toBe(originalRover)
			expect(clonedRover.position).toEqual(newPosition)
			expect(clonedRover.orientation).toBe(newOrientation)
		})

		it('should handle partial nested updates in position if supported', () => {
			const newPositionPartial = { x: Position.X(10) }

			const clonedRover = originalRover.clone({
				position: originalPosition.clone(newPositionPartial),
			})

			expect(clonedRover).not.toBe(originalRover)
			expect(clonedRover.position).toHaveProperty('x', newPositionPartial.x)
			expect(clonedRover.position).toHaveProperty('y', 2)

			expect(clonedRover.orientation).toBe(originalRover.orientation)
		})

		it('should return a clone identical to the original when undefined is passed', () => {
			const clonedRover = originalRover.clone({
				position: undefined,
				orientation: undefined,
			})

			expect(clonedRover).not.toBe(originalRover)
			expect(clonedRover.position).not.toBe(originalRover.position)
			expect(clonedRover.position).toEqual(originalRover.position)
			expect(clonedRover.orientation).toBe(originalRover.orientation)
		})
	})
})
