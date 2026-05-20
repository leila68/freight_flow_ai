import { useState } from 'react'
import { MapPin, Truck, Package, Calendar, Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { equipmentTypes, accessorialOptions, popularCities } from '@/src/data/mockData'
import type { QuoteFormData } from '@/src/pages/QuoteEngine'

interface QuoteFormProps {
  formData: QuoteFormData
  step: number
  onFormChange: (data: Partial<QuoteFormData>) => void
  onNextStep: () => void
  onPrevStep: () => void
}

const steps = [
  { id: 1, name: 'Route', icon: MapPin },
  { id: 2, name: 'Shipment', icon: Package },
  { id: 3, name: 'Options', icon: Truck },
]

export function QuoteForm({ formData, step, onFormChange, onNextStep, onPrevStep }: QuoteFormProps) {
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([])
  const [destSuggestions, setDestSuggestions] = useState<string[]>([])

  const handleOriginChange = (value: string) => {
    onFormChange({ origin: value })
    if (value.length > 1) {
      const filtered = popularCities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      )
      setOriginSuggestions(filtered.slice(0, 5))
    } else {
      setOriginSuggestions([])
    }
  }

  const handleDestChange = (value: string) => {
    onFormChange({ destination: value })
    if (value.length > 1) {
      const filtered = popularCities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      )
      setDestSuggestions(filtered.slice(0, 5))
    } else {
      setDestSuggestions([])
    }
  }

  const handleAccessorialToggle = (accessorial: string) => {
    const current = formData.accessorials
    const updated = current.includes(accessorial)
      ? current.filter((a) => a !== accessorial)
      : [...current, accessorial]
    onFormChange({ accessorials: updated })
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.origin.length > 2 && formData.destination.length > 2
      case 2:
        return formData.equipment && formData.weight > 0
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <Card className="bg-card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-lg font-medium">Create New Quote</CardTitle>
        {/* Steps indicator */}
        <div className="mt-4 flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                    step >= s.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-secondary text-muted-foreground'
                  )}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    step >= s.id ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {s.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 w-16 transition-colors',
                    step > s.id ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Step 1: Route */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Origin</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter origin city"
                  value={formData.origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  className="pl-10"
                />
                {originSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                    {originSuggestions.map((city) => (
                      <button
                        key={city}
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          onFormChange({ origin: city })
                          setOriginSuggestions([])
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter destination city"
                  value={formData.destination}
                  onChange={(e) => handleDestChange(e.target.value)}
                  className="pl-10"
                />
                {destSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                    {destSuggestions.map((city) => (
                      <button
                        key={city}
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          onFormChange({ destination: city })
                          setDestSuggestions([])
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pickup Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.pickupDate && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.pickupDate ? format(formData.pickupDate, 'PPP') : 'Select pickup date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.pickupDate}
                    onSelect={(date) => onFormChange({ pickupDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Step 2: Shipment Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Equipment Type</Label>
              <Select
                value={formData.equipment}
                onValueChange={(value) => onFormChange({ equipment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Weight (lbs)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => onFormChange({ weight: parseInt(e.target.value) || 0 })}
                placeholder="Enter weight in pounds"
              />
              <p className="text-xs text-muted-foreground">Standard full truckload: 40,000 - 45,000 lbs</p>
            </div>
          </div>
        )}

        {/* Step 3: Accessorials */}
        {step === 3 && (
          <div className="space-y-4">
            <Label>Select Accessorials</Label>
            <div className="grid grid-cols-2 gap-3">
              {accessorialOptions.map((accessorial) => (
                <div
                  key={accessorial}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                    formData.accessorials.includes(accessorial)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                  onClick={() => handleAccessorialToggle(accessorial)}
                >
                  <Checkbox
                    checked={formData.accessorials.includes(accessorial)}
                    onCheckedChange={() => handleAccessorialToggle(accessorial)}
                  />
                  <span className="text-sm">{accessorial}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={onPrevStep} disabled={step === 1}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onNextStep} disabled={!isStepValid()}>
            {step === 3 ? 'Generate Quote' : 'Next'}
            {step !== 3 && <ChevronRight className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
