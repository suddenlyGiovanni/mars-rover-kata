import { Data, Schema } from 'effect'

import { Int } from './int.ts'

const X = Int.pipe(Schema.brand('X'))
const Y = Int.pipe(Schema.brand('Y'))

export declare namespace Position {
	export type X = Schema.Schema.Type<typeof X>
	export type Y = Schema.Schema.Type<typeof Y>
}

/**
 * The `Position` represents a coordinate pair with `x` and `y` values.
 */
export class Position extends Data.TaggedClass('Position')<{
	readonly x: Position.X
	readonly y: Position.Y
}> {
	/**
	 * Creates and returns a new instance of the Position object, optionally with updated coordinates.
	 *
	 * @param position Optional object with properties `x` and `y` that specify the new coordinates.
	 *                 If not provided, the current instance's coordinates are used.
	 * @return A new Position instance with the provided or existing coordinates.
	 */
	public clone(position?: {
		readonly x?: Position.X
		readonly y?: Position.Y
	}): Position {
		return new Position({ x: position?.x ?? this.x, y: position?.y ?? this.y })
	}

	/**
	 * A function `X` that constructs a `Position.X` value.
	 */
	public static readonly X: (
		int: number,
		options?: Schema.MakeOptions,
	) => Position.X = X.make

	/**
	 * Represents a function `Y` that constructs a `Position.Y` value.
	 */
	public static readonly Y: (
		int: number,
		options?: Schema.MakeOptions,
	) => Position.Y = Y.make
}
