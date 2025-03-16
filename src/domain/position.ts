import { Data, Schema } from 'effect'
import { Int } from '../types.ts'

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
