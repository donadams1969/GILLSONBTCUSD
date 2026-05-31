'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { DashboardStats } from '@/lib/types/database'
import { Coins, Server, Radio, Ghost, Building2, Zap } from 'lucide-react'

interface StatsCardsProps {
  stats: DashboardStats
}

const statsConfig = [
  { key: 'totalTokens', label: 'Sovereign Tokens', icon: Coins, color: 'text-cyan-400', format: (v: number) => v.toString() },
  { key: 'totalSupplyCap', label: 'Total Supply Cap', icon: Zap, color: 'text-emerald-400', format: (v: number) => (v / 1e9).toFixed(2) + 'B' },
  { key: 'activeNodes', label: 'Active Nodes', icon: Server, color: 'text-blue-400', format: (v: number) => v.toString() },
  { key: 'totalIntelReports', label: 'Intel Reports', icon: Radio, color: 'text-purple-400', format: (v: number) => v.toString() },
  { key: 'ghostProtocolEvents', label: 'Ghost Events', icon: Ghost, color: 'text-red-400', format: (v: number) => v.toString() },
  { key: 'federalAgencies', label: 'Federal Agencies', icon: Building2, color: 'text-orange-400', format: (v: number) => v.toString() },
] as const

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsConfig.map((config) => {
        const Icon = config.icon
        const value = stats[config.key as keyof DashboardStats]
        
        return (
          <Card 
            key={config.key}
            className="border-cyan-500/30 bg-black/60 backdrop-blur-sm overflow-hidden"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-cyan-500/10 ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-500 font-mono">{config.label}</div>
                  <div className={`text-xl font-mono font-bold ${config.color}`}>
                    {config.format(value as number)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
