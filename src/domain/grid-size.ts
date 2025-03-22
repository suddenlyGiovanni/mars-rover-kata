import { Data, Schema } from 'effect'

import { Int } from '../int.ts'

const Width = Int.pipe(Schema.brand('Width'))
const Height = Int.pipe(Schema.brand('Height'))

export declare namespace GridSize {
	export type Width = Schema.Schema.Type<typeof Width>
	export type Height = Schema.Schema.Type<typeof Height>
}

/**
 * Represents the dimensions of a grid with fixed width and height properties.
 *
 * This class is a tagged class extension providing a structured way to define
 * and work with grid dimensions. Instances of GridSize are immutable, with
 * `width` and `height` being read-only.
 *
 * The width represents the number of horizontal units in the grid.
 * The height represents the number of vertical units in the grid.
 *
 * Example 5x4 grid with coordinates:
 *
 *                     North
 *           +-----+-----+-----+-----+-----+
 *           | 0,3 | 1,3 | 2,3 | 3,3 | 4,3 |
 *           +-----+-----+-----+-----+-----+
 *           | 0,2 | 1,2 | 2,2 | 3,2 | 4,2 |
 *     West  +-----+-----+-----+-----+-----+  East
 *           | 0,1 | 1,1 | 2,1 | 3,1 | 4,1 |
 *           +-----+-----+-----+-----+-----+
 *           | 0,0 | 1,0 | 2,0 | 3,0 | 4,0 |
 *           +-----+-----+-----+-----+-----+
 *                     South
 */
export class GridSize extends Data.TaggedClass('GridSize')<{
	readonly width: GridSize.Width
	readonly height: GridSize.Height
}> {
	/**
	 * Height constructor
	 */
	public static readonly Height: (
		int: number,
		options?: Schema.MakeOptions,
	) => GridSize.Height = Height.make
	/**
	 * Width constructor
	 */
	public static readonly Width: (
		int: number,
		options?: Schema.MakeOptions,
	) => GridSize.Width = Width.make

	/**
	 * Creates a new instance of GridSize, optionally modifying its width and/or height properties.
	 *
	 * @param gridSize - An optional object specifying new width and/or height values for the cloned GridSize.
	 *                   - width: The new width value. If not provided, the width of the current instance is used.
	 *                   - height: The new height value. If not provided, the height of the current instance is used.
	 * @return A new GridSize instance with the specified or existing width and height values.
	 *
	 * @example
	 * ```ts
	 * // Create initial GridSize instance
	 * const grid = new GridSize({
	 *   width: GridSize.Width(5),
	 *   height: GridSize.Height(4)
	 * });
	 *
	 * // Clone with no changes (creates exact copy)
	 * const copy = grid.clone();
	 *
	 * // Clone with new width only
	 * const wider = grid.clone({ width: GridSize.Width(10) });
	 *
	 * // Clone with new height only
	 * const taller = grid.clone({ height: GridSize.Height(8) });
	 *
	 * // Clone with both new width and height
	 * const bigger = grid.clone({
	 *   width: GridSize.Width(10),
	 *   height: GridSize.Height(8)
	 * });
	 * ```
	 */
	public clone(gridSize?: {
		readonly width?: GridSize.Width
		readonly height?: GridSize.Height
	}): GridSize {
		return gridSize
			? new GridSize({
					width: gridSize.width ? gridSize.width : this.width,
					height: gridSize.height ? gridSize.height : this.height,
				})
			: new GridSize({
					width: this.width,
					height: this.height,
				})
	}
}
