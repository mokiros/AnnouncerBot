import * as https from 'https'
import { URL } from 'url'
import UserError from './UserError'

export type ApiSuccessType<R> = {
	data: R
}

function apiGet<R, S = ApiSuccessType<R>>(url: string): Promise<S> {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				let data = ''
				res.on('data', (chunk) => {
					data += chunk
				})
				res.on('end', () => {
					data = data.replace('\uFEFF', '') // remove BOM
					try {
						if (res.statusCode === 200) {
							resolve(JSON.parse(data))
						} else {
							const err = JSON.parse(data)
							if (err.errors) {
								const firstError = err.errors[0]
								if (firstError) {
									return reject(new UserError(`Error ${firstError.code}: ${firstError.message}`))
								}
							}
							reject(new UserError(`Unknown error. Status code: ${res.statusCode}`))
						}
					} catch (err) {
						reject(err)
					}
				})
			})
			.on('error', (err) => {
				reject(err)
			})
	})
}

export type ThumbnailReturnType = {
	targetId: number
	state: 'Completed' | 'Error'
	imageUrl: string
}

export type UniverseDataReturnType = {
	id: number
	rootPlaceId: number
	name: string
	description: string
	sourceName: string
	sourceDescription: string
	creator: {
		id: number
		name: string
		type: 'Group' | 'User'
		isRNVAccount: boolean
	}
	price: number
	allowedGearGenres: string[]
	allowedGearCategories: string[]
	isGenreEnforced: boolean
	copyingAllowed: boolean
	playing: number
	visits: number
	maxPlayers: number
	created: string
	updated: string
	studioAccessToApisAllowed: boolean
	createVipServersAllowed: boolean
	universeAvatarType: string
	genre: string
	isAllGenre: boolean
	isFavoritedByUser: boolean
	favoritedCount: number
}

export type BadgeData = {
	id: number
	name: string
	description: string
	displayName: string
	displayDescription: string
	enabled: boolean
	iconImageId: number
	displayIconImageId: number
	created: string
	updated: string
	statistics: {
		pastDayAwardedCount: number
		awardedCount: number
		winRatePercentage: number
	}
	awardingUniverse: {
		id: number
		name: string
		rootPlaceId: number
	}
}

export async function getUniverseIcon(universeId: number): Promise<string> {
	const url = new URL('https://thumbnails.roblox.com/v1/games/icons')
	url.searchParams.append('universeIds', universeId.toString())
	url.searchParams.append('size', '512x512')
	url.searchParams.append('format', 'Png')
	url.searchParams.append('isCircular', 'false')
	const res = await apiGet<ThumbnailReturnType[]>(url.toString())
	const data = res.data[0]
	if (!data) {
		console.error(`No thumbnail found for universe ${universeId}. Request url: ${url}`)
		throw new UserError(`No thumbnail found for universe ${universeId}`)
	}
	return data.imageUrl
}

export async function getUniverseData(universeId: number): Promise<UniverseDataReturnType> {
	const url = new URL('https://games.roblox.com/v1/games')
	url.searchParams.append('universeIds', universeId.toString())
	const res = await apiGet<UniverseDataReturnType[]>(url.toString())
	const data = res.data[0]
	if (!data) {
		console.error(`No universe data found for universe ${universeId}. Request url: ${url}`)
		throw new UserError(`No universe data found for universe ${universeId}`)
	}
	return data
}

export async function getUniverseIdFromPlaceId(placeId: number): Promise<number> {
	const url = new URL('https://api.roblox.com/universes/get-universe-containing-place')
	url.searchParams.append('placeId', placeId.toString())
	const res = await apiGet<never, { UniverseId: number }>(url.toString())
	const data = res.UniverseId
	if (!data) {
		console.error(`No universe found for place ${placeId}. Request url: ${url}`)
		throw new UserError(`No universe found for place ${placeId}`)
	}
	return data
}

export async function getUserIdFromUsername(username: string): Promise<number> {
	const url = new URL('https://api.roblox.com/users/get-by-username')
	url.searchParams.append('username', username)
	const res = await apiGet<never, { Id: number }>(url.toString())
	const data = res.Id
	if (!data) {
		console.error(`No user found for username ${username}. Request url: ${url}`)
		throw new UserError(`No user found for username ${username}`)
	}
	return data
}

export async function getUsernameFromUserId(userId: number): Promise<string> {
	const url = new URL(`https://api.roblox.com/users/${userId}`)
	const res = await apiGet<never, { Username: string }>(url.toString())
	const data = res.Username
	if (!data) {
		console.error(`No username found for user ${userId}. Request url: ${url}`)
		throw new UserError(`No username found for user ${userId}`)
	}
	return data
}

export type BadgeInfo = readonly [id: number, name: string]
export async function getUniverseBadges(universeId: number): Promise<BadgeInfo[]> {
	const url = new URL(`https://badges.roblox.com/v1/universes/${universeId}/badges`)
	url.searchParams.append('limit', '100')
	url.searchParams.append('sortOrder', 'Asc')
	const res = await apiGet<BadgeData[]>(url.toString())
	const data = res.data.map<BadgeInfo>((badge) => [badge.id, badge.name])
	return data
}

export type AwardedBadge = readonly [id: number, name: string, awardedDate: Date]
export type UnawardedBadge = readonly [id: number, name: string, awardedDate: null]
export async function getAwardedBadges(
	userId: number,
	badges: BadgeInfo[],
): Promise<(AwardedBadge | UnawardedBadge)[]> {
	const url = new URL(`https://badges.roblox.com/v1/users/${userId}/badges/awarded-dates`)
	url.searchParams.append('badgeIds', badges.map((badge) => badge[0].toString()).join(','))
	const res = await apiGet<{ badgeId: number; awardedDate: string }[]>(url.toString())
	const awardedBadgesMap = new Map(
		res.data.map<[number, Date]>((badge) => [badge.badgeId, new Date(badge.awardedDate)]),
	)
	const awardedBadges = badges.map<AwardedBadge | UnawardedBadge>((badge) => [
		badge[0],
		badge[1],
		awardedBadgesMap.get(badge[0]) ?? null,
	])
	return awardedBadges
}

export async function checkAwardedBadges(userId: number, badges: number[]): Promise<boolean> {
	const url = new URL(`https://badges.roblox.com/v1/users/${userId}/badges/awarded-dates`)
	url.searchParams.append('badgeIds', badges.join(','))
	const res = await apiGet<{ badgeId: number; awardedDate: string }[]>(url.toString())
	return res.data.length === badges.length
}
