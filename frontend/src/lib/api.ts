import { Quote, Lane } from '@/src/types/quote'

// Reads from your frontend/.env file:  VITE_API_URL=http://localhost:3001
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

// ─── Generic fetch wrapper ────────────────────────────────────────────────────
// Handles errors consistently so every call doesn't need its own try/catch.

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const json = await res.json()

  if (!res.ok) {
    // Use the backend's error message if available
    throw new Error(json.error ?? `Request failed with status ${res.status}`)
  }

  return json
}

// ─── Lanes ────────────────────────────────────────────────────────────────────

export async function fetchLanes(): Promise<Lane[]> {
  const res = await apiFetch<{ success: boolean; data: Lane[] }>('/api/lanes')
  return res.data
}

export async function searchLanes(
  query: string,
  field: 'origin' | 'destination' | 'both' = 'both',
): Promise<Lane[]> {
  const params = new URLSearchParams({ q: query, field })
  const res = await apiFetch<{ success: boolean; data: Lane[] }>(
    `/api/lanes/search?${params}`,
  )
  return res.data
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export interface FetchQuotesParams {
  equipment_type?: string
  status?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface AccessorialOption {
  id:    number
  code:  string
  label: string
  price: string
}

export async function fetchAccessorials(): Promise<AccessorialOption[]> {
  const res = await apiFetch<{ success: boolean; data: AccessorialOption[] }>('/api/accessorials')
  return res.data
}

export interface EquipmentMultiplier {
  equipment_type: string
  multiplier:     string
  label:          string
}

export async function fetchEquipmentMultipliers(): Promise<EquipmentMultiplier[]> {
  const res = await apiFetch<{ success: boolean; data: EquipmentMultiplier[] }>(
    '/api/equipment-multipliers'
  )
  return res.data
}

export async function fetchQuotes(params?: FetchQuotesParams): Promise<{
  quotes: Quote[]
  total: number
}> {
  const query = new URLSearchParams()
  if (params?.equipment_type) query.set('equipment_type', params.equipment_type)
  if (params?.status)         query.set('status', params.status)
  if (params?.date_from)      query.set('date_from', params.date_from)
  if (params?.date_to)        query.set('date_to', params.date_to)
  if (params?.limit)          query.set('limit', String(params.limit))
  if (params?.offset)         query.set('offset', String(params.offset))

  const qs = query.toString()
  const res = await apiFetch<{ success: boolean; data: Quote[]; total: number }>(
    `/api/quotes${qs ? `?${qs}` : ''}`,
  )
  return { quotes: res.data, total: res.total }
}

export async function fetchQuoteById(id: string): Promise<Quote> {
  const res = await apiFetch<{ success: boolean; data: Quote }>(`/api/quotes/${id}`)
  return res.data
}

export interface CreateQuotePayload {
  origin_city: string
  origin_province: string
  destination_city: string
  destination_province: string
  equipment_type: 'dry_van' | 'reefer' | 'flatbed'
  weight_lbs: number
  pickup_date: string // YYYY-MM-DD
  accessorials:         string[]
}

export async function createQuote(payload: CreateQuotePayload): Promise<Quote> {
  const res = await apiFetch<{ success: boolean; data: Quote }>('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await apiFetch<{ status: string }>('/health')
    return res.status === 'ok'
  } catch {
    return false
  }
}