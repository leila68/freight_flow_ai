import { format, parseISO } from 'date-fns'
import { ArrowRight, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockQuotes } from '@/src/data/mockData'
import { cn } from '@/lib/utils'

const statusStyles = {
  pending: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20',
  declined: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  expired: 'bg-muted text-muted-foreground hover:bg-muted/80',
}

export function RecentQuotes() {
  const recentQuotes = mockQuotes.slice(0, 5)

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
        <div className="divide-y divide-border">
          {recentQuotes.map((quote) => (
            <div
              key={quote.id}
              className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{quote.id}</span>
                  <Badge variant="secondary" className={cn('text-[10px]', statusStyles[quote.status])}>
                    {quote.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <span>{quote.origin.split(',')[0]}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span>{quote.destination.split(',')[0]}</span>
                </div>
                <span className="text-xs text-muted-foreground">{quote.customerName}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">${quote.rate.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(quote.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
