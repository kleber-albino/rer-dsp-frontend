<script setup lang="ts">
import { formatValue } from '@/utils/format'

defineProps<{
  title: string
  value: number
  unitOfMeasurement?: string
  optionalLabel?: string
  optionalValue?: number
  accentColor?: string
}>()
</script>

<template>
  <div class="br-card h-full w-full overflow-hidden rounded shadow-sm">
    <div
      class="flex min-h-[72px] items-center justify-center px-3 py-4 text-center text-white"
      :style="{ backgroundColor: accentColor || '#42916E' }"
    >
      <h2 class="text-base font-normal leading-snug">{{ title }}</h2>
    </div>
    <div class="flex flex-col items-center justify-center gap-1 bg-white px-3 py-4">
      <p class="text-xl text-gray-800">
        {{ formatValue(value) }}
        <span v-if="unitOfMeasurement" class="text-sm">{{ unitOfMeasurement }}</span>
      </p>
      <span
        v-if="optionalLabel !== undefined && optionalValue !== undefined"
        class="text-sm text-gray-500"
      >
        {{ formatValue(optionalValue) }} {{ optionalLabel }}
      </span>
    </div>
  </div>
</template>
