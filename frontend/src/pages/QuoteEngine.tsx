import { useState } from 'react'
import { QuoteForm } from '@/src/components/quote/QuoteForm'
import { QuoteSummary } from '@/src/components/quote/QuoteSummary'
import { PricingBreakdown } from '@/src/components/quote/PricingBreakdown'
import type { EquipmentType } from '@/src/types/quote'

export interface QuoteFormData {
  origin_city:          string
  origin_province:      string
  destination_city:     string
  destination_province: string
  equipment_type:       EquipmentType
  weight_lbs:           number
  pickup_date:          Date | undefined
  accessorials:         string[]
}

export const initialFormData: QuoteFormData = {
  origin_city:          '',
  origin_province:      '',
  destination_city:     '',
  destination_province: '',
  equipment_type:       'dry_van',
  weight_lbs:           40000,
  pickup_date:          undefined,
  accessorials:         [],
}

export function QuoteEngine() {
  const [formData, setFormData]       = useState<QuoteFormData>(initialFormData)
  const [step, setStep]               = useState(1)
  const [showSummary, setShowSummary] = useState(false)

  const handleFormChange = (data: Partial<QuoteFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setShowSummary(true)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setStep(1)
    setShowSummary(false)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Form — 3 columns */}
        <div className="lg:col-span-3">
          {showSummary ? (
            <QuoteSummary formData={formData} onReset={handleReset} />
          ) : (
            <QuoteForm
              formData={formData}
              step={step}
              onFormChange={handleFormChange}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          )}
        </div>

        {/* Pricing Breakdown — 2 columns, receives step for live updates */}
        <div className="lg:col-span-2">
          <PricingBreakdown formData={formData} step={step} />
        </div>
      </div>
    </div>
  )
}
