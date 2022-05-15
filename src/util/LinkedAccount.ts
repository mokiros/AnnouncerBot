import getenv from '@util/GetEnv'
import https from 'https'
import { URL } from 'url'
import UserError from './UserError'

interface BloxlinkApiResponse {
	success: true
	user: {
		robloxId?: number
		primaryAccount?: number
	}
}

function request(id: string): Promise<BloxlinkApiResponse> {
	const key = getenv('BLOXLINK_API_KEY')
	const url = new URL(`https://v3.blox.link/developer/discord/${id}`)
	return new Promise((resolve, reject) => {
		https.get(
			url,
			{
				method: 'GET',
				headers: {
					'api-key': key,
				},
			},
			(res) => {
				let data = ''
				res.on('data', (chunk) => {
					data += chunk
				})
				res.on('end', () => {
					try {
						resolve(JSON.parse(data))
					} catch (err) {
						reject(err)
					}
				})
			},
		)
	})
}

export default async function GetLinkedAccount(id: string): Promise<number | undefined> {
	const data = await request(id)
	if (!data.success) {
		console.log(data)
		throw new UserError('Error while loading linked account')
	}
	const { primaryAccount } = data.user
	return primaryAccount
}
