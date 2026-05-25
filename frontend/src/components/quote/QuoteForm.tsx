import { useState, useEffect, useRef } from 'react'
// import { MapPin, Truck, Package, Calendar, Check, ChevronRight, ChevronLeft } from 'lucide-react'
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
import { searchLanes } from '@/src/lib/api'
import type { Lane } from '@/src/types/quote'
import type { QuoteFormData } from '@/src/pages/QuoteEngine'
import { equipmentTypes, accessorialOptions } from '@/src/lib/constants'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { MapPin, Truck, Package, Check, ChevronRight, ChevronLeft } from 'lucide-react'


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
  // Autocomplete state
  const [originInput, setOriginInput] = useState(
    formData.origin_city
      ? `${formData.origin_city}, ${formData.origin_province}`
      : ''
  )
  const [destInput, setDestInput] = useState(
    formData.destination_city
      ? `${formData.destination_city}, ${formData.destination_province}`
      : ''
  )
  const [originSuggestions, setOriginSuggestions] = useState<Lane[]>([])
  const [destSuggestions, setDestSuggestions] = useState<Lane[]>([])
  const [loadingOrigin, setLoadingOrigin] = useState(false)
  const [loadingDest, setLoadingDest] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)

  // Refs to close dropdowns on outside click
  const originRef = useRef<HTMLDivElement>(null)
  const destRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setOriginSuggestions([])
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setDestSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Origin search ──────────────────────────────────────────────────────────
  const handleOriginInput = async (value: string) => {
    setOriginInput(value)
    // Clear selection if user edits after picking
    onFormChange({ origin_city: '', origin_province: '' })

    if (value.trim().length < 2) {
      setOriginSuggestions([])
      return
    }
    setLoadingOrigin(true)
    try {
      const lanes = await searchLanes(value, 'origin')
      // Deduplicate by city+province
      const seen = new Set<string>()
      const unique = lanes.filter((l) => {
        const key = `${l.origin_city}-${l.origin_province}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setOriginSuggestions(unique.slice(0, 5))
    } catch {
      setOriginSuggestions([])
    } finally {
      setLoadingOrigin(false)
    }
  }

  const selectOrigin = (lane: Lane) => {
    onFormChange({
      origin_city: lane.origin_city,
      origin_province: lane.origin_province,
    })
    setOriginInput(`${lane.origin_city}, ${lane.origin_province}`)
    setOriginSuggestions([])
  }

  // ── Destination search ─────────────────────────────────────────────────────
  const handleDestInput = async (value: string) => {
    setDestInput(value)
    onFormChange({ destination_city: '', destination_province: '' })

    if (value.trim().length < 2) {
      setDestSuggestions([])
      return
    }
    setLoadingDest(true)
    try {
      const lanes = await searchLanes(value, 'destination')
      const seen = new Set<string>()
      const unique = lanes.filter((l) => {
        const key = `${l.destination_city}-${l.destination_province}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setDestSuggestions(unique.slice(0, 5))
    } catch {
      setDestSuggestions([])
    } finally {
      setLoadingDest(false)
    }
  }

  const selectDestination = (lane: Lane) => {
    onFormChange({
      destination_city: lane.destination_city,
      destination_province: lane.destination_province,
    })
    setDestInput(`${lane.destination_city}, ${lane.destination_province}`)
    setDestSuggestions([])
  }

  // ── Accessorials ───────────────────────────────────────────────────────────
  const handleAccessorialToggle = (accessorial: string) => {
    const updated = formData.accessorials.includes(accessorial)
      ? formData.accessorials.filter((a) => a !== accessorial)
      : [...formData.accessorials, accessorial]
    onFormChange({ accessorials: updated })
  }

  // ── Step validation ────────────────────────────────────────────────────────
  const isStepValid = () => {
    switch (step) {
      case 1:
        // Both city+province must be set (means user selected from dropdown)
        return (
          formData.origin_city.length > 0 &&
          formData.origin_province.length > 0 &&
          formData.destination_city.length > 0 &&
          formData.destination_province.length > 0 &&
          formData.pickup_date !== undefined
        )
      case 2:
        return formData.equipment_type !== undefined && formData.weight_lbs > 0
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

        {/* Step indicator */}
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
                <span className={cn('text-sm font-medium', step >= s.id ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn('mx-4 h-0.5 w-16 transition-colors', step > s.id ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">

        {/* ── Step 1: Route ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">

            {/* Origin */}
            <div className="space-y-2">
              <Label>Origin</Label>
              <div className="relative" ref={originRef}>
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Type a city (e.g. Toronto)"
                  value={originInput}
                  onChange={(e) => handleOriginInput(e.target.value)}
                  className="pl-10"
                />
                {/* Selected indicator */}
                {formData.origin_city && (
                  <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                )}
                {/* Dropdown */}
                {(originSuggestions.length > 0 || loadingOrigin) && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                    {loadingOrigin ? (
                      <p className="px-4 py-2 text-sm text-muted-foreground">Searching...</p>
                    ) : (
                      originSuggestions.map((lane) => (
                        <button
                          key={`${lane.origin_city}-${lane.origin_province}`}
                          type="button"
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => selectOrigin(lane)}
                        >
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {lane.origin_city}, {lane.origin_province}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label>Destination</Label>
              <div className="relative" ref={destRef}>
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Type a city (e.g. Montreal)"
                  value={destInput}
                  onChange={(e) => handleDestInput(e.target.value)}
                  className="pl-10"
                />
                {formData.destination_city && (
                  <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                )}
                {(destSuggestions.length > 0 || loadingDest) && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                    {loadingDest ? (
                      <p className="px-4 py-2 text-sm text-muted-foreground">Searching...</p>
                    ) : (
                      destSuggestions.map((lane) => (
                        <button
                          key={`${lane.destination_city}-${lane.destination_province}`}
                          type="button"
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => selectDestination(lane)}
                        >
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {lane.destination_city}, {lane.destination_province}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pickup Date */}
            {/* <div className="space-y-2">
              <Label>Pickup Date</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !formData.pickup_date && 'text-muted-foreground')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.pickup_date instanceof Date && !isNaN(formData.pickup_date.getTime())
                      ? format(formData.pickup_date, 'PPP')
                      : 'Select pickup date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={
                      formData.pickup_date
                        ? new Date(formData.pickup_date)
                        : undefined
                    }
                    onSelect={(date) => {
                      console.log('date selected:', date)
                      onFormChange({ pickup_date: date ?? undefined })
                      setDateOpen(false)
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div> */}

            {/* Pickup Date */}
<div className="space-y-2">
  <Label>Pickup Date</Label>
  <DatePicker
    selected={formData.pickup_date}
    onChange={(date: Date | null) => onFormChange({ pickup_date: date ?? undefined })}
    minDate={new Date()}
    dateFormat="MMMM d, yyyy"
    placeholderText="Select pickup date"
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
    wrapperClassName="w-full"
  />
</div>
          </div>
        )}

        {/* ── Step 2: Shipment Details ──────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Equipment Type</Label>
              <Select
                value={formData.equipment_type}
                onValueChange={(value) => onFormChange({ equipment_type: value as any })}
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
                value={formData.weight_lbs}
                onChange={(e) => onFormChange({ weight_lbs: parseInt(e.target.value) || 0 })}
                placeholder="Enter weight in pounds"
                min={1}
                max={48000}
              />
              <p className="text-xs text-muted-foreground">
                Standard full truckload: 40,000 – 45,000 lbs · Max: 48,000 lbs
              </p>
            </div>
          </div>
        )}

        {/* ── Step 3: Accessorials ──────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <Label>Select Accessorials (optional)</Label>
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

        {/* Navigation */}
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
