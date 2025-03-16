import { Data, Schema } from 'effect'

import { Int } from '../types.ts'

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
	 * Width constructor
	 */
	public static readonly Width: (
		int: number,
		options?: Schema.MakeOptions,
	) => GridSize.Width = Width.make

	/**
	 * Height constructor
	 */
	public static readonly Height: (
		int: number,
		options?: Schema.MakeOptions,
	) => GridSize.Height = Height.make
}
