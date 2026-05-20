import { TrendingUp, TrendingDown, FileText, CheckCircle, DollarSign, Percent } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { kpiData } from '@/src/data/mockData'
import { cn } from '@/lib/utils'

const kpis = [
  {
    title: 'Total Quotes',
    value: kpiData.totalQuotes,
    change: kpiData.quotesChange,
    icon: FileText,
    format: (v: number) => v.toString(),
  },
  {
    title: 'Acceptance Rate',
    value: kpiData.acceptanceRate,
    change: kpiData.acceptanceChange,
    icon: CheckCircle,
    format: (v: number) => `${v}%`,
  },
  {
    title: 'Avg. Margin',
    value: kpiData.avgMargin,
    change: kpiData.marginChange,
    icon: Percent,
    format: (v: number) => `${v}%`,
  },
  {
    title: 'Monthly Revenue',
    value: kpiData.revenue,
    change: kpiData.revenueChange,
    icon: DollarSign,
    format: (v: number) => `$${(v / 1000).toFixed(0)}K`,
  },
]

export function KPICards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  kpi.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                )}
              >
                {kpi.change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{kpi.format(kpi.value)}</p>
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
