import { pool } from '../db/client'
import { sqlGuard } from './sql.guard'

export const sqlService = {
    sanitizeGroupBy(sql: string): string {
  // If query has GROUP BY, strip any SELECT * patterns
  if (/\bgroup\s+by\b/i.test(sql)) {
    sql = sql.replace(/SELECT\s+\*/i, 'SELECT COUNT(*)')
  }
  return sql
},
  async runQuery(sql: string) {
  try {
    let finalSQL = sql.trim().replace(/;+$/, '')
    console.log('🔍 Raw SQL from LLM:', finalSQL)

    sqlGuard.validate(finalSQL)
    finalSQL = this.sanitizeGroupBy(finalSQL)
    console.log('🔍 After sanitize:', finalSQL)

    finalSQL = this.ensureLimit(finalSQL)
    console.log('🔍 Final SQL to run:', finalSQL)

    const result = await pool.query(finalSQL)
    console.log('✅ Query returned rows:', result.rows.length)
    return result.rows

  } catch (error: any) {
    console.error('SQL execution error:', error.message)
    throw new Error('Database query failed')
  }
},
    
    ensureLimit(sql: string) {
        // Remove trailing semicolon before checking/adding LIMIT
        let cleaned = sql.trim().replace(/;+$/, '')

        const hasLimit = /\blimit\b/i.test(cleaned)
        if (hasLimit) return cleaned

        return `${cleaned} LIMIT 100`
    },
}