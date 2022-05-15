export default class UserError extends Error {
	public readonly public: boolean

	constructor(message: string, pub?: boolean) {
		super(message)
		this.name = 'UserError'
		this.public = pub ?? false
	}
}
