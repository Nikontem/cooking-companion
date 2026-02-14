import { ref } from 'vue'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useChat(config?: { recipeId?: string }) {
  const messages = ref<ChatMessage[]>([])
  const isStreaming = ref(false)
  const error = ref<string | null>(null)

  async function sendMessage(
    text: string,
    options?: { provider?: string; model?: string },
  ) {
    if (!text.trim() || isStreaming.value) return

    error.value = null
    messages.value.push({ role: 'user', content: text.trim() })

    // Add a placeholder assistant message that we'll stream into
    const assistantMessage: ChatMessage = { role: 'assistant', content: '' }
    messages.value.push(assistantMessage)

    isStreaming.value = true

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.value.slice(0, -1), // Send all except the empty assistant placeholder
          provider: options?.provider,
          model: options?.model,
          recipe_id: config?.recipeId,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(body.error || `HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantMessage.content += chunk
        // Trigger Vue reactivity by replacing the last message
        messages.value = [...messages.value.slice(0, -1), { ...assistantMessage }]
      }
    } catch (e) {
      error.value = (e as Error).message
      // Remove the empty assistant placeholder if there's an error
      if (assistantMessage.content === '') {
        messages.value = messages.value.slice(0, -1)
      }
    } finally {
      isStreaming.value = false
    }
  }

  function clearChat() {
    messages.value = []
    error.value = null
  }

  return { messages, isStreaming, error, sendMessage, clearChat }
}
