import { defineConfig } from 'vitest/config';

export default defineConfig({

    test: {

        environment: 'node',
        include: ['**/*.test.ts'],
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
        setupFiles: ['./__tests__/vitest.setup.ts'],
        testTimeout: 30000,
        hookTimeout: 60000,
        coverage: {

            provider: 'v8',
            reporter: ['html'],

        },

    },

});
