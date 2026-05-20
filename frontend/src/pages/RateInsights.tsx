import { useState } from 'react'
import { format, subDays } from 'date-fns'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Filter,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'

// Generate market trend data
const marketTrends = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'MMM dd'),
  dryVan: 2200 + Math.random() * 300 - 150 + i * 5,
  reefer: 2800 + Math.random() * 400 - 200 + i * 3,
  flatbed: 2500 + Math.random() * 350 - 175 + i * 4,
}))

// Regional comparison data
const regionalData = [
  { region: 'West', avgRate: 2450, volume: 1250, change: 5.2 },
  { region: 'Midwest', avgRate: 2180, volume: 980, change: -2.1 },
  { region: 'Southeast', avgRate: 2320, volume: 1120, change: 8.4 },
  { region: 'Northeast', avgRate: 2580, volume: 890, change: 3.7 },
  { region: 'Southwest', avgRate: 2290, volume: 760, change: -1.5 },
]

// Anomaly alerts
const anomalies = [
  {
    id: 1,
    type: 'spike',
    lane: 'LA → Chicago',
    change: 18.5,
    reason: 'Capacity shortage due to weather',
    severity: 'high',
  },
  {
    id: 2,
    type: 'drop',
    lane: 'Dallas → Houston',
    change: -12.3,
    reason: 'New carrier entries in market',
    severity: 'medium',
  },
  {
    id: 3,
    type: 'spike',
    lane: 'Seattle → Portland',
    change: 8.7,
    reason: 'Seasonal demand increase',
    severity: 'low',
  },
]

export function RateInsights() {
  const [timeRange, setTimeRange] = useState('30d')
  const [equipmentFilter, setEquipmentFilter] = useState('all')

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Equipment</SelectItem>
              <SelectItem value="dry_van">Dry Van</SelectItem>
              <SelectItem value="reefer">Reefer</SelectItem>
              <SelectItem value="flatbed">Flatbed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="flex items-center text-xs text-emerald-500">
                <ArrowUpRight className="h-3 w-3" />
                4.2%
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">$2,340</p>
            <p className="text-xs text-muted-foreground">Avg. National Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="flex items-center text-xs text-emerald-500">
                <ArrowUpRight className="h-3 w-3" />
                12.8%
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">$2,850</p>
            <p className="text-xs text-muted-foreground">Reefer Avg Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              <span className="flex items-center text-xs text-red-500">
                <ArrowDownRight className="h-3 w-3" />
                2.1%
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">87%</p>
            <p className="text-xs text-muted-foreground">Capacity Utilization</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <Badge className="bg-amber-500/10 text-amber-500 text-[10px]">Active</Badge>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">Rate Anomalies</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Market Trends Chart */}
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Market Rate Trends</CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-muted-foreground">Dry Van</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Reefer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Flatbed</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.015 260)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.15 0.01 260)',
                      border: '1px solid oklch(0.25 0.015 260)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'oklch(0.95 0 0)' }}
                    formatter={(value: number) => [`$${value.toFixed(0)}`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="dryVan"
                    stroke="oklch(0.72 0.18 195)"
                    strokeWidth={2}
                    dot={false}
                    name="Dry Van"
                  />
                  <Line
                    type="monotone"
                    dataKey="reefer"
                    stroke="oklch(0.7 0.18 145)"
                    strokeWidth={2}
                    dot={false}
                    name="Reefer"
                  />
                  <Line
                    type="monotone"
                    dataKey="flatbed"
                    stroke="oklch(0.75 0.15 85)"
                    strokeWidth={2}
                    dot={false}
                    name="Flatbed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Comparison */}
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Regional Rate Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.015 260)" horizontal={false} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="region"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.15 0.01 260)',
                      border: '1px solid oklch(0.25 0.015 260)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'oklch(0.95 0 0)' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Avg Rate']}
                  />
                  <Bar dataKey="avgRate" radius={[0, 4, 4, 0]}>
                    {regionalData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.change > 0 ? 'oklch(0.72 0.18 195)' : 'oklch(0.5 0.015 260)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Detection */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Rate Anomalies Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={cn(
                  'rounded-lg border p-4 transition-colors hover:bg-muted/30',
                  anomaly.severity === 'high'
                    ? 'border-red-500/30 bg-red-500/5'
                    : anomaly.severity === 'medium'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-border bg-secondary/30'
                )}
              >
                <div className="flex items-center justify-between">
                  <Badge
                    className={cn(
                      'text-[10px]',
                      anomaly.type === 'spike'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    )}
                  >
                    {anomaly.type === 'spike' ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {anomaly.type}
                  </Badge>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      anomaly.change > 0 ? 'text-red-500' : 'text-emerald-500'
                    )}
                  >
                    {anomaly.change > 0 ? '+' : ''}
                    {anomaly.change}%
                  </span>
                </div>
                <p className="mt-2 font-medium text-foreground">{anomaly.lane}</p>
                <p className="mt-1 text-xs text-muted-foreground">{anomaly.reason}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
