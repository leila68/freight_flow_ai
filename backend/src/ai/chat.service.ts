import { routeMessage } from './router.service'
import { aiService } from './ai.service'

export const chatService = {
  async handleMessage({
    message,
  }: {
    message: string
    sessionId?: string
  }) {

    const route = routeMessage(message)

    // ─────────────────────────────
    // CHAT MODE (REAL AI)
    // ─────────────────────────────
    if (route === 'chat') {
      try {
        const aiResponse = await aiService.chat(message)

        return {
          type: 'chat',
          message: aiResponse,
        }
      } catch (error: any) {
        console.error('OpenAI Error:', error)

        return {
          type: 'chat',
          message:
            'AI service is temporarily unavailable. Please try again later.',
        }
      }
    }
    // ─────────────────────────────
    // SQL MODE (NEXT STEP)
    // ─────────────────────────────
    if (route === 'sql') {
      return {
        type: 'sql',
        message: 'SQL engine next step (we will build SQL generator next)',
      }
    }

    // ─────────────────────────────
    // RAG MODE (NEXT STEP)
    // ─────────────────────────────
    return {
      type: 'rag',
      message: 'RAG engine next step (pgvector integration next)',
    }
  },
}