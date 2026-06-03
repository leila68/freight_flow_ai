import fs from 'fs'
import path from 'path'
import { pool } from '../db/client'
import { embeddingService } from './embedding.service'

const DOCUMENTS_DIR = path.join(process.cwd(), 'documents')

async function ingestDocuments() {
  try {
    const files = fs.readdirSync(DOCUMENTS_DIR)

    for (const file of files) {
      if (!file.endsWith('.txt')) continue

      const filePath = path.join(DOCUMENTS_DIR, file)
      const content = fs.readFileSync(filePath, 'utf8')

      // 1. Create embedding
      const embedding = await embeddingService.createEmbedding(content)

      // 2. Safety check (VERY IMPORTANT)
      if (!embedding || embedding.length === 0) {
        throw new Error(`Empty embedding for file: ${file}`)
      }

      if (embedding.length !== 768) {
        throw new Error(
          `Invalid embedding size for ${file}: ${embedding.length} (expected 768)`
        )
      }

      // 3. Convert to pgvector format
      const vector = `[${embedding.join(',')}]`

      // 4. Upsert into DB (safe replace)
      await pool.query(
        `
        INSERT INTO documents (title, content, embedding)
        VALUES ($1, $2, $3::vector)
        ON CONFLICT (title)
        DO UPDATE SET
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          created_at = NOW()
        `,
        [
          file.replace('.txt', ''),
          content,
          vector
        ]
      )

      console.log(`✅ Embedded: ${file}`)
    }

    console.log('🎉 All documents embedded successfully')
    process.exit(0)
  } catch (err) {
    console.error('❌ Ingest failed:', err)
    process.exit(1)
  }
}

ingestDocuments()