<script setup lang="ts">
import { computed } from 'vue'
import type { HeatSetting } from '../types'

const props = defineProps<{
  heat: HeatSetting
}>()

const heatClass = computed(() => {
  const label = props.heat.label
  if (!label) return 'heat-unknown'
  if (label === 'κλειστή') return 'heat-off'
  if (label === 'πολύ χαμηλή' || label === 'χαμηλή') return 'heat-low'
  if (label === 'μέτρια-χαμηλή' || label === 'μέτρια') return 'heat-medium'
  if (label === 'μέτρια-δυνατή' || label === 'δυνατή') return 'heat-high'
  if (label === 'MAX') return 'heat-max'
  return 'heat-unknown'
})
</script>

<template>
  <span class="heat-badge" :class="heatClass">
    <span v-if="heat.level" class="level">{{ heat.level }}</span>
    <span v-if="heat.label" class="label">{{ heat.label }}</span>
  </span>
</template>

<style scoped>
.heat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.level {
  font-weight: 700;
}

.heat-off {
  background: #eee;
  color: #888;
}

.heat-low {
  background: #ebf5fb;
  color: var(--heat-low);
}

.heat-medium {
  background: #fef5e7;
  color: #d68910;
}

.heat-high {
  background: #fdedec;
  color: var(--heat-high);
}

.heat-max {
  background: #f4ecf7;
  color: var(--heat-max);
}

.heat-unknown {
  background: var(--color-tag-bg);
  color: var(--color-text-secondary);
}
</style>
