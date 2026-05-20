import { useMemo } from 'react'
import { Truck, MapPin, Clock, Scale, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { equipmentTypes } from '@/src/data/mockData'
import type { QuoteFormData } from '@/src/pages/QuoteEngine'

interface PricingBreakdownProps {
  formData: QuoteFormData
}

// Simulated distance calculation
function calculateDistance(origin: string, destination: string): number {
  if (!origin || !destination) return 0
  // Mock distance calculation based on common routes
  const routes: Record<string, number> = {
    'Los Angeles, CA-Phoenix, AZ': 373,
    'Chicago, IL-Detroit, MI': 282,
    'Dallas, TX-Houston, TX': 239,
    'Seattle, WA-Portland, OR': 174,
    'Atlanta, GA-Miami, FL': 662,
  }
  const key = `${origin}-${destination}`
  const reverseKey = `${destination}-${origin}`
  return routes[key] || routes[reverseKey] || Math.floor(200 + Math.random() * 500)
}

// Simulated rate calculation
function calculateRate(distance: number, equipment: string, weight: number, accessorials: string[]): number {
  const baseRatePerMile: Record<string, number> = {
    dry_van: 2.85,
    reefer: 3.45,
    flatbed: 3.25,
    step_deck: 3.75,
    lowboy: 4.25,
  }
  
  const base = baseRatePerMile[equipment] || 2.85
  const distanceCost = distance * base
  const weightFactor = weight > 42000 ? 1.1 : 1.0
  const accessorialCost = accessorials.length * 75
  
  return Math.round((distanceCost * weightFactor + accessorialCost) * 100) / 100
}

export function PricingBreakdown({ formData }: PricingBreakdownProps) {
  const distance = useMemo(
    () => calculateDistance(formData.origin, formData.destination),
    [formData.origin, formData.destination]
  )

  const transitDays = useMemo(() => Math.ceil(distance / 500) || 1, [distance])

  const rate = useMemo(
    () => calculateRate(distance, formData.equipment, formData.weight, formData.accessorials),
    [distance, formData.equipment, formData.weight, formData.accessorials]
  )

  const ratePerMile = distance > 0 ? (rate / distance).toFixed(2) : '0.00'
  const margin = rate * 0.18
  const equipmentLabel = equipmentTypes.find((e) => e.value === formData.equipment)?.label || 'Dry Van'

  const lineItems = [
    { label: 'Base Rate', value: rate - formData.accessorials.length * 75 },
    ...formData.accessorials.map((acc) => ({ label: acc, value: 75 })),
  ]

  const hasRoute = formData.origin && formData.destination

  return (
    <Card className="sticky top-6 bg-card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <DollarSign className="h-4 w-4 text-primary" />
          Live Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Route Summary */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Route</p>
              <p className="text-sm font-medium text-foreground">
                {hasRoute ? `${formData.origin.split(',')[0]} → ${formData.destination.split(',')[0]}` : 'Enter route details'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Equipment</p>
              <p className="text-sm font-medium text-foreground">{equipmentLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="text-sm font-medium text-foreground">{formData.weight.toLocaleString()} lbs</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Metrics */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="text-lg font-semibold text-foreground">{distance.toLocaleString()} mi</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Transit Time</p>
            <p className="text-lg font-semibold text-foreground">{transitDays} day{transitDays > 1 ? 's' : ''}</p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Line Items */}
        <div className="space-y-2">
          {lineItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-foreground">${item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-foreground">Total Rate</span>
          <span className="text-2xl font-bold text-primary">${rate.toLocaleString()}</span>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>${ratePerMile}/mile</span>
          <span className="flex items-center gap-1 text-emerald-500">
            <TrendingUp className="h-3 w-3" />
            ${margin.toFixed(0)} est. margin (18%)
          </span>
        </div>

        {/* Market comparison */}
        <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
          <p className="text-xs font-medium text-muted-foreground">Market Position</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: hasRoute ? '65%' : '0%' }}
              />
            </div>
            <span className="text-xs text-primary">65th percentile</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {hasRoute ? 'Your rate is competitive for this lane' : 'Enter route to see market position'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
