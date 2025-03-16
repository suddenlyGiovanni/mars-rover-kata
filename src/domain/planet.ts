import { Data } from 'effect'
import type { GridSize } from './grid-size.ts'

/**
 * Represents a planet with specific size.
 *
 * The planet is divided into a grid with x (width) and y (height) size.
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
export class Planet extends Data.TaggedClass('Planet')<{
	readonly size: GridSize
}> {}
