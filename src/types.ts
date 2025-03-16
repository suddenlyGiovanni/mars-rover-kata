import { Schema } from 'effect'

export const Int = Schema.Int.pipe(Schema.brand('Int'))
export declare namespace Int {
	export type Type = Schema.Schema.Type<typeof Int>
}
