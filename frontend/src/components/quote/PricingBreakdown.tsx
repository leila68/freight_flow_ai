import { useMemo } from 'react'
import { Truck, MapPin, Clock, Scale, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { equipmentTypes } from '@/src/data/mockData'
import type { QuoteFormData } from '@/src/pages/QuoteEngine'

interface PricingBreakdownProps {
  formData: QuoteFormData
}

// ─── Rate engine (mirrors backend logic exactly) ──────────────────────────────
// Keeping this in sync with backend/src/services/quoteService.ts
// so the live preview matches what the API will return.

const EQUIPMENT_MULTIPLIERS: Record<string, number> = {
  dry_van: 1.00,
  reefer:  1.30,
  flatbed: 1.15,
}

const WEIGHT_THRESHOLD = 10_000
const WEIGHT_RATE      = 0.10 // per 100 lbs over threshold

function calculateBreakdown(
  baseRate:      number,
  equipmentType: string,
  weightLbs:     number,
) {
  const multiplier        = EQUIPMENT_MULTIPLIERS[equipmentType] ?? 1.0
  const equipmentSurcharge = baseRate * (multiplier - 1)
  const excessLbs         = Math.max(0, weightLbs - WEIGHT_THRESHOLD)
  const weightSurcharge   = (excessLbs / 100) * WEIGHT_RATE
  const fuelSurcharge     = 0 // Phase 2
  const total             = baseRate + equipmentSurcharge + weightSurcharge + fuelSurcharge

  return {
    base_rate:           round2(baseRate),
    equipment_surcharge: round2(equipmentSurcharge),
    weight_surcharge:    round2(weightSurcharge),
    fuel_surcharge:      round2(fuelSurcharge),
    total:               round2(total),
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingBreakdown({ formData }: PricingBreakdownProps) {
  const hasRoute = formData.origin_city.length > 0 && formData.destination_city.length > 0

  // Base rate is not known until the backend responds with a quote.
  // We show a placeholder preview using a rough estimate so the user
  // sees something meaningful while filling in the form.
  // The real number comes from QuoteSummary after submission.
  const PREVIEW_BASE_RATE = 450 // rough Canadian lane average

  const breakdown = useMemo(
    () => calculateBreakdown(PREVIEW_BASE_RATE, formData.equipment_type, formData.weight_lbs),
    [formData.equipment_type, formData.weight_lbs],
  )

  const equipmentLabel =
    equipmentTypes.find((e) => e.value === formData.equipment_type)?.label ?? 'Dry Van'

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

        {/* Route summary */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Route</p>
              <p className="text-sm font-medium text-foreground">
                {hasRoute
                  ? `${formData.origin_city}, ${formData.origin_province} → ${formData.destination_city}, ${formData.destination_province}`
                  : 'Enter route details'}
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
              <p className="text-sm font-medium text-foreground">
                {(formData.weight_lbs ?? 0).toLocaleString('en-CA')} lbs
              </p>
            </div>
          </div>

          {formData.pickup_date && (
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Pickup Date</p>
                <p className="text-sm font-medium text-foreground">
                  {formData.pickup_date.toLocaleDateString('en-CA', {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Rate breakdown line items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Base Rate</span>
            <span className="text-foreground">${fmt(breakdown.base_rate)}</span>
          </div>

          {breakdown.equipment_surcharge > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Equipment Surcharge ({equipmentLabel})
              </span>
              <span className="text-foreground">+${fmt(breakdown.equipment_surcharge)}</span>
            </div>
          )}

          {breakdown.weight_surcharge > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Weight Surcharge (&gt;10,000 lbs)
              </span>
              <span className="text-foreground">+${fmt(breakdown.weight_surcharge)}</span>
            </div>
          )}

          {formData.accessorials.length > 0 && (
            formData.accessorials.map((acc) => (
              <div key={acc} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{acc}</span>
                <span className="text-muted-foreground text-xs italic">TBD</span>
              </div>
            ))
          )}
        </div>

        <Separator className="my-4" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-foreground">Est. Total</span>
          <span className="text-2xl font-bold text-primary">
            ${fmt(breakdown.total)}
          </span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          * Preview only — exact rate calculated after submission
        </p>

        <div className="mt-2 flex items-center justify-end text-xs text-emerald-500">
          <TrendingUp className="mr-1 h-3 w-3" />
          ~${fmt(breakdown.total * 0.18)} est. margin (18%)
        </div>

        {/* Market position placeholder */}
        <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
          <p className="text-xs font-medium text-muted-foreground">Market Position</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: hasRoute ? '65%' : '0%' }}
              />
            </div>
            <span className="text-xs text-primary">65th percentile</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {hasRoute
              ? 'Rate is competitive for this lane'
              : 'Enter route to see market position'}
          </p>
        </div>

      </CardContent>
    </Card>
  )
}
