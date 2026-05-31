'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Terminal, Copy, Check, Play } from 'lucide-react'

interface TerminalLine {
  type: 'input' | 'output' | 'success' | 'error' | 'info'
  content: string
  timestamp?: string
}

interface TerminalOutputProps {
  initialLines?: TerminalLine[]
  title?: string
}

export function TerminalOutput({ initialLines = [], title = "VALORAIPLUS TERMINAL" }: TerminalOutputProps) {
  const [lines, setLines] = useState<TerminalLine[]>(initialLines)
  const [copied, setCopied] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-cyan-400'
      case 'output': return 'text-zinc-300'
      case 'success': return 'text-emerald-400'
      case 'error': return 'text-red-400'
      case 'info': return 'text-yellow-400'
      default: return 'text-zinc-300'
    }
  }

  const getLinePrefix = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return '$ '
      case 'output': return '  '
      case 'success': return '✓ '
      case 'error': return '✗ '
      case 'info': return 'ℹ '
      default: return '  '
    }
  }

  const copyToClipboard = () => {
    const text = lines.map(l => `${getLinePrefix(l.type)}${l.content}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addLine = (line: TerminalLine) => {
    setLines(prev => [...prev, { ...line, timestamp: new Date().toISOString() }])
  }

  return (
    <Card className="border-cyan-500/30 bg-black/80 backdrop-blur-sm">
      <CardHeader className="border-b border-cyan-500/20 py-3">
        <CardTitle className="flex items-center justify-between text-cyan-400 font-mono text-sm">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            {title}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-7 px-2 text-zinc-400 hover:text-cyan-400"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={terminalRef}
          className="p-4 font-mono text-sm max-h-[300px] overflow-y-auto"
        >
          {lines.map((line, i) => (
            <div key={i} className={`${getLineColor(line.type)} whitespace-pre-wrap`}>
              <span className="text-zinc-600">{getLinePrefix(line.type)}</span>
              {line.content}
            </div>
          ))}
          <div className="flex items-center text-cyan-400 mt-2">
            <span className="text-zinc-600">$ </span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Export function to generate terminal commands
export function generateTerminalCommands(): TerminalLine[] {
  const timestamp = new Date().toISOString()
  return [
    { type: 'info', content: `VALORAIPLUS OMEGA v2.4 SUPREME - Terminal Session Started`, timestamp },
    { type: 'info', content: `Timestamp: ${timestamp}`, timestamp },
    { type: 'input', content: 'valorai --init --sovereign --quantum-seal', timestamp },
    { type: 'success', content: 'Sovereign Financial Intelligence System initialized', timestamp },
    { type: 'output', content: 'AMATH Power: 132.84 | Frequency Lock: 111100', timestamp },
    { type: 'input', content: 'valorai tokens --list --format=json', timestamp },
    { type: 'output', content: 'Loading sovereign token registry...', timestamp },
    { type: 'success', content: '7 sovereign tokens registered', timestamp },
    { type: 'input', content: 'valorai nodes --status --include-quantum-seal', timestamp },
    { type: 'success', content: 'All authorized nodes reporting nominal heartbeat', timestamp },
    { type: 'input', content: 'valorai ghost --protocol --status', timestamp },
    { type: 'info', content: 'Ghost Protocol: STANDBY | Quantum Routing: ACTIVE', timestamp },
    { type: 'input', content: 'valorai federal --ledger --wave=all', timestamp },
    { type: 'success', content: 'Federal agency ledger synchronized', timestamp },
    { type: 'output', content: 'Wave 1: HUD-OIG, DOJ | Wave 2: FTC, SEC | Wave 3: CFPB', timestamp },
  ]
}
