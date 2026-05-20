import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/src/components/layout/AppLayout'
import { Dashboard } from '@/src/pages/Dashboard'
import { QuoteEngine } from '@/src/pages/QuoteEngine'
import { QuoteHistory } from '@/src/pages/QuoteHistory'
import { LaneIntelligence } from '@/src/pages/LaneIntelligence'
import { RateInsights } from '@/src/pages/RateInsights'
import { AIAssistant } from '@/src/pages/AIAssistant'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="quote" element={<QuoteEngine />} />
          <Route path="history" element={<QuoteHistory />} />
          <Route path="lanes" element={<LaneIntelligence />} />
          <Route path="rates" element={<RateInsights />} />
          <Route path="assistant" element={<AIAssistant />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
