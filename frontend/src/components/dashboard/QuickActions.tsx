import { Link } from 'react-router-dom'
import { Plus, FileSearch, Calculator, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const actions = [
  {
    title: 'New Quote',
    description: 'Create a new freight quote',
    icon: Plus,
    href: '/quote',
    primary: true,
  },
  {
    title: 'Search Lanes',
    description: 'Find lane intelligence',
    icon: FileSearch,
    href: '/lanes',
  },
  {
    title: 'Rate Calculator',
    description: 'Quick rate estimation',
    icon: Calculator,
    href: '/rates',
  },
  {
    title: 'Ask AI',
    description: 'Get AI recommendations',
    icon: Bot,
    href: '/assistant',
  },
]

export function QuickActions() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {actions.map((action) => (
          <Link key={action.title} to={action.href}>
            <Button
              variant={action.primary ? 'default' : 'secondary'}
              className={`w-full justify-start gap-3 ${
                action.primary
                  ? 'bg-primary hover:bg-primary/90'
                  : 'bg-secondary/50 hover:bg-secondary'
              }`}
            >
              <action.icon className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{action.title}</span>
                <span
                  className={`text-[10px] ${
                    action.primary ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {action.description}
                </span>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
