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
}> {
	/**
	 * Creates a new Rover instance that is a clone of the current instance,
	 * optionally overriding position and orientation with provided values.
	 *
	 * @param params An object containing optional properties to override the clone behavior.
	 * @param params.position The optional new position to apply to the cloned Rover.
	 * @param params.orientation The optional new orientation to apply to the cloned Rover.
	 * @return A new Rover instance with the specified position and orientation, or
	 *         the original ones if not overridden.
	 */
	public clone({
		position,
		orientation,
	}: {
		position?: Position
		orientation?: Orientation
	} = {}): Rover {
		return new Rover({
			position: this.position.clone(position),
			orientation: orientation ?? this.orientation,
		})
	}
}
