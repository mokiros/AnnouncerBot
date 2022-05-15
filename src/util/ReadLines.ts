import { readFileSync } from 'fs'

export default function ReadLines(file: string): string[] {
	const content = readFileSync(file, 'utf8')
	return content
		.split('\n')
		.map((line) => line.trim())
		.filter((v) => v !== '')
}
