import { ragService } from './ai/rag.service'

async function run() {
  const docs = await ragService.search(
    'What is our detention policy?'
  )

  console.log(JSON.stringify(docs, null, 2))
}

run()