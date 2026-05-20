import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockRateHistory } from '@/src/data/mockData'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function RateChart() {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Rate Trends</CardTitle>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Your Rates</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
            <span className="text-muted-foreground">Market Avg</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockRateHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.18 195)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.72 0.18 195)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.5 0 0)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="oklch(0.5 0 0)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.015 260)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                tickFormatter={(value) => `$${value}`}
                tickMargin={8}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.15 0.01 260)',
                  border: '1px solid oklch(0.25 0.015 260)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: 'oklch(0.95 0 0)', fontWeight: 500 }}
                itemStyle={{ color: 'oklch(0.75 0 0)' }}
                formatter={(value: number) => [`$${value.toFixed(0)}`, '']}
              />
              <Area
                type="monotone"
                dataKey="marketAvg"
                stroke="oklch(0.5 0 0)"
                strokeWidth={1.5}
                fill="url(#marketGradient)"
                name="Market Avg"
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="oklch(0.72 0.18 195)"
                strokeWidth={2}
                fill="url(#rateGradient)"
                name="Your Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
