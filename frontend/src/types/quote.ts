export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired'
export type EquipmentType = 'dry_van' | 'reefer' | 'flatbed'

export interface Quote {
  id: string
  lane_id: string | null
  origin_city: string
  origin_province: string
  destination_city: string
  destination_province: string
  equipment_type: EquipmentType
  weight_lbs: string
  pickup_date: string
  distance_km: number
  transit_days: number
  base_rate: string
  equipment_surcharge: string
  weight_surcharge: string
  fuel_surcharge: string
  total_rate: string
  status: QuoteStatus
  accessorials: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Lane {
  id: string
  origin_city: string
  origin_province: string
  origin_postal: string
  destination_city: string
  destination_province: string
  destination_postal: string
  base_rate: string
  distance_km: number
  transit_days: number
}