import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  History,
  MapPin,
  TrendingUp,
  MessageSquare,
  Truck,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Smart Quote', href: '/quote', icon: FileText },
  { name: 'Quote History', href: '/history', icon: History },
  { name: 'Lane Intelligence', href: '/lanes', icon: MapPin },
  { name: 'Rate Insights', href: '/rates', icon: TrendingUp },
  { name: 'AI Assistant', href: '/assistant', icon: MessageSquare },
]

const secondaryNav = [
  { name: 'Settings', href: '#', icon: Settings },
  { name: 'Help Center', href: '#', icon: HelpCircle },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Truck className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground">FreightFlow</span>
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">AI</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 h-px bg-border" />

        {/* Secondary Nav */}
        <nav className="flex flex-col gap-1">
          {secondaryNav.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </a>
          ))}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            JD
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Broker Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
