<script setup lang="ts">
import type { ChatMessage } from '../composables/useChat'

defineProps<{
  message: ChatMessage
}>()
</script>

<template>
  <div class="chat-message" :class="message.role">
    <div class="bubble">
      <span class="role-label">{{ message.role === 'user' ? 'Εσύ' : 'Chef' }}</span>
      <div class="content" v-html="formatContent(message.content)" />
    </div>
  </div>
</template>

<script lang="ts">
function formatContent(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}
</script>

<style scoped>
.chat-message {
  display: flex;
  margin-bottom: var(--space-md);
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.assistant {
  justify-content: flex-start;
}

.bubble {
  max-width: 80%;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  line-height: 1.6;
}

.user .bubble {
  background: var(--color-primary);
  color: white;
  border-bottom-right-radius: var(--radius-sm);
}

.assistant .bubble {
  background: var(--color-surface);
  box-shadow: var(--shadow);
  border-bottom-left-radius: var(--radius-sm);
}

.role-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
  opacity: 0.7;
}

.content {
  font-size: 0.95rem;
  word-break: break-word;
}
</style>
