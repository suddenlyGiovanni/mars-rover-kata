import { Data } from 'effect'

/**
 * Commands represent all the possible movement actions that a Rover can perform.
 */
export type Command = Data.TaggedEnum<{
	TurnLeft: object
	TurnRight: object
	GoForward: object
	GoBackward: object
}>

export const Command = Data.taggedEnum<Command>()
