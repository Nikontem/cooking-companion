<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useChat } from '../composables/useChat'
import ChatMessage from '../components/ChatMessage.vue'

const { messages, isStreaming, error, sendMessage, clearChat } = useChat()

const input = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

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
  <div class="chat-view">
    <div class="chat-header">
      <h1 class="page-title">Chat</h1>
      <button v-if="messages.length" class="clear-btn" @click="clearChat">
        Καθαρισμός
      </button>
    </div>

    <div ref="messagesContainer" class="messages">
      <div v-if="messages.length === 0" class="empty-state">
        <p>Ρώτησε οτιδήποτε για μαγειρική!</p>
        <p class="hint">π.χ. "Τι συνταγές έχεις;", "Ψάξε μου κάτι με φακές", "Τι έχω στην αποθήκη μου;"</p>
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
        :placeholder="isStreaming ? 'Περιμένω απάντηση...' : 'Γράψε μήνυμα...'"
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
</template>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
}

.clear-btn {
  padding: var(--space-xs) var(--space-md);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.clear-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md) 0;
  min-height: 0;
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl) 0;
  color: var(--color-text-secondary);
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: var(--space-sm);
}

.hint {
  font-size: 0.9rem !important;
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
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  margin-bottom: var(--space-sm);
  flex-shrink: 0;
}

.input-area {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md) 0;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  resize: none;
  outline: none;
  line-height: 1.5;
  min-height: 2.5rem;
  max-height: 8rem;
}

.chat-input:focus {
  border-color: var(--color-primary);
}

.chat-input:disabled {
  opacity: 0.6;
}

.send-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.send-btn:disabled {
  opacity: 0.5;
}
</style>
