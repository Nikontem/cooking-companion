<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useChat } from '../composables/useChat'
import ChatMessage from './ChatMessage.vue'

const props = defineProps<{
  recipeId: string
  recipeName: string
}>()

const { messages, isStreaming, error, sendMessage, clearChat } = useChat({
  recipeId: props.recipeId,
})

const isOpen = ref(false)
const input = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
}

async function handleSend() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  await sendMessage(text)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// Auto-scroll to bottom when messages change
watch(
  () => messages.value.length + (messages.value[messages.value.length - 1]?.content.length || 0),
  async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  },
)
</script>

<template>
  <div class="recipe-chat" :class="{ open: isOpen }">
    <!-- Toggle bar -->
    <button class="chat-toggle" @click="toggle">
      <span class="toggle-label">
        {{ isOpen ? 'Κλείσε Chat' : 'Ρώτα για αυτή τη συνταγή' }}
      </span>
      <span class="toggle-icon">{{ isOpen ? '&#9660;' : '&#9650;' }}</span>
    </button>

    <!-- Chat content (visible when open) -->
    <div v-show="isOpen" class="chat-body">
      <div class="chat-header-row">
        <span class="chat-context-label">Chat: {{ recipeName }}</span>
        <button v-if="messages.length" class="clear-btn" @click="clearChat">
          Καθαρισμός
        </button>
      </div>

      <div ref="messagesContainer" class="messages">
        <div v-if="messages.length === 0" class="empty-state">
          <p>Ρώτα οτιδήποτε για αυτή τη συνταγή!</p>
          <p class="hint">π.χ. "Μπορώ να αλλάξω κάτι;", "Πόση ώρα θέλει;", "Τι tips έχεις;"</p>
        </div>

        <ChatMessage
          v-for="(msg, i) in messages"
          :key="i"
          :message="msg"
        />

        <div v-if="isStreaming" class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div v-if="error" class="error-bar">
        {{ error }}
      </div>

      <div class="input-area">
        <textarea
          v-model="input"
          class="chat-input"
          :placeholder="isStreaming ? 'Περιμένω απάντηση...' : 'Γράψε ερώτηση...'"
          :disabled="isStreaming"
          rows="1"
          @keydown="handleKeydown"
        />
        <button
          class="send-btn"
          :disabled="!input.trim() || isStreaming"
          @click="handleSend"
        >
          Αποστολή
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipe-chat {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
}

.recipe-chat.open {
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}

.chat-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary);
  color: white;
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.chat-toggle:hover {
  background: var(--color-primary-light);
}

.toggle-icon {
  font-size: 0.7rem;
}

.chat-body {
  display: flex;
  flex-direction: column;
  max-height: 50vh;
}

.chat-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.chat-context-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.clear-btn {
  padding: var(--space-xs) var(--space-sm);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
}

.clear-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  min-height: 0;
}

.empty-state {
  text-align: center;
  padding: var(--space-lg) 0;
  color: var(--color-text-secondary);
}

.empty-state p {
  font-size: 1rem;
  margin-bottom: var(--space-xs);
}

.hint {
  font-size: 0.85rem !important;
  font-style: italic;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: var(--space-sm) var(--space-md);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.error-bar {
  background: #fdedec;
  color: var(--color-primary);
  padding: var(--space-sm) var(--space-md);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.input-area {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg);
  resize: none;
  outline: none;
  line-height: 1.5;
  min-height: 2.5rem;
  max-height: 6rem;
  font-family: inherit;
  font-size: 0.9rem;
}

.chat-input:focus {
  border-color: var(--color-primary);
}

.chat-input:disabled {
  opacity: 0.6;
}

.send-btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .chat-body {
    max-height: 65vh;
  }
}
</style>
