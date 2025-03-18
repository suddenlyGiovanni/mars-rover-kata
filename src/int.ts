import { Schema } from 'effect'

export class Int extends Schema.Int.pipe(Schema.brand('Int')) {
	/**
	 * Adds two integers and returns the result.
	 *
	 * @param a The first integer to add.
	 * @param b The second integer to add.
	 * @return The sum of the two integers.
	 */
	public static add(a: Int.Type, b: Int.Type): Int.Type {
		return Int.make(a + b)
	}

	/**
	 * Subtracts the subtrahend from the minuend and returns the result as a new Int.Type.
	 *
	 * @param minuend - The number from which another number (subtrahend) will be subtracted.
	 * @param subtrahend - The number to subtract from the minuend.
	 * @return A new Int.Type representing the result of the subtraction.
	 */
	public static sub(minuend: Int.Type, subtrahend: Int.Type): Int.Type {
		return Int.make(minuend - subtrahend)
	}

	/**
	 * Represents a unit value of type `Int`.
	 *
	 * The `unit` variable is initialized using the `Int.make` function
	 * with a value of 1. It is commonly used in contexts where a
	 * standard or default unit value is required.
	 */
	static readonly unit: Int.Type = Int.make(1)
}

export declare namespace Int {
	export type Type = Schema.Schema.Type<typeof Int>
}
