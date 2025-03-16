import { defineConfig } from 'vitest/config'
import deno from "@deno/vite-plugin"

export default defineConfig({
	plugins: [deno()],
	test: {
		includeSource: ['src/**/*.ts'],
		include: ['src/**/*.{spec,test}.ts'],
	},
})
