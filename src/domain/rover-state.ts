import { Context, Data, Ref } from 'effect'

import type { Orientation } from './orientation.ts'
import type { Position } from './position.ts'

/**
 * Represents a Rover with a specific position and orientation.
 *
 * @template `position` - The current position of the rover in the environment.
 * @template `orientation` - The direction the rover is facing.
 */
export class RoverState extends Data.TaggedClass('RoverState')<{
	readonly position: Position
	readonly orientation: Orientation
}> {
	/**
	 * Creates a new Rover instance that is a clone of the current instance,
	 * optionally overriding position and orientation with provided values.
	 *
	 * @param params.position The optional new position to apply to the cloned Rover.
	 * @param params.orientation The optional new orientation to apply to the cloned Rover.
	 * @return A new Rover instance with the specified position and orientation, or
	 *         the original ones if not overridden.
	 * @param roverState
	 */
	public clone(
		roverState: {
			position?: Position
			orientation?: Orientation
		} = {},
	): RoverState {
		return !roverState
			? new RoverState(roverState)
			: new RoverState({
					position: this.position.clone(roverState.position),
					orientation: roverState.orientation
						? roverState.orientation
						: this.orientation,
				})
	}
}

export class RoverStateService extends Context.Tag('app/RoverStateService')<
	RoverStateService,
	Ref.Ref<RoverState>
>() {
	public static readonly Live: (
		rover: ConstructorParameters<typeof RoverState>[0],
	) => Ref.Ref<RoverState> = (rover) =>
		RoverStateService.of(Ref.unsafeMake(new RoverState(rover)))
}
