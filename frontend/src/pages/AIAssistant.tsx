import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Send,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  MapPin,
  DollarSign,
  FileText,
  ArrowRight,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  data?: {
    type: 'lane_analysis' | 'rate_comparison' | 'quote_suggestion'
    content: React.ReactNode
  }
}

const suggestedPrompts = [
  'What are the best rates for LA to Phoenix this week?',
  'Analyze market trends for reefer equipment',
  'Show me underperforming lanes',
  'Suggest competitive pricing for Chicago to Detroit',
]

const chatHistory = [
  { id: '1', title: 'Rate analysis for Southwest region', date: new Date() },
  { id: '2', title: 'Lane comparison: West Coast', date: new Date(Date.now() - 86400000) },
  { id: '3', title: 'Seasonal pricing strategy', date: new Date(Date.now() - 172800000) },
]

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI Broker Assistant. I can help you analyze rates, find opportunities, and optimize your pricing strategy. What would you like to know?",
      timestamp: new Date(),
      suggestions: suggestedPrompts,
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])


  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          sessionId: 'demo-session', // optional for now
        }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions,
        data: data.data,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Error connecting to server.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-6">
      {/* Chat History Sidebar */}
      <Card className="hidden w-64 flex-shrink-0 bg-card lg:block">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Chat History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="flex flex-col">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  className="flex flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/30"
                >
                  <span className="text-sm font-medium text-foreground line-clamp-2">
                    {chat.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(chat.date, 'MMM d, h:mm a')}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex flex-1 flex-col bg-card">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            AI Broker Assistant
            <Badge className="bg-primary/10 text-primary text-[10px]">Beta</Badge>
          </CardTitle>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.data && <div className="mt-2">{message.data.content}</div>}
                  {message.suggestions && message.role === 'assistant' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="h-auto px-3 py-1.5 text-xs"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                  <p
                    className={cn(
                      'mt-2 text-[10px]',
                      message.role === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    )}
                  >
                    {format(message.timestamp, 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-secondary/50 px-4 py-3">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Ask about rates, lanes, or market trends..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            AI responses are powered by FreightFlow AI backend.
          </p>
        </div>
      </Card>
    </div>
  )
}
