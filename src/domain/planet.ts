import { Context, Data, type HashSet } from 'effect'

import type { GridSize } from './grid-size.ts'
import type { Position } from './position.ts'

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
	readonly obstacles: HashSet.HashSet<Position>
}> {
	/**
	 * Creates a copy of the current Planet instance with the option to override certain properties.
	 *
	 * @param planet Optional parameter to specify properties for the cloned Planet instance.
	 *        - size: An optional partial GridSize object to override the size of the Planet.
	 *        - obstacles: An optional HashSet of Position objects to override the obstacles of the Planet.
	 * @return A new Planet instance based on the current one with optional overridden properties applied.
	 */
	public clone(planet?: {
		size?: Partial<GridSize>
		obstacles?: HashSet.HashSet<Position>
	}): Planet {
		return planet
			? new Planet({
					size: planet.size ? this.size.clone(planet.size) : this.size,
					obstacles: planet.obstacles ? planet.obstacles : this.obstacles,
				})
			: new Planet({
					size: this.size,
					obstacles: this.obstacles,
				})
	}
}

export class PlanetService extends Context.Tag('app/PlanetService')<
	PlanetService,
	Planet
>() {}
