import * as https from 'https'
import { URL } from 'url'

export type ApiSuccessType<R> = {
	data: R
}

function apiGet<R>(url: string): Promise<ApiSuccessType<R>> {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				let data = ''
				res.on('data', (chunk) => {
					data += chunk
				})
				res.on('end', () => {
					if (res.statusCode === 200) {
						resolve(JSON.parse(data))
					} else {
						reject(JSON.parse(data))
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

export async function getUniverseIcon(universeId: number): Promise<string> {
	const url = new URL('https://thumbnails.roblox.com/v1/games/icons')
	url.searchParams.append('universeIds', universeId.toString())
	url.searchParams.append('size', '512x512')
	url.searchParams.append('format', 'Png')
	url.searchParams.append('isCircular', 'false')
	const res = await apiGet<ThumbnailReturnType[]>(url.toString())
	const data = res.data[0]
	if (!data) {
		throw `No thumbnail found for universe ${universeId}. Request url: ${url}`
	}
	return data.imageUrl
}

export async function getUniverseData(universeId: number): Promise<UniverseDataReturnType> {
	const url = new URL('https://games.roblox.com/v1/games')
	url.searchParams.append('universeIds', universeId.toString())
	const res = await apiGet<UniverseDataReturnType[]>(url.toString())
	const data = res.data[0]
	if (!data) {
		throw `No universe data found for universe ${universeId}. Request url: ${url}`
	}
	return data
}
