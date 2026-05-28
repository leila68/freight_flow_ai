// Decides:

// SQL question OR RAG question?

export type RouteType = 'sql' | 'rag' | 'chat'

export function routeMessage(message: string): RouteType {
  const text = message.toLowerCase()

  // ─────────────────────────────
  // 1. SQL / Analytics questions
  // ─────────────────────────────
  const sqlKeywords = [
    'most expensive',
    'cheapest',
    'average',
    'total',
    'revenue',
    'lane',
    'quote',
    'price',
    'rates',
    'highest',
    'lowest',
    'compare',
    'trend',
  ]

  if (sqlKeywords.some((k) => text.includes(k))) {
    return 'sql'
  }

  // ─────────────────────────────
  // 2. RAG / document questions
  // ─────────────────────────────
  const ragKeywords = [
    'what is',
    'explain',
    'policy',
    'definition',
    'how does',
    'accessorial',
    'surcharge',
    'rule',
    'document',
    'contract',
  ]

  if (ragKeywords.some((k) => text.includes(k))) {
    return 'rag'
  }

  // ─────────────────────────────
  // 3. Default fallback
  // ─────────────────────────────
  return 'chat'
}