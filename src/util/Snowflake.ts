const epoch = BigInt(new Date('2022-01-01').getTime())
let counter = 0n

export type SnowflakeID = string

export default function Snowflake(timestamp?: Date): SnowflakeID {
	const t = BigInt(timestamp?.getTime() ?? Date.now())
	const id = ((t - epoch) << 4n) + counter++
	if (counter >= 2n ** 4n) {
		counter = 0n
	}
	return id.toString()
}
