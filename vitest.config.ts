import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/features/inventory/useInventory.ts',
        'src/store/authStore.ts',
        'src/store/householdStore.ts',
        'src/features/recipes/hooks/useRecipes.ts',
      ],
    },
  },
});
