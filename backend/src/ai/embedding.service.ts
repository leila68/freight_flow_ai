import axios from 'axios'

const OLLAMA_URL = 'http://127.0.0.1:11434'

export const embeddingService = {
  async createEmbedding(text: string): Promise<number[]> {
    const res = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
      model: 'nomic-embed-text',
      prompt: text,
    })

    return res.data.embedding
  },
}