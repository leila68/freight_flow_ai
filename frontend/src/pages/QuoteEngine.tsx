import { useState } from 'react'
import { QuoteForm } from '@/src/components/quote/QuoteForm'
import { QuoteSummary } from '@/src/components/quote/QuoteSummary'
import { PricingBreakdown } from '@/src/components/quote/PricingBreakdown'

export interface QuoteFormData {
  origin: string
  destination: string
  equipment: string
  weight: number
  pickupDate: Date | undefined
  accessorials: string[]
}

const initialFormData: QuoteFormData = {
  origin: '',
  destination: '',
  equipment: 'dry_van',
  weight: 40000,
  pickupDate: undefined,
  accessorials: [],
}

export function QuoteEngine() {
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData)
  const [step, setStep] = useState(1)
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
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setStep(1)
    setShowSummary(false)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Form Section - Takes 3 columns */}
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

        {/* Pricing Breakdown - Takes 2 columns */}
        <div className="lg:col-span-2">
          <PricingBreakdown formData={formData} />
        </div>
      </div>
    </div>
  )
}
