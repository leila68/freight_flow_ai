import { useMemo, useState, useEffect } from 'react'
import { Truck, MapPin, Clock, Scale, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { equipmentTypes } from '@/src/data/mockData'
import { fetchLanes } from '@/src/lib/api'
import type { Lane } from '@/src/types/quote'
import type { QuoteFormData } from '@/src/pages/QuoteEngine'

interface PricingBreakdownProps {
  formData: QuoteFormData
  step:     number
}

const EQUIPMENT_MULTIPLIERS: Record<string, number> = {
  dry_van: 1.00,
  reefer:  1.30,
  flatbed: 1.15,
}

function calculateBreakdown(baseRate: number, equipmentType: string, weightLbs: number) {
  const multiplier         = EQUIPMENT_MULTIPLIERS[equipmentType] ?? 1.0
  const equipmentSurcharge = baseRate * (multiplier - 1)
  const excessLbs          = Math.max(0, weightLbs - 10_000)
  const weightSurcharge    = (excessLbs / 100) * 0.10
  const total              = baseRate + equipmentSurcharge + weightSurcharge
  return {
    base_rate:           round2(baseRate),
    equipment_surcharge: round2(equipmentSurcharge),
    weight_surcharge:    round2(weightSurcharge),
    total:               round2(total),
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function PricingBreakdown({ formData, step }: PricingBreakdownProps) {
  const [matchedLane, setMatchedLane] = useState<Lane | null>(null)

  useEffect(() => {
    if (!formData.origin_city || !formData.destination_city) {
      setMatchedLane(null)
      return
    }
    fetchLanes().then((lanes) => {
      const match = lanes.find(
        (l) =>
          l.origin_city.toLowerCase()          === formData.origin_city.toLowerCase() &&
          l.origin_province.toLowerCase()      === formData.origin_province.toLowerCase() &&
          l.destination_city.toLowerCase()     === formData.destination_city.toLowerCase() &&
          l.destination_province.toLowerCase() === formData.destination_province.toLowerCase(),
      )
      setMatchedLane(match ?? null)
    })
  }, [formData.origin_city, formData.origin_province, formData.destination_city, formData.destination_province])

  const baseRate = matchedLane ? parseFloat(matchedLane.base_rate) : 0

  const breakdown = useMemo(
    () => calculateBreakdown(baseRate, formData.equipment_type, formData.weight_lbs),
    [baseRate, formData.equipment_type, formData.weight_lbs],
  )

  const hasRoute = formData.origin_city.length > 0 && formData.destination_city.length > 0
  const hasLane  = matchedLane !== null
  const equipmentLabel = equipmentTypes.find((e) => e.value === formData.equipment_type)?.label ?? 'Dry Van'
  const fmt = (n: number) =>
    n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <Card className="sticky top-6 bg-card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <DollarSign className="h-4 w-4 text-primary" />
          Live Pricing Preview
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">

        {/* Route info — always visible */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Route</p>
              <p className="text-sm font-medium text-foreground truncate">
                {hasRoute
                  ? `${formData.origin_city}, ${formData.origin_province} → ${formData.destination_city}, ${formData.destination_province}`
                  : <span className="text-muted-foreground italic">Enter origin & destination</span>}
              </p>
            </div>
          </div>

          {hasLane && matchedLane && (
            <div className="flex items-center gap-3">
              <span className="w-4 shrink-0" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{matchedLane.distance_km} km</span>
                <span>·</span>
                <span>{matchedLane.transit_days} day{matchedLane.transit_days > 1 ? 's' : ''} transit</span>
              </div>
            </div>
          )}

          {formData.pickup_date && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Pickup Date</p>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(formData.pickup_date), 'EEE, MMM d yyyy')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Equipment & weight — visible from step 2 */}
        {step >= 2 && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Equipment</p>
                <p className="text-sm font-medium text-foreground">{equipmentLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Scale className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="text-sm font-medium text-foreground">
                  {(formData.weight_lbs ?? 0).toLocaleString('en-CA')} lbs
                </p>
              </div>
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Pricing */}
        {!hasRoute ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            Select a route to see pricing
          </p>
        ) : !hasLane ? (
          <p className="text-sm text-amber-500 italic text-center py-4">
            No seeded lane found for this route
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Rate</span>
                <span>${fmt(breakdown.base_rate)}</span>
              </div>
              {step >= 2 && breakdown.equipment_surcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Equipment ({equipmentLabel})</span>
                  <span>+${fmt(breakdown.equipment_surcharge)}</span>
                </div>
              )}
              {step >= 2 && breakdown.weight_surcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weight Surcharge</span>
                  <span>+${fmt(breakdown.weight_surcharge)}</span>
                </div>
              )}
              {step >= 3 && formData.accessorials.map((acc) => (
                <div key={acc} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{acc}</span>
                  <span className="text-xs text-muted-foreground italic">TBD</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-foreground">
                {step >= 2 ? 'Est. Total' : 'Base Rate'}
              </span>
              <span className="text-2xl font-bold text-primary">
                ${fmt(step >= 2 ? breakdown.total : breakdown.base_rate)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              * Exact rate confirmed after submission
            </p>
            <div className="mt-2 flex items-center justify-end text-xs text-emerald-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              ~${fmt((step >= 2 ? breakdown.total : breakdown.base_rate) * 0.18)} est. margin (18%)
            </div>

            <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">Market Position</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: '65%' }} />
                </div>
                <span className="text-xs text-primary">65th percentile</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Rate is competitive for this lane</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
