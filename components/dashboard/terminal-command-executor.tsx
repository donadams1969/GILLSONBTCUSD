'use client'

import { useState } from 'react'
import useSWR from 'swr'

interface TerminalOutput {
  status: string
  timestamp: string
  command: string
  output: string
  error?: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function TerminalCommandExecutor() {
  const [history, setHistory] = useState<TerminalOutput[]>([])
  const [selectedCommand, setSelectedCommand] = useState<string>('REPORT_TOKENS')
  const [isExecuting, setIsExecuting] = useState(false)

  const commands = [
    { id: 'REPORT_TOKENS', label: '📊 Token Registry Report' },
    { id: 'INTELLIGENCE_SUMMARY', label: '🔍 Intelligence Summary' },
    { id: 'NODE_HEALTH', label: '💚 Node Health Check' },
    { id: 'FEDERAL_COMPLIANCE', label: '⚖️ Federal Compliance' },
    { id: 'QUANTUM_SEAL_STATUS', label: '🔐 Quantum Seal Status' },
  ]

  const executeCommand = async () => {
    setIsExecuting(true)

    try {
      const response = await fetch('/api/intelligence/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command_type: selectedCommand }),
      })

      const result = await response.json()
      setHistory(prev => [result, ...prev.slice(0, 19)])
    } catch (error) {
      console.error('[v0] Terminal error:', error)
      setHistory(prev => [
        {
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          command: selectedCommand,
          output: '',
          error: 'Failed to execute command',
        },
        ...prev.slice(0, 19),
      ])
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Command Selector */}
      <div className="bg-slate-950 border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-sm font-bold text-amber-400 mb-3">$ COMMAND PALETTE</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {commands.map(cmd => (
            <button
              key={cmd.id}
              onClick={() => setSelectedCommand(cmd.id)}
              className={`px-3 py-2 rounded text-sm font-mono transition ${
                selectedCommand === cmd.id
                  ? 'bg-cyan-600 text-white border border-cyan-400'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500/50'
              }`}
            >
              {cmd.label}
            </button>
          ))}
        </div>

        <button
          onClick={executeCommand}
          disabled={isExecuting}
          className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-slate-700 disabled:to-slate-700 text-white rounded font-mono text-sm font-bold transition"
        >
          {isExecuting ? '⏳ EXECUTING...' : '▶ EXECUTE COMMAND'}
        </button>
      </div>

      {/* Output Display */}
      <div className="bg-slate-950 border border-cyan-500/30 rounded-lg overflow-hidden">
        <div className="bg-slate-900 px-4 py-2 border-b border-cyan-500/20">
          <span className="text-xs text-amber-400 font-mono">
            █ VALORAIPLUS TERMINAL v2.4
          </span>
        </div>

        <div className="p-4 font-mono text-xs text-cyan-300 max-h-96 overflow-y-auto space-y-4">
          {history.length === 0 ? (
            <div className="text-slate-500">
              <div>$ Ready for commands</div>
              <div className="mt-2 text-slate-600">
                Select a command from above and click EXECUTE COMMAND to begin
              </div>
            </div>
          ) : (
            history.map((output, idx) => (
              <div key={idx} className="border-l-2 border-cyan-500/50 pl-3 text-slate-300">
                <div className="text-amber-400">
                  $ {output.command}
                  <span className="text-slate-500 text-xs ml-2">
                    [{output.timestamp.split('T')[1].split('.')[0]}]
                  </span>
                </div>
                <div className="mt-1 whitespace-pre-wrap text-cyan-400">
                  {output.output || output.error}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    output.status === 'EXECUTED' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  [{output.status}]
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Command Copy-Paste Guide */}
      <div className="bg-slate-950 border border-amber-500/20 rounded-lg p-4">
        <h4 className="text-xs font-bold text-amber-400 mb-2">💾 RUN IN YOUR TERMINAL</h4>
        <div className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-300 overflow-x-auto">
          <div className="mb-2 text-cyan-400">
            # Execute any command from your local terminal:
          </div>
          <code className="block">
            {`curl -X POST http://localhost:3000/api/intelligence/execute \\\n  -H "Content-Type: application/json" \\\n  -d '{"command_type":"REPORT_TOKENS"}'`}
          </code>
        </div>
      </div>
    </div>
  )
}
