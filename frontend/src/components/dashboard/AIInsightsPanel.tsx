import { format, parseISO } from 'date-fns'
import { Lightbulb, AlertTriangle, Info, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { mockAIInsights } from '@/src/data/mockData'
import { cn } from '@/lib/utils'

const typeConfig = {
  opportunity: { icon: Lightbulb, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  trend: { icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
}

export function AIInsightsPanel() {
  return (
    <Card className="flex h-full flex-col bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
          </div>
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[320px] px-6 pb-4">
          <div className="flex flex-col gap-3">
            {mockAIInsights.map((insight) => {
              const config = typeConfig[insight.type]
              const Icon = config.icon
              return (
                <div
                  key={insight.id}
                  className="rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                      <Icon className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">{insight.title}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {insight.description}
                      </p>
                      {insight.lane && (
                        <p className="text-[11px] font-medium text-primary">{insight.lane}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/70">
                        {format(parseISO(insight.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
