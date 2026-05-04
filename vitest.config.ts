import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    coverage: {
      include: [
        'src/App.tsx',
        'src/config/**/*.ts',
        'src/hooks/useDevices.ts',
        'src/hooks/useEnergyData.ts',
        'src/hooks/useRooms.ts',
        'src/hooks/useRules.ts',
        'src/hooks/useSchedules.ts',
        'src/services/deviceService.ts',
        'src/services/energyService.ts',
        'src/services/logService.ts',
        'src/services/ruleService.ts',
        'src/services/scheduleService.ts',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
      ],
      reporter: ['text', 'lcov', 'json-summary'],
    },
  },
})
