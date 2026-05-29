import { routeMessage } from './router.service'
import { aiService } from './ai.service'
import { sqlService } from './sql.service'
import { sqlGuard } from './sql.guard'

export const chatService = {
  async handleMessage({ message }: { message: string; sessionId?: string }) {

    const route = routeMessage(message)

    // ---------------- CHAT ----------------
    if (route === 'chat') {
      const response = await aiService.chat(message)

      return {
        type: 'chat',
        message: response,
      }
    }

    // ---------------- SQL ----------------
    if (route === 'sql') {
  const sql = await aiService.generateSQL(message)
  sqlGuard.validate(sql)
  const data = await sqlService.runQuery(sql)

  // Send data back to LLM to format as human-readable response
  const humanResponse = await aiService.formatDataAsMessage(message, data)

  return {
    type: 'sql',
    message: humanResponse,
    data,
  }
}

    // ---------------- RAG (future) ----------------
    return {
      type: 'rag',
      message: 'RAG not implemented yet',
    }
  },
}