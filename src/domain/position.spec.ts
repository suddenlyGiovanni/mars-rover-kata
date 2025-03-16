import { Equal } from 'effect'
import { describe, expect, it } from 'vitest'

import { Position } from './position.ts'

describe('Position', () => {
	describe('.clone', () => {
		const initialPosition = new Position({
			x: Position.X(10),
			y: Position.Y(20),
		})

		it('should clone Position with the same x and y values if no new values are provided', () => {
			const clonedPosition = initialPosition.clone()

			expect(clonedPosition).not.toBe(initialPosition) // Ensure it's a new object
			expect(Equal.equals(clonedPosition, initialPosition)).toBe(true) // Ensure values are the same
		})

		it('should clone Position with updated x value if new x is provided', () => {
			const newX = Position.X(50)
			const clonedPosition = initialPosition.clone({ x: newX })

			expect(clonedPosition).not.toBe(initialPosition) // Ensure it's a new object
			expect(clonedPosition.x).toBe(newX) // Ensure x is updated
			expect(clonedPosition.y).toBe(initialPosition.y) // Ensure y is unchanged
		})

		it('should clone Position with updated y value if new y is provided', () => {
			const newY = Position.Y(50)
			const clonedPosition = initialPosition.clone({ y: newY })

			expect(clonedPosition).not.toBe(initialPosition) // Ensure it's a new object
			expect(clonedPosition.x).toBe(initialPosition.x) // Ensure x is unchanged
			expect(clonedPosition.y).toBe(newY) // Ensure y is updated
		})

		it('should clone Position with updated x and y values if both new values are provided', () => {
			const newX = Position.X(30)
			const newY = Position.Y(40)
			const clonedPosition = initialPosition.clone({ x: newX, y: newY })

			expect(clonedPosition).not.toBe(initialPosition) // Ensure it's a new object
			expect(clonedPosition.x).toBe(newX) // Ensure x is updated
			expect(clonedPosition.y).toBe(newY) // Ensure y is updated
		})
	})
})
