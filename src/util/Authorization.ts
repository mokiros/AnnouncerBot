import getenv from '../getenv'

const authorized_ids = getenv('AUTHORIZED_IDS')
	.split(',')
	.map((v) => v.trim())

export default function isAuthorized(id: string) {
	return authorized_ids.includes(id)
}
