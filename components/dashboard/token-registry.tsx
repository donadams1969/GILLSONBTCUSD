'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Token } from '@/lib/types/database'
import { Shield, Lock } from 'lucide-react'

interface TokenRegistryProps {
  tokens: Token[]
}

export function TokenRegistry({ tokens }: TokenRegistryProps) {
  return (
    <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader className="border-b border-cyan-500/20">
        <CardTitle className="flex items-center gap-2 text-cyan-400 font-mono">
          <Shield className="h-5 w-5" />
          SOVEREIGN TOKEN REGISTRY
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-cyan-500/10">
          {tokens.map((token) => (
            <div
              key={token.id}
              className="p-4 hover:bg-cyan-500/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-lg font-bold text-cyan-300">
                      ${token.symbol}
                    </span>
                    <Badge 
                      variant={token.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className={token.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''}
                    >
                      {token.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">{token.name}</p>
                  <p className="text-xs text-zinc-500 line-clamp-2">{token.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 text-right shrink-0">
                  <div className="text-xs text-zinc-500">Supply Cap</div>
                  <div className="font-mono text-sm text-cyan-300">
                    {(token.total_supply_cap ?? 0).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cyan-500/10">
                <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                  <Lock className="h-3 w-3 mr-1" />
                  {token.token_type}
                </Badge>
                <Badge variant="outline" className="text-xs border-zinc-500/30 text-zinc-400">
                  {token.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
