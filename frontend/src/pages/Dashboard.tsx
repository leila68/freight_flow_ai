import { KPICards } from '@/src/components/dashboard/KPICards'
import { RateChart } from '@/src/components/dashboard/RateChart'
import { RecentQuotes } from '@/src/components/dashboard/RecentQuotes'
import { AIInsightsPanel } from '@/src/components/dashboard/AIInsightsPanel'
import { QuickActions } from '@/src/components/dashboard/QuickActions'

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <KPICards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Rate Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RateChart />
        </div>

        {/* AI Insights - Takes 1 column */}
        <div className="lg:col-span-1">
          <AIInsightsPanel />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Quotes - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentQuotes />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
