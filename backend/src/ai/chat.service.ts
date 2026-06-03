import { ragService } from './rag.service'
import { sqlService } from './sql.service'
import { aiService } from './ai.service'

export const chatService = {
  async handleMessage(input: any) {
    const message =
      typeof input === 'string'
        ? input
        : input?.message || input?.content || ''

    if (!message) {
      throw new Error('Empty message received')
    }

    const lower = message.toLowerCase()

    // ─────────────────────────────
    // STEP 1: SQL ROUTING (STRICT)
    // ─────────────────────────────

    const isSQL =
      /\b(lane|quote|quotes|equipment|accessorial|rate|pricing)\b/.test(lower)

    // ─────────────────────────────
    // STEP 2A: SQL PATH
    // ─────────────────────────────
    if (isSQL) {
      const sql = await aiService.generateSQL(message)

      const cleanedSql = sql
        .replace(/```sql|```/g, '')
        .trim()

      const result = await sqlService.runQuery(cleanedSql)

      return {
        type: 'sql',
        message: result,
      }
    }

    // ─────────────────────────────
    // STEP 2B: RAG PATH
    // ─────────────────────────────
    const docs = await ragService.search(message)

    console.log('DOCS FOUND:', docs.length)

    const answer = await ragService.generateAnswer(message, docs)

    console.log('ANSWER GENERATED:')
    console.log(answer)

    return {
  message: answer,
  sources: docs,
  type: 'rag',
}
  },
}