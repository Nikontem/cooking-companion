<script setup lang="ts">
import type { Step } from '../types'
import HeatBadge from './HeatBadge.vue'

defineProps<{
  step: Step
}>()
</script>

<template>
  <div class="step-card">
    <div class="step-header">
      <span class="step-number">{{ step.order }}</span>
      <h4 class="step-title">{{ step.title }}</h4>
    </div>

    <p class="instruction">{{ step.instruction }}</p>

    <div class="step-meta">
      <HeatBadge
        v-if="step.heat_setting?.level || step.heat_setting?.label"
        :heat="step.heat_setting"
      />

      <span v-if="step.duration?.minutes" class="duration">
        {{ step.duration.minutes }} λεπτά
      </span>
    </div>

    <p v-if="step.duration?.until" class="sensory-cue">
      {{ step.duration.until }}
    </p>

    <div v-if="step.ingredients_used?.length" class="ingredients-used">
      <span
        v-for="ing in step.ingredients_used"
        :key="ing"
        class="ing-pill"
      >{{ ing }}</span>
    </div>

    <div v-if="step.tips?.length" class="tips">
      <p v-for="(tip, i) in step.tips" :key="i" class="tip">{{ tip }}</p>
    </div>
  </div>
</template>

<style scoped>
.step-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: var(--space-lg);
  box-shadow: var(--shadow);
}

.step-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-title {
  font-size: 1.05rem;
  font-weight: 600;
}

.instruction {
  color: var(--color-text);
  line-height: 1.7;
  margin-bottom: var(--space-sm);
}

.step-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-bottom: var(--space-sm);
}

.duration {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.sensory-cue {
  font-style: italic;
  color: var(--color-olive);
  font-size: 0.9rem;
  margin-bottom: var(--space-sm);
}

.ingredients-used {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.ing-pill {
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 500;
}

.tips {
  background: #fef9e7;
  border-left: 3px solid var(--color-warm);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
}

.tip {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.tip + .tip {
  margin-top: var(--space-xs);
}
</style>
