'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AuthorizedNode } from '@/lib/types/database'
import { Server, Activity } from 'lucide-react'

interface NodeStatusProps {
  nodes: AuthorizedNode[]
}

export function NodeStatus({ nodes }: NodeStatusProps) {
  const activeCount = nodes.filter(n => n.is_active).length
  
  return (
    <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader className="border-b border-cyan-500/20">
        <CardTitle className="flex items-center justify-between text-cyan-400 font-mono">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AUTHORIZED NODES
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {activeCount}/{nodes.length} ONLINE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-3">
          {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-3 rounded-lg border transition-colors ${
                  node.is_active 
                    ? 'border-emerald-500/30 bg-emerald-500/5' 
                    : 'border-zinc-500/30 bg-zinc-500/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    node.is_active 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    <Server className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-zinc-200">
                        {node.node_name}
                      </span>
                      <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                        {node.node_id}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                      {node.location && <span className="truncate">{node.location}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">STATUS</div>
                    <div className="font-mono text-sm text-cyan-400">
                      {node.is_active ? 'ONLINE' : 'OFFLINE'}
                    </div>
                  </div>
                </div>
                {node.hardware_anchor && (
                  <div className="mt-2 text-xs font-mono text-zinc-500">
                    HW ANCHOR: {node.hardware_anchor}
                  </div>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
