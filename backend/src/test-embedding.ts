import { embeddingService } from './ai/embedding.service'

async function test() {
  const embedding = await embeddingService.createEmbedding(
    'FreightFlow reefer pricing'
  )

  console.log('Embedding length:', embedding.length)
  console.log(embedding.slice(0, 5))
}

test()