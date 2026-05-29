// Decides:

// SQL question OR RAG question?

export type RouteType = 'sql' | 'rag' | 'chat'

export function routeMessage(message: string): RouteType {
  const text = message.toLowerCase()

  // ─────────────────────────────
  // 1. SQL / Analytics questions
  // ─────────────────────────────
  const sqlKeywords = [
    // Aggregation intent
    'most expensive',
    'cheapest',
    'average',
    'total',
    'revenue',
    'highest',
    'lowest',
    'count',
    'how many',
    'sum',
    'breakdown',
    'ranking',
    'top',
    'bottom',
    'best',
    'worst',
    'largest',
    'smallest',

    // Analytics intent
    'compare',
    'trend',
    'performance',
    'stats',
    'statistics',
    'report',
    'summary',
    'overview',
    'analysis',
    'analytics',
    'insights',
    'metrics',

    // Time-based
    'this month',
    'last month',
    'this week',
    'today',
    'recent',
    'latest',
    'history',
    'historical',

    // Table names — direct references
    'quotes',
    'quote',
    'lanes',
    'lane',
    'accessorials',
    'accessorial',
    'equipment',
    'multiplier',

    // Domain-specific
    'rate',
    'rates',
    'price',
    'pricing',
    'weight',
    'distance',
    'transit',
    'shipment',
    'freight',
    'dry van',
    'reefer',
    'flatbed',
    'surcharge',
    'base rate',
    'total rate',
    'fuel',
    'accepted',
    'expired',
    'draft',
    'status',

    // Location
    'toronto',
    'montreal',
    'vancouver',
    'calgary',
    'edmonton',
    'ottawa',
    'winnipeg',
    'regina',
    'halifax',
    'ontario',
    'quebec',
    'british columbia',
    'alberta',
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