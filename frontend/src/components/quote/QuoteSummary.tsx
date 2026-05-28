import { useState, useEffect, useRef } from 'react'
import { CheckCircle, Download, Share2, RefreshCw, ArrowRight, Clock, MapPin, Truck, Scale, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createQuote } from '@/src/lib/api'
import type { Quote } from '@/src/types/quote'
import type { QuoteFormData } from '@/src/pages/QuoteEngine'
import { equipmentTypes, accessorialOptions } from '@/src/lib/constants'

interface QuoteSummaryProps {
  formData: QuoteFormData
  onReset: () => void
}

export function QuoteSummary({ formData, onReset }: QuoteSummaryProps) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasSubmitted = useRef(false)

  const equipmentLabel =
    equipmentTypes.find((e) => e.value === formData.equipment_type)?.label ?? 'Dry Van'

  // Submit to backend as soon as this component mounts
  // (user clicked "Generate Quote" on step 3)
  useEffect(() => {
    if (!formData.pickup_date) return
    if (hasSubmitted.current) return
    hasSubmitted.current = true

    createQuote({
      origin_city: formData.origin_city,
      origin_province: formData.origin_province,
      destination_city: formData.destination_city,
      destination_province: formData.destination_province,
      equipment_type: formData.equipment_type,
      weight_lbs: formData.weight_lbs,
      pickup_date: format(formData.pickup_date, 'yyyy-MM-dd'),
      accessorials: formData.accessorials,
    })
      .then(setQuote)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n: string | number) =>
    parseFloat(String(n)).toLocaleString('en-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="bg-card">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Calculating your rate...</p>
        </CardContent>
      </Card>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !quote) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6">
          <p className="text-sm text-red-500 mb-4">
            {error ?? 'Failed to generate quote. Please try again.'}
          </p>
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ── Success state ──────────────────────────────────────────────────────────
  const shortId = quote.id.slice(-8).toUpperCase()
  const margin = parseFloat(quote.total_rate) * 0.18

  return (
    <Card className="bg-card">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium">Quote Generated</CardTitle>
              <p className="text-sm text-muted-foreground">
                Reference: #{shortId}
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
            Valid 48 hours
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Route */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Origin</p>
                <p className="font-medium text-foreground">
                  {quote.origin_city}, {quote.origin_province}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="font-medium text-foreground">
                {quote.destination_city}, {quote.destination_province}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Equipment</p>
              <p className="font-medium text-foreground">{equipmentLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
            <Scale className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="font-medium text-foreground">
                {parseFloat(quote.weight_lbs).toLocaleString('en-CA')} lbs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Transit</p>
              <p className="font-medium text-foreground">
                {quote.transit_days} day{quote.transit_days > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Pickup date */}
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Pickup: {format(new Date(quote.pickup_date), 'MMMM d, yyyy')}
          <span className="mx-2">·</span>
          {quote.distance_km} km
        </div>

        {/* Accessorials */}
        {quote.accessorials && quote.accessorials.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Included Services</p>
            <div className="flex flex-wrap gap-2">
              {quote.accessorials.map((acc) => (
                <Badge key={acc} variant="secondary" className="bg-secondary">
                  {acc}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Real rate breakdown from backend */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Rate</span>
            <span>${fmt(quote.base_rate)}</span>
          </div>
          {parseFloat(quote.equipment_surcharge) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Equipment Surcharge ({equipmentLabel})</span>
              <span>+${fmt(quote.equipment_surcharge)}</span>
            </div>
          )}
          {parseFloat(quote.weight_surcharge) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Weight Surcharge (&gt;10,000 lbs)</span>
              <span>+${fmt(quote.weight_surcharge)}</span>
            </div>
          )}
          {parseFloat(quote.fuel_surcharge) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fuel Surcharge</span>
              <span>+${fmt(quote.fuel_surcharge)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Quote</p>
              <p className="text-3xl font-bold text-foreground">
                ${fmt(quote.total_rate)}
              </p>
              <p className="text-xs text-muted-foreground">CAD · {quote.distance_km} km</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-500">Est. Margin</p>
              <p className="text-lg font-semibold text-emerald-500">
                ${margin.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">18% markup</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <Button className="flex-1 bg-primary hover:bg-primary/90">
            <Share2 className="mr-2 h-4 w-4" />
            Send to Customer
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="ghost" onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
