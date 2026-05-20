import { CheckCircle, Download, Share2, RefreshCw, ArrowRight, Clock, MapPin, Truck, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { equipmentTypes } from '@/src/data/mockData'
import type { QuoteFormData } from '@/src/pages/QuoteEngine'

interface QuoteSummaryProps {
  formData: QuoteFormData
  onReset: () => void
}

export function QuoteSummary({ formData, onReset }: QuoteSummaryProps) {
  const quoteId = `QT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  const distance = Math.floor(200 + Math.random() * 500)
  const transitDays = Math.ceil(distance / 500)
  const baseRate = distance * 2.85
  const accessorialCost = formData.accessorials.length * 75
  const totalRate = Math.round(baseRate + accessorialCost)
  const equipmentLabel = equipmentTypes.find((e) => e.value === formData.equipment)?.label || 'Dry Van'

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
              <p className="text-sm text-muted-foreground">Reference: {quoteId}</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
            Valid 48 hours
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Route Card */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Origin</p>
                <p className="font-medium text-foreground">{formData.origin}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="font-medium text-foreground">{formData.destination}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
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
              <p className="font-medium text-foreground">{formData.weight.toLocaleString()} lbs</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Transit</p>
              <p className="font-medium text-foreground">{transitDays} day{transitDays > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Accessorials */}
        {formData.accessorials.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Included Services</p>
            <div className="flex flex-wrap gap-2">
              {formData.accessorials.map((acc) => (
                <Badge key={acc} variant="secondary" className="bg-secondary">
                  {acc}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Pricing Summary */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Quote</p>
              <p className="text-3xl font-bold text-foreground">${totalRate.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                ${(totalRate / distance).toFixed(2)}/mile • {distance} miles
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-500">Est. Margin</p>
              <p className="text-lg font-semibold text-emerald-500">
                ${Math.round(totalRate * 0.18).toLocaleString()}
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
