import { Data } from 'effect'

import type { Orientation } from './orientation.ts'
import type { Position } from './position.ts'

/**
 * Represents a Rover with a specific position and orientation.
 *
 * @template `position` - The current position of the rover in the environment.
 * @template `orientation` - The direction the rover is facing.
 */
export class Rover extends Data.TaggedClass('Rover')<{
	readonly position: Position
	readonly orientation: Orientation
}> {}
