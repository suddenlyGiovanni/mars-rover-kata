import { describe, expect, it } from 'vitest'

import { Int } from './int.ts'

describe('Int.modulus', () => {
	// Basic positive cases
	it('returns the same value when dividend is less than divisor', () => {
		expect(Int.modulus(Int.make(3), Int.make(5))).toEqual(Int.make(3))
		expect(Int.modulus(Int.make(0), Int.make(5))).toEqual(Int.make(0))
	})

	it('returns zero when dividend equals divisor', () => {
		expect(Int.modulus(Int.make(5), Int.make(5))).toEqual(Int.make(0))
	})

	it('returns the remainder when dividend is greater than divisor', () => {
		expect(Int.modulus(Int.make(7), Int.make(5))).toEqual(Int.make(2))
		expect(Int.modulus(Int.make(10), Int.make(5))).toEqual(Int.make(0))
	})

	// Negative dividend cases
	it('correctly handles negative dividends', () => {
		// -1 % 5 should be 4 (not -1 as in standard JS behavior)
		expect(Int.modulus(Int.make(-1), Int.make(5))).toEqual(Int.make(4))

		// -3 % 5 should be 2
		expect(Int.modulus(Int.make(-3), Int.make(5))).toEqual(Int.make(2))

		// -5 % 5 should be 0
		expect(Int.modulus(Int.make(-5), Int.make(5))).toEqual(Int.make(0))

		// -6 % 5 should be 4
		expect(Int.modulus(Int.make(-6), Int.make(5))).toEqual(Int.make(4))
	})

	// Boundary cases
	it('handles boundary cases correctly', () => {
		// Larger numbers
		expect(Int.modulus(Int.make(1000), Int.make(7))).toEqual(Int.make(6))

		// Negative number with larger absolute value than the divisor
		expect(Int.modulus(Int.make(-15), Int.make(7))).toEqual(Int.make(6))

		// Zero as dividend
		expect(Int.modulus(Int.make(0), Int.make(7))).toEqual(Int.make(0))
	})

	// Additional cases with various divisors
	it('works with different divisors', () => {
		// With divisor 5
		expect(Int.modulus(Int.make(-1), Int.make(5))).toEqual(Int.make(4))

		// With divisor 4
		expect(Int.modulus(Int.make(-1), Int.make(4))).toEqual(Int.make(3))
		expect(Int.modulus(Int.make(4), Int.make(4))).toEqual(Int.make(0))
	})
})
