import { HashSet } from 'effect'
import { describe, expect, it } from 'vitest'

import { GridSize } from './grid-size.ts'
import { Planet } from './planet.ts'
import { Position } from './position.ts'

describe('Planet', () => {
	describe('constructor', () => {
		it('creates an instance with given size and empty obstacles', () => {
			const size = new GridSize({
				width: GridSize.Width(5),
				height: GridSize.Height(4),
			})
			const obstacles = HashSet.make<Position[]>()
			const planet = new Planet({
				size,
				obstacles,
			})

			expect(planet.size).toBe(size)
			expect(planet.obstacles).toBe(obstacles)
		})

		it('creates an instance with given size and obstacles', () => {
			const size = new GridSize({
				width: GridSize.Width(5),
				height: GridSize.Height(4),
			})

			const position1 = new Position({ x: Position.X(1), y: Position.Y(1) })
			const position2 = new Position({ x: Position.X(2), y: Position.Y(2) })
			const obstacles = HashSet.make(position1, position2)

			const planet = new Planet({
				size,
				obstacles,
			})

			expect(planet.size).toBe(size)
			expect(planet.obstacles).toBe(obstacles)
			expect(HashSet.has(planet.obstacles, position1)).toBe(true)
			expect(HashSet.has(planet.obstacles, position2)).toBe(true)
		})
	})

	describe('clone', () => {
		it('creates a copy with the same size and obstacles when no parameters are provided', () => {
			const size = new GridSize({
				width: GridSize.Width(5),
				height: GridSize.Height(4),
			})
			const obstacles = HashSet.make<Position[]>()
			const planet = new Planet({
				size,
				obstacles,
			})

			const clonedPlanet = planet.clone()

			expect(clonedPlanet.size).toBe(size)
			expect(clonedPlanet.obstacles).toBe(obstacles)
		})

		it('creates a copy with a new size when size is provided', () => {
			const originalSize = new GridSize({
				width: GridSize.Width(5),
				height: GridSize.Height(4),
			})
			const obstacles = HashSet.make<Position[]>()
			const planet = new Planet({
				size: originalSize,
				obstacles,
			})

			const newWidth = GridSize.Width(10)
			const clonedPlanet = planet.clone({
				size: { width: newWidth },
			})

			expect(clonedPlanet.size.width).toBe(newWidth)
			expect(clonedPlanet.size.height).toBe(originalSize.height)
			expect(clonedPlanet.obstacles).toBe(obstacles)
		})

		it('creates a copy with new obstacles when obstacles are provided', () => {
			const size = new GridSize({
				width: GridSize.Width(5),
				height: GridSize.Height(4),
			})
			const originalObstacles = HashSet.make<Position[]>()
			const planet = new Planet({
				size,
				obstacles: originalObstacles,
			})

			const position = new Position({ x: Position.X(1), y: Position.Y(1) })
			const newObstacles = HashSet.make(position)
			const clonedPlanet = planet.clone({
				obstacles: newObstacles,
			})

			expect(clonedPlanet.size).toBe(size)
			expect(clonedPlanet.obstacles).toBe(newObstacles)
			expect(HashSet.has(clonedPlanet.obstacles, position)).toBe(true)
		})

		it('creates a copy with both new size and obstacles when both are provided', () => {
			const originalSize = new GridSize({
				width: GridSize.Width(5),
				height: GridSize.Height(4),
			})
			const originalObstacles = HashSet.make<Position[]>()
			const planet = new Planet({
				size: originalSize,
				obstacles: originalObstacles,
			})

			const newWidth = GridSize.Width(10)
			const newHeight = GridSize.Height(8)
			const position = new Position({ x: Position.X(1), y: Position.Y(1) })
			const newObstacles = HashSet.make(position)

			const clonedPlanet = planet.clone({
				size: { width: newWidth, height: newHeight },
				obstacles: newObstacles,
			})

			expect(clonedPlanet.size.width).toBe(newWidth)
			expect(clonedPlanet.size.height).toBe(newHeight)
			expect(clonedPlanet.obstacles).toBe(newObstacles)
			expect(HashSet.has(clonedPlanet.obstacles, position)).toBe(true)
		})
	})
})
