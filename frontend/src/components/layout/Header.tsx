import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/quote': 'Smart Quote Engine',
  '/history': 'Quote History',
  '/lanes': 'Lane Intelligence',
  '/rates': 'Rate Insights',
  '/assistant': 'AI Broker Assistant',
}

export function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'FreightFlow AI'

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quotes, lanes..."
            className="w-64 bg-secondary/50 pl-9"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            3
          </span>
        </Button>
      </div>
    </header>
  )
}
