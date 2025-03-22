import { describe, expect, it } from 'vitest'

import { GridSize } from './grid-size.ts'

describe('GridSize', () => {
	describe('constructor', () => {
		it('creates an instance with given width and height', () => {
			const width = GridSize.Width(5)
			const height = GridSize.Height(4)
			const gridSize = new GridSize({
				width,
				height,
			})

			expect(gridSize.width).toBe(width)
			expect(gridSize.height).toBe(height)
		})
	})

	describe('clone', () => {
		it('creates a copy with the same width and height', () => {
			const width = GridSize.Width(5)
			const height = GridSize.Height(4)
			const gridSize = new GridSize({
				width,
				height,
			})

			const clonedGridSize = gridSize.clone()

			expect(clonedGridSize.width).toBe(width)
			expect(clonedGridSize.height).toBe(height)
		})

		it('creates a copy with a new width', () => {
			const originalWidth = GridSize.Width(5)
			const newWidth = GridSize.Width(10)
			const height = GridSize.Height(4)
			const gridSize = new GridSize({
				width: originalWidth,
				height,
			})

			const updatedGridSize = gridSize.clone({ width: newWidth })

			expect(updatedGridSize.width).toBe(newWidth)
			expect(updatedGridSize.height).toBe(height)
		})

		it('creates a copy with a new height', () => {
			const width = GridSize.Width(5)
			const originalHeight = GridSize.Height(4)
			const newHeight = GridSize.Height(8)
			const gridSize = new GridSize({
				width,
				height: originalHeight,
			})

			const updatedGridSize = gridSize.clone({ height: newHeight })

			expect(updatedGridSize.width).toBe(width)
			expect(updatedGridSize.height).toBe(newHeight)
		})

		it('creates a copy with both new width and height', () => {
			const originalWidth = GridSize.Width(5)
			const originalHeight = GridSize.Height(4)
			const newWidth = GridSize.Width(10)
			const newHeight = GridSize.Height(8)
			const gridSize = new GridSize({
				width: originalWidth,
				height: originalHeight,
			})

			const updatedGridSize = gridSize.clone({
				width: newWidth,
				height: newHeight,
			})

			expect(updatedGridSize.width).toBe(newWidth)
			expect(updatedGridSize.height).toBe(newHeight)
		})
	})
})
