// It blocks:
// DROP
// DELETE
// UPDATE
// INSERT
// ALTER
// Only allow: SELECT

// src/ai/sql.guard.ts

const FORBIDDEN_PATTERNS = [
    /\bdelete\b/i,
    /\bupdate\b/i,
    /\binsert\b/i,
    /\bdrop\b/i,
    /\balter\b/i,
    /\btruncate\b/i,
    /\bcreate\b/i,
    /\bgrant\b/i,
    /\brevoke\b/i,
    /--/,
    /;/, // prevents multi-query injection
]

function normalize(sql: string) {
    return sql.trim().replace(/\s+/g, ' ')
}

export const sqlGuard = {
    validate(sql: string) {
        const cleaned = sql.trim().toLowerCase()

        // must start with select
        if (!cleaned.startsWith('select')) {
            throw new Error('Only SELECT queries are allowed')
        }

        // block dangerous keywords
        const forbidden = [
            'insert',
            'update',
            'delete',
            'drop',
            'alter',
            'truncate',
            'create',
        ]

        for (const word of forbidden) {
            if (cleaned.includes(word)) {
                throw new Error('Forbidden SQL operation detected')
            }
        }

        // block multiple statements
        const withoutTrailing = cleaned.replace(/;+$/, '')
        if (withoutTrailing.includes(';')) {
            throw new Error('Multiple statements not allowed')
        }

        return true
    },
}