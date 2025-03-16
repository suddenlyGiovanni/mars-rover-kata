import { Data } from 'effect'

/**
 * Represents an orientation as a tagged enumerated type.
 *
 * This type defines four possible orientations: North, Est, West, and South,
 *
 * It can be used to describe directional properties or situations in systems
 * requiring orientation-based logic.
 */
export type Orientation = Data.TaggedEnum<{
	North: object
	Est: object
	West: object
	South: object
}>

export const { North, Est, West, South } = Data.taggedEnum<Orientation>()
