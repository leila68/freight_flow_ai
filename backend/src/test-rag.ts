import { ragService } from './ai/rag.service'

async function test() {
  const results = await ragService.searchDocuments(
    'Why are reefer shipping prices increasing?'
  )

  console.log(results)
}

test()