import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowRight, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchQuotes } from '@/lib/api'
import { Quote } from '@/src/types/quote'
import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  draft:    'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20',
  sent:     'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20',
  expired:  'bg-muted text-muted-foreground hover:bg-muted/80',
}

export function RecentQuotes() {
  const [quotes, setQuotes]   = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetchQuotes({ limit: 5 })
      .then(({ quotes }) => setQuotes(quotes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Recent Quote Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading quotes...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Recent Quote Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Failed to load quotes: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium">Recent Quote Activity</CardTitle>
        <Link to="/history">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            View All
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {quotes.length === 0 ? (
          <p className="px-6 py-4 text-sm text-muted-foreground">No quotes yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {/* Short ID for display — shows last 8 chars of UUID */}
                    <span className="font-mono text-xs text-muted-foreground">
                      #{quote.id.slice(-8).toUpperCase()}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn('text-[10px]', statusStyles[quote.status])}
                    >
                      {quote.status}
                    </Badge>
                  </div>

                  {/* Origin → Destination */}
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <span>{quote.origin_city}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span>{quote.destination_city}</span>
                  </div>

                  {/* Province pair + equipment */}
                  <span className="text-xs text-muted-foreground">
                    {quote.origin_province} → {quote.destination_province} · {quote.equipment_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {/* Total rate from backend breakdown */}
                    <p className="text-sm font-semibold text-foreground">
                      ${parseFloat(quote.total_rate).toLocaleString('en-CA', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(quote.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
