import { useState } from 'react'
import { format, parseISO, subDays } from 'date-fns'
import { Search, ArrowRight, TrendingUp, TrendingDown, Clock, MapPin, DollarSign, BarChart3, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from 'recharts'
import { mockLanes } from '@/src/data/mockData'
import type { Lane } from '@/src/data/mockData'
import { cn } from '@/lib/utils'

// Generate historical rate data for a lane
function generateLaneHistory() {
  return Array.from({ length: 14 }, (_, i) => ({
    date: format(subDays(new Date(), 13 - i), 'MMM dd'),
    rate: 2000 + Math.random() * 800,
    volume: Math.floor(20 + Math.random() * 50),
  }))
}

export function LaneIntelligence() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLane, setSelectedLane] = useState<Lane | null>(mockLanes[0])
  const laneHistory = generateLaneHistory()

  const filteredLanes = mockLanes.filter(
    (lane) =>
      lane.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lane.destination.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lane List */}
        <Card className="bg-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Top Lanes</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search lanes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="flex flex-col">
                {filteredLanes.map((lane) => (
                  <button
                    key={lane.id}
                    onClick={() => setSelectedLane(lane)}
                    className={cn(
                      'flex flex-col gap-2 border-b border-border px-6 py-4 text-left transition-colors hover:bg-muted/30',
                      selectedLane?.id === lane.id && 'bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span>{lane.origin.split(',')[0]}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span>{lane.destination.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        ${lane.avgRate.toLocaleString()}
                      </span>
                      <Badge
                        className={cn(
                          'text-[10px]',
                          lane.volumePercentile > 75
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : lane.volumePercentile > 50
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {lane.volumePercentile}th percentile
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{lane.distance} mi</span>
                      <span>{lane.avgTransitDays} day(s)</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Lane Details */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {selectedLane ? (
            <>
              {/* Lane Header */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>{selectedLane.origin}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLane.destination}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Last updated: {format(parseISO(selectedLane.lastUpdated), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${selectedLane.avgRate.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Average Rate</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 grid grid-cols-4 gap-4">
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs">Min Rate</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">${selectedLane.minRate.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs">Max Rate</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">${selectedLane.maxRate.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Transit</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">{selectedLane.avgTransitDays} day(s)</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs">Distance</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">{selectedLane.distance} mi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <Tabs defaultValue="rates">
                    <TabsList className="grid w-64 grid-cols-2">
                      <TabsTrigger value="rates">Rate History</TabsTrigger>
                      <TabsTrigger value="volume">Volume</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="rates">
                    <TabsContent value="rates" className="mt-0">
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={laneHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="laneRateGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="oklch(0.72 0.18 195)" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="oklch(0.72 0.18 195)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
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
                              formatter={(value: number) => [`$${value.toFixed(0)}`, 'Rate']}
                            />
                            <Area
                              type="monotone"
                              dataKey="rate"
                              stroke="oklch(0.72 0.18 195)"
                              strokeWidth={2}
                              fill="url(#laneRateGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="volume" className="mt-0">
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={laneHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'oklch(0.15 0.01 260)',
                                border: '1px solid oklch(0.25 0.015 260)',
                                borderRadius: '8px',
                              }}
                              labelStyle={{ color: 'oklch(0.95 0 0)' }}
                            />
                            <Bar dataKey="volume" fill="oklch(0.72 0.18 195)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Lane Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Strong demand corridor</p>
                        <p className="text-xs text-muted-foreground">
                          This lane shows consistent volume in the {selectedLane.volumePercentile}th percentile. 
                          Consider building carrier relationships for this route.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Rate spread analysis</p>
                        <p className="text-xs text-muted-foreground">
                          Rate variance of ${selectedLane.maxRate - selectedLane.minRate} indicates moderate market
                          volatility. Target rates around ${Math.round(selectedLane.avgRate * 0.95)} for competitive quotes.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex h-full items-center justify-center bg-card">
              <CardContent className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Select a lane to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
