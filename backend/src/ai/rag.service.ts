import axios from 'axios'
import { pool } from '../db/client'
import {toVectorString} from '../utils/vector'

const OLLAMA_URL = 'http://127.0.0.1:11434'

export const ragService = {
  // ─────────────────────────────
  // STEP 1: embed query
  // ─────────────────────────────
  async embed(text: string) {
    const res = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
      model: 'nomic-embed-text',
      prompt: text,
    })

    return res.data.embedding
  },

  // ─────────────────────────────
  // STEP 2: search DB
  // ─────────────────────────────
 async search(query: string) {
  const embedding = await this.embed(query)
  console.log('Embedding length:', embedding.length)

  const vector = toVectorString(embedding)

  const result = await pool.query(
    `
    SELECT id, title, content,
           embedding <-> $1::vector AS distance
    FROM documents
    ORDER BY distance ASC
    LIMIT 5
    `,
    [vector]
  )

  return result.rows
},

  // ─────────────────────────────
  // STEP 3: generate final answer
  // ─────────────────────────────
  async generateAnswer(query: string, docs: any[]) {
    const context = docs
      .map((d) => `Title: ${d.title}\nContent: ${d.content}`)
      .join('\n\n---\n\n')

    const prompt = `
You are FreightFlow AI assistant.

Use ONLY the context below.

If not found, say "I don't have enough information."

----------------
CONTEXT:
${context}

QUESTION:
${query}
`

    const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama3',
      prompt,
      stream: false,
    })

    return res.data.response
  },
}