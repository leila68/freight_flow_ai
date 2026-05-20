import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Search, Filter, ArrowRight, MoreHorizontal, RefreshCw, Eye, Copy, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { mockQuotes, equipmentTypes } from '@/src/data/mockData'
import type { Quote, QuoteStatus } from '@/src/data/mockData'
import { cn } from '@/lib/utils'

const statusStyles: Record<QuoteStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20',
  declined: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  expired: 'bg-muted text-muted-foreground hover:bg-muted/80',
}

export function QuoteHistory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)

  const filteredQuotes = mockQuotes.filter((quote) => {
    const matchesSearch =
      quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <Card className="bg-card">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search quotes by ID, route, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-medium">
            Quote History
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredQuotes.length} quotes)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-24">Quote ID</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow
                  key={quote.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedQuote(quote)}
                >
                  <TableCell className="font-mono text-xs">{quote.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span>{quote.origin.split(',')[0]}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span>{quote.destination.split(',')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{quote.customerName}</TableCell>
                  <TableCell className="text-sm">
                    {equipmentTypes.find((e) => e.value === quote.equipment)?.label}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${quote.rate.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-[10px]', statusStyles[quote.status])}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(parseISO(quote.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedQuote(quote)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate Quote
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Re-quote
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quote Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Quote Details</span>
              <Button variant="ghost" size="icon" onClick={() => setSelectedQuote(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-muted-foreground">{selectedQuote.id}</p>
                  <p className="text-lg font-semibold">{selectedQuote.customerName}</p>
                </div>
                <Badge className={cn('text-xs', statusStyles[selectedQuote.status])}>
                  {selectedQuote.status}
                </Badge>
              </div>

              {/* Route */}
              <div className="rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Origin</p>
                    <p className="font-medium">{selectedQuote.origin}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="font-medium">{selectedQuote.destination}</p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Equipment</p>
                  <p className="font-medium">
                    {equipmentTypes.find((e) => e.value === selectedQuote.equipment)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="font-medium">{selectedQuote.weight.toLocaleString()} lbs</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-medium">{selectedQuote.distance} miles</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transit</p>
                  <p className="font-medium">{selectedQuote.transitDays} day(s)</p>
                </div>
              </div>

              {/* Accessorials */}
              {selectedQuote.accessorials.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Accessorials</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuote.accessorials.map((acc) => (
                      <Badge key={acc} variant="secondary">
                        {acc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Pricing */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Rate</span>
                <span className="text-2xl font-bold text-primary">
                  ${selectedQuote.rate.toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-quote
                </Button>
                <Button variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
