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
	 * Calculates the mathematical modulus of two integers, ensuring the result is always non-negative.
	 *
	 * Unlike JavaScript's native % operator which returns negative results for negative dividends,
	 * this implementation always returns a non-negative result in the range [0, divisor-1].
	 * This is equivalent to the mathematical modulo operation.
	 *
	 * Formula: ((dividend % divisor) + divisor) % divisor
	 *
	 * @param dividend - The integer being divided
	 * @param divisor - The integer by which the dividend is divided
	 * @returns A non-negative integer representing the remainder in the range [0, divisor-1]
	 *
	 * @example
	 * ```ts
	 * Int.modulus(Int.make(7), Int.make(5)) // Returns Int.make(2)
	 * Int.modulus(Int.make(-1), Int.make(5)) // Returns Int.make(4) instead of -1
	 * ```
	 */
	public static modulus(dividend: Int.Type, divisor: Int.Type): Int.Type {
		return Int.make(((dividend % divisor) + divisor) % divisor)
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
