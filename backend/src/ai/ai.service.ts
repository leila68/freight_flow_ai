import axios from 'axios'

const OLLAMA_URL = 'http://127.0.0.1:11434'

/**
 * Extract ONLY SQL from messy LLM output
 */
function extractSQL(text: string): string {
  if (!text) throw new Error('Empty SQL response from LLM')

  let cleaned = text

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```sql/gi, '').replace(/```/g, '')

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  // Try to extract SELECT query
  const match = cleaned.match(/select[\s\S]*$/i)

  if (!match) {
    throw new Error(`No valid SELECT SQL found in: ${cleaned}`)
  }

  return match[0].trim()
}

/**
 * Extract chat response safely
 */
function extractChat(text: any): string {
  return text?.message?.content || text?.response || 'No response'
}

export const aiService = {
  /**
   * NORMAL CHAT MODE (no DB)
   */
  async chat(message: string) {
    const res = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: 'llama3',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful AI assistant for a freight logistics platform.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      stream: false,
    })

    return extractChat(res.data)
  },

  /**
   * SQL GENERATION MODE (STRICT)
   */
async generateSQL(message: string) {
  const prompt = `
You are a PostgreSQL SQL generator for a Canadian freight brokerage platform.
Output ONLY a single valid SQL SELECT statement. No explanation, no markdown, no comments.

STRICT RULES:
- Output ONLY raw SQL, nothing else
- No markdown, no backticks, no comments, no explanations
- Never use SELECT * with GROUP BY
- When using GROUP BY, only SELECT columns that are in GROUP BY or wrapped in aggregates (COUNT, SUM, AVG, MAX, MIN)
- Always cast NUMERIC columns using ::numeric for comparisons and ordering
- Never add LIMIT — it is added automatically
- Never add semicolons
- Use table aliases for joins (q for quotes, l for lanes, a for accessorials, em for equipment_multipliers)

DATABASE SCHEMA:

TABLE: quotes
  id              UUID
  lane_id         UUID (foreign key → lanes.id)
  origin_city     VARCHAR
  origin_province VARCHAR (2-letter code e.g. ON, QC, BC)
  destination_city     VARCHAR
  destination_province VARCHAR
  equipment_type  VARCHAR — values: 'dry_van', 'reefer', 'flatbed'
  weight_lbs      NUMERIC
  pickup_date     DATE
  base_rate       NUMERIC (stored as string, cast with ::numeric)
  equipment_surcharge  NUMERIC
  weight_surcharge     NUMERIC
  fuel_surcharge       NUMERIC
  total_rate      NUMERIC (stored as string, cast with ::numeric)
  status          VARCHAR — values: 'draft', 'sent', 'accepted', 'expired'
  accessorials    JSONB (array of label strings e.g. ["Liftgate Pickup"])
  created_at      TIMESTAMPTZ

TABLE: lanes
  id              UUID
  origin_city     VARCHAR
  origin_province VARCHAR
  origin_postal   VARCHAR
  destination_city     VARCHAR
  destination_province VARCHAR
  destination_postal   VARCHAR
  base_rate       NUMERIC
  distance_km     INTEGER
  transit_days    INTEGER

TABLE: accessorials
  id          SERIAL
  code        VARCHAR (e.g. 'liftgate_pickup')
  label       VARCHAR (e.g. 'Liftgate Pickup')
  price       NUMERIC
  is_active   BOOLEAN
  description TEXT

TABLE: equipment_multipliers
  id             SERIAL
  equipment_type VARCHAR — values: 'dry_van', 'reefer', 'flatbed'
  multiplier     NUMERIC (e.g. 1.00, 1.30, 1.15)
  label          VARCHAR (e.g. 'Dry Van', 'Refrigerated', 'Flatbed')

EXAMPLES:

Q: most expensive quote
A: SELECT origin_city, destination_city, equipment_type, total_rate::numeric FROM quotes ORDER BY total_rate::numeric DESC

Q: cheapest quote
A: SELECT origin_city, destination_city, equipment_type, total_rate::numeric FROM quotes ORDER BY total_rate::numeric ASC

Q: average rate by equipment type
A: SELECT equipment_type, ROUND(AVG(total_rate::numeric), 2) AS avg_rate FROM quotes GROUP BY equipment_type ORDER BY avg_rate DESC

Q: total number of quotes
A: SELECT COUNT(*) AS total_quotes FROM quotes

Q: quotes by status
A: SELECT status, COUNT(*) AS count FROM quotes GROUP BY status ORDER BY count DESC

Q: most used lane
A: SELECT origin_city, destination_city, COUNT(*) AS quote_count FROM quotes GROUP BY origin_city, destination_city ORDER BY quote_count DESC

Q: longest distance lane
A: SELECT origin_city, destination_city, distance_km, transit_days FROM lanes ORDER BY distance_km DESC

Q: shortest lane
A: SELECT origin_city, destination_city, distance_km FROM lanes ORDER BY distance_km ASC

Q: most expensive accessorial
A: SELECT label, price::numeric FROM accessorials WHERE is_active = true ORDER BY price::numeric DESC

Q: all accessorial prices
A: SELECT label, price::numeric FROM accessorials WHERE is_active = true ORDER BY price::numeric DESC

Q: equipment multipliers
A: SELECT label, equipment_type, multiplier::numeric FROM equipment_multipliers ORDER BY multiplier::numeric DESC

Q: total revenue from accepted quotes
A: SELECT ROUND(SUM(total_rate::numeric), 2) AS total_revenue FROM quotes WHERE status = 'accepted'

Q: quotes with reefer equipment
A: SELECT origin_city, destination_city, total_rate::numeric, pickup_date FROM quotes WHERE equipment_type = 'reefer' ORDER BY total_rate::numeric DESC

Q: average weight by equipment type
A: SELECT equipment_type, ROUND(AVG(weight_lbs::numeric), 0) AS avg_weight FROM quotes GROUP BY equipment_type

Q: lanes from Toronto
A: SELECT origin_city, origin_province, destination_city, destination_province, distance_km, base_rate::numeric FROM lanes WHERE LOWER(origin_city) = 'toronto'

Q: quotes this month
A: SELECT origin_city, destination_city, total_rate::numeric, created_at FROM quotes WHERE created_at >= date_trunc('month', NOW()) ORDER BY created_at DESC

Q: highest base rate lane
A: SELECT origin_city, destination_city, base_rate::numeric, distance_km FROM lanes ORDER BY base_rate::numeric DESC

USER QUESTION: ${message}

SQL:
`
  const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model: 'llama3',
    prompt,
    stream: false,
  })

  return res.data.response.trim()
},

async formatDataAsMessage(originalQuestion: string, data: any[]) {
  if (data.length === 0) {
    return 'I searched the database but found no results for your question.'
  }

  const prompt = `
You are a helpful freight logistics assistant.
The user asked: "${originalQuestion}"

Here is the data from the database:
${JSON.stringify(data, null, 2)}

Write a clear, concise, human-friendly response answering their question using this data.
Do not mention SQL or databases.
Be direct and conversational.
If it's a list, present it clearly.
Keep it under 150 words.
`

  const res = await axios.post(`${OLLAMA_URL}/api/chat`, {
    model: 'llama3',
    messages: [
      { role: 'user', content: prompt }
    ],
    stream: false,
  })

  return extractChat(res.data)
},

}

