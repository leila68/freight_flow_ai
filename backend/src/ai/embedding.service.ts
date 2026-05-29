import axios from 'axios'

const OLLAMA_URL = 'http://127.0.0.1:11434'

export const embeddingService = {
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await axios.post(
      `${OLLAMA_URL}/api/embeddings`,
      {
        model: 'mxbai-embed-large',
        prompt: text,
      }
    )

    return response.data.embedding
  },
}