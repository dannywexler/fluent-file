import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        includeSource: ['src/**/*.{ts}'],
        testTimeout: 30_000,
    },
})
