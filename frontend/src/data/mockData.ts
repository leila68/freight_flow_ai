import { format, subDays, subHours } from 'date-fns'

// Quote Types
export type QuoteStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type EquipmentType = 'dry_van' | 'reefer' | 'flatbed' | 'step_deck' | 'lowboy'

export interface Quote {
  id: string
  origin: string
  destination: string
  equipment: EquipmentType
  weight: number
  rate: number
  distance: number
  transitDays: number
  status: QuoteStatus
  createdAt: string
  expiresAt: string
  customerName: string
  accessorials: string[]
}

export interface Lane {
  id: string
  origin: string
  destination: string
  avgRate: number
  minRate: number
  maxRate: number
  volumePercentile: number
  avgTransitDays: number
  distance: number
  lastUpdated: string
}

export interface RateDataPoint {
  date: string
  rate: number
  volume: number
  marketAvg: number
}

export interface AIInsight {
  id: string
  type: 'opportunity' | 'warning' | 'info' | 'trend'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  lane?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  suggestions?: string[]
}

// Mock Data
export const mockQuotes: Quote[] = [
  {
    id: 'QT-001',
    origin: 'Los Angeles, CA',
    destination: 'Phoenix, AZ',
    equipment: 'dry_van',
    weight: 42000,
    rate: 2450,
    distance: 373,
    transitDays: 1,
    status: 'accepted',
    createdAt: format(subHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss"),
    expiresAt: format(subDays(new Date(), -2), "yyyy-MM-dd'T'HH:mm:ss"),
    customerName: 'Acme Distribution',
    accessorials: ['Liftgate', 'Residential'],
  },
  {
    id: 'QT-002',
    origin: 'Chicago, IL',
    destination: 'Detroit, MI',
    equipment: 'reefer',
    weight: 38000,
    rate: 1850,
    distance: 282,
    transitDays: 1,
    status: 'pending',
    createdAt: format(subHours(new Date(), 5), "yyyy-MM-dd'T'HH:mm:ss"),
    expiresAt: format(subDays(new Date(), -1), "yyyy-MM-dd'T'HH:mm:ss"),
    customerName: 'Fresh Foods Inc',
    accessorials: ['Temperature Control'],
  },
  {
    id: 'QT-003',
    origin: 'Dallas, TX',
    destination: 'Houston, TX',
    equipment: 'flatbed',
    weight: 45000,
    rate: 1200,
    distance: 239,
    transitDays: 1,
    status: 'declined',
    createdAt: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
    expiresAt: format(subDays(new Date(), -1), "yyyy-MM-dd'T'HH:mm:ss"),
    customerName: 'Steel Works LLC',
    accessorials: ['Tarping'],
  },
  {
    id: 'QT-004',
    origin: 'Seattle, WA',
    destination: 'Portland, OR',
    equipment: 'dry_van',
    weight: 35000,
    rate: 950,
    distance: 174,
    transitDays: 1,
    status: 'accepted',
    createdAt: format(subDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss"),
    expiresAt: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
    customerName: 'Pacific Logistics',
    accessorials: [],
  },
  {
    id: 'QT-005',
    origin: 'Atlanta, GA',
    destination: 'Miami, FL',
    equipment: 'reefer',
    weight: 40000,
    rate: 2800,
    distance: 662,
    transitDays: 2,
    status: 'pending',
    createdAt: format(subHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
    expiresAt: format(subDays(new Date(), -2), "yyyy-MM-dd'T'HH:mm:ss"),
    customerName: 'Seafood Express',
    accessorials: ['Temperature Control', 'Inside Delivery'],
  },
  {
    id: 'QT-006',
    origin: 'Denver, CO',
    destination: 'Salt Lake City, UT',
    equipment: 'dry_van',
    weight: 32000,
    rate: 1650,
    distance: 525,
    transitDays: 2,
    status: 'expired',
    createdAt: format(subDays(new Date(), 5), "yyyy-MM-dd'T'HH:mm:ss"),
    expiresAt: format(subDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss"),
    customerName: 'Mountain Supplies',
    accessorials: ['Liftgate'],
  },
]

export const mockLanes: Lane[] = [
  {
    id: 'LN-001',
    origin: 'Los Angeles, CA',
    destination: 'Phoenix, AZ',
    avgRate: 2380,
    minRate: 1950,
    maxRate: 2850,
    volumePercentile: 85,
    avgTransitDays: 1,
    distance: 373,
    lastUpdated: format(subHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 'LN-002',
    origin: 'Chicago, IL',
    destination: 'Detroit, MI',
    avgRate: 1720,
    minRate: 1400,
    maxRate: 2100,
    volumePercentile: 72,
    avgTransitDays: 1,
    distance: 282,
    lastUpdated: format(subHours(new Date(), 3), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 'LN-003',
    origin: 'Dallas, TX',
    destination: 'Houston, TX',
    avgRate: 1150,
    minRate: 900,
    maxRate: 1450,
    volumePercentile: 92,
    avgTransitDays: 1,
    distance: 239,
    lastUpdated: format(subHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 'LN-004',
    origin: 'Atlanta, GA',
    destination: 'Miami, FL',
    avgRate: 2650,
    minRate: 2200,
    maxRate: 3200,
    volumePercentile: 68,
    avgTransitDays: 2,
    distance: 662,
    lastUpdated: format(subHours(new Date(), 4), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 'LN-005',
    origin: 'New York, NY',
    destination: 'Boston, MA',
    avgRate: 1450,
    minRate: 1100,
    maxRate: 1850,
    volumePercentile: 78,
    avgTransitDays: 1,
    distance: 215,
    lastUpdated: format(subHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
  },
]

export const mockRateHistory: RateDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'MMM dd'),
  rate: 2200 + Math.random() * 400 - 200,
  volume: Math.floor(150 + Math.random() * 100),
  marketAvg: 2150 + Math.random() * 300 - 150,
}))

export const mockAIInsights: AIInsight[] = [
  {
    id: 'AI-001',
    type: 'opportunity',
    title: 'High-margin lane detected',
    description: 'LA to Phoenix rates are 12% above market average. Consider prioritizing quotes on this lane.',
    impact: 'high',
    lane: 'Los Angeles, CA → Phoenix, AZ',
    createdAt: format(subHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 'AI-002',
    type: 'warning',
    title: 'Rate volatility alert',
    description: 'Chicago to Detroit lane showing unusual price fluctuations. Market conditions unstable.',
    impact: 'medium',
    lane: 'Chicago, IL → Detroit, MI',
    createdAt: format(subHours(new Date(), 3), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 'AI-003',
    type: 'trend',
    title: 'Seasonal demand increase',
    description: 'Southeast corridors expecting 18% volume increase over next 2 weeks due to produce season.',
    impact: 'high',
    createdAt: format(subHours(new Date(), 6), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 'AI-004',
    type: 'info',
    title: 'Carrier capacity update',
    description: 'Flatbed availability improved in Texas region. Consider competitive pricing.',
    impact: 'low',
    createdAt: format(subHours(new Date(), 12), "yyyy-MM-dd'T'HH:mm:ss"),
  },
]

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'MSG-001',
    role: 'assistant',
    content: "Hello! I'm your AI Broker Assistant. I can help you with rate analysis, lane intelligence, and quoting strategies. What would you like to know?",
    timestamp: format(subHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
    suggestions: [
      'What are the best rates for LA to Phoenix?',
      'Show me trending lanes this week',
      'Analyze my quote performance',
    ],
  },
]

export const kpiData = {
  totalQuotes: 156,
  quotesChange: 12.5,
  acceptanceRate: 68,
  acceptanceChange: 4.2,
  avgMargin: 18.5,
  marginChange: -2.1,
  revenue: 485000,
  revenueChange: 8.7,
}

export const equipmentTypes: { value: EquipmentType; label: string }[] = [
  { value: 'dry_van', label: 'Dry Van' },
  { value: 'reefer', label: 'Refrigerated' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'step_deck', label: 'Step Deck' },
  { value: 'lowboy', label: 'Lowboy' },
]

export const accessorialOptions = [
  'Liftgate Pickup',
  'Liftgate Delivery',
  'Residential Pickup',
  'Residential Delivery',
  'Inside Pickup',
  'Inside Delivery',
  'Limited Access',
  'Appointment Required',
  'Temperature Control',
  'Tarping',
  'Hazmat',
  'Team Drivers',
]

export const popularCities = [
  'Los Angeles, CA',
  'Chicago, IL',
  'Dallas, TX',
  'Houston, TX',
  'Phoenix, AZ',
  'Atlanta, GA',
  'Miami, FL',
  'Seattle, WA',
  'Denver, CO',
  'New York, NY',
  'Boston, MA',
  'Detroit, MI',
  'Portland, OR',
  'Salt Lake City, UT',
  'Las Vegas, NV',
]
