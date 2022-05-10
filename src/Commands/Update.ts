import DiscordClient from '../client'
import { UserError } from '../util'
import { isAuthorized } from '../util'
import Command from './Command'
import { exec, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

function runCommand(cmd: string): Promise<void> {
	return new Promise((resolve, reject) => {
		exec(cmd, (err, stdout, stderr) => {
			console.log(stdout)
			if (err) {
				console.error(stderr)
				return reject(err)
			}
			resolve()
		})
	})
}

const updateCommands = ['git pull', 'npm install', 'npm run build']

const updateDataPath = path.resolve('updateData.json')
const updateDataExists = fs.existsSync(updateDataPath)
if (updateDataExists) {
	const updateData = fs.readFileSync(updateDataPath, 'utf8')
	const data = JSON.parse(updateData)
	fs.rmSync(updateDataPath)
	DiscordClient.fetchWebhook(data.id, data.token).then((webhook) => {
		const _t = Date.now() - data.time
		const _t2 = Date.now() - data.startTime
		webhook.editMessage('@original', {
			content: `${data.str} ✅ ${_t}ms\nBot updated successfully in ${_t2}ms`,
		})
	})
}

const UpdateCommand: Command = {
	local: false,
	name: 'update',
	description: 'Update the bot',
	defaultPermission: true,
	handler: async (interaction) => {
		if (!isAuthorized(interaction.user.id)) {
			throw new UserError('You are not authorized to use this command.')
		}
		const timings: number[] = []
		const getstr = () => {
			let str = ''
			for (let i = 0; i < updateCommands.length; i++) {
				const cmd = updateCommands[i]
				const t = timings[i]
				if (t) {
					str += `Running ${cmd}\u2026 ✅ ${t}ms\n`
				} else {
					str += `Running ${cmd}\u2026\n`
				}
			}
			return str
		}
		let replyPromise: Promise<unknown> = interaction.reply({
			content: getstr(),
			ephemeral: false,
			fetchReply: false,
		})
		const startTime = Date.now()
		let _t = Date.now()
		for (let i = 0; i < updateCommands.length; i++) {
			const cmd = updateCommands[i]
			await runCommand(cmd)
			timings.push(Date.now() - _t)
			await replyPromise
			replyPromise = interaction.editReply({
				content: getstr(),
			})
			_t = Date.now()
		}
		await replyPromise
		const str = getstr() + 'Restarting bot process\u2026 '
		await interaction.editReply({
			content: str,
		})
		const data = {
			id: interaction.webhook.id,
			token: interaction.webhook.token,
			time: Date.now(),
			str,
			startTime,
		}
		fs.writeFileSync(updateDataPath, JSON.stringify(data))
		spawn('npm', ['run', 'pm2'], {
			cwd: process.cwd(),
			detached: true,
			stdio: 'inherit',
		})
		process.exit(0)
	},
}

export default UpdateCommand
