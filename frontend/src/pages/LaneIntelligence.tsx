import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { Search, ArrowRight, TrendingUp, Clock, MapPin, DollarSign, BarChart3, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { fetchLanes, searchLanes } from '@/lib/api'
import type { Lane } from '@/src/types/quote'
import { cn } from '@/lib/utils'

// Simulated rate history chart data — will be replaced with real
// historical quote data in a future phase
function generateLaneHistory(baseRate: number) {
  return Array.from({ length: 14 }, (_, i) => ({
    date: format(subDays(new Date(), 13 - i), 'MMM dd'),
    rate: baseRate + Math.random() * 100 - 50,
    volume: Math.floor(5 + Math.random() * 20),
  }))
}

export function LaneIntelligence() {
  const [lanes, setLanes]             = useState<Lane[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLane, setSelectedLane] = useState<Lane | null>(null)

  // Load all lanes on mount
  useEffect(() => {
    fetchLanes()
      .then((data) => {
        setLanes(data)
        setSelectedLane(data[0] ?? null) // auto-select first lane
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Search lanes as user types — debounce not needed for small dataset
  useEffect(() => {
    if (searchQuery.trim() === '') {
      fetchLanes().then(setLanes).catch(console.error)
      return
    }
    searchLanes(searchQuery, 'both')
      .then(setLanes)
      .catch(console.error)
  }, [searchQuery])

  const laneHistory = selectedLane
    ? generateLaneHistory(parseFloat(selectedLane.base_rate))
    : []

  if (loading) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Loading lanes...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6">
          <p className="text-sm text-red-500">Failed to load lanes: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Lane List ───────────────────────────────────────────── */}
        <Card className="bg-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Available Lanes</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {lanes.length === 0 ? (
                <p className="px-6 py-4 text-sm text-muted-foreground">No lanes found.</p>
              ) : (
                <div className="flex flex-col">
                  {lanes.map((lane) => (
                    <button
                      key={lane.id}
                      onClick={() => setSelectedLane(lane)}
                      className={cn(
                        'flex flex-col gap-2 border-b border-border px-6 py-4 text-left transition-colors hover:bg-muted/30',
                        selectedLane?.id === lane.id && 'bg-muted/50'
                      )}
                    >
                      {/* Origin → Destination */}
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span>{lane.origin_city}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span>{lane.destination_city}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-primary">
                          ${parseFloat(lane.base_rate).toLocaleString('en-CA', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        {/* Province badges */}
                        <Badge className="text-[10px] bg-muted text-muted-foreground">
                          {lane.origin_province} → {lane.destination_province}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{lane.distance_km} km</span>
                        <span>{lane.transit_days} day{lane.transit_days > 1 ? 's' : ''}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* ── Lane Details ─────────────────────────────────────────── */}
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
                        <span>{selectedLane.origin_city}, {selectedLane.origin_province}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLane.destination_city}, {selectedLane.destination_province}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedLane.origin_postal} → {selectedLane.destination_postal}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${parseFloat(selectedLane.base_rate).toLocaleString('en-CA', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">Base Rate (CAD)</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs">Base Rate</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">
                        ${parseFloat(selectedLane.base_rate).toLocaleString('en-CA')}
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Transit Time</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">
                        {selectedLane.transit_days} day{selectedLane.transit_days > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs">Distance</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">{selectedLane.distance_km} km</p>
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
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'oklch(0.15 0.01 260)', border: '1px solid oklch(0.25 0.015 260)', borderRadius: '8px' }}
                              labelStyle={{ color: 'oklch(0.95 0 0)' }}
                              formatter={(value: number) => [`$${value.toFixed(0)}`, 'Rate']}
                            />
                            <Area type="monotone" dataKey="rate" stroke="oklch(0.72 0.18 195)" strokeWidth={2} fill="url(#laneRateGradient)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="volume" className="mt-0">
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={laneHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.015 260)" vertical={false} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'oklch(0.15 0.01 260)', border: '1px solid oklch(0.25 0.015 260)', borderRadius: '8px' }}
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

              {/* Lane Insights — static for now, AI-powered in Phase 3 */}
              <Card className="bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Lane Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Active corridor</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedLane.origin_city} → {selectedLane.destination_city} is a{' '}
                          {selectedLane.transit_days === 1 ? 'same-day' : `${selectedLane.transit_days}-day`} lane
                          covering {selectedLane.distance_km} km.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Rate guidance</p>
                        <p className="text-xs text-muted-foreground">
                          Base rate is ${parseFloat(selectedLane.base_rate).toFixed(2)} CAD.
                          Reefer adds 30% (${(parseFloat(selectedLane.base_rate) * 0.3).toFixed(2)}) and
                          flatbed adds 15% (${(parseFloat(selectedLane.base_rate) * 0.15).toFixed(2)}).
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
