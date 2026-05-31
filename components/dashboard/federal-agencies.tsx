'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FederalLedger } from '@/lib/types/database'
import { Building2, CheckCircle, Clock, Database } from 'lucide-react'

interface FederalAgenciesProps {
  agencies: FederalLedger[]
}

const statusConfig = {
  ACTIVE: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  PENDING: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  INGESTED: { icon: Database, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' }
}

export function FederalAgencies({ agencies }: FederalAgenciesProps) {
  // Group by wave
  const waveGroups = agencies.reduce((acc, agency) => {
    const wave = agency.wave
    if (!acc[wave]) acc[wave] = []
    acc[wave].push(agency)
    return acc
  }, {} as Record<number, FederalLedger[]>)

  return (
    <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader className="border-b border-cyan-500/20">
        <CardTitle className="flex items-center gap-2 text-cyan-400 font-mono">
          <Building2 className="h-5 w-5" />
          FEDERAL AGENCY LEDGER
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {Object.entries(waveGroups).map(([wave, waveAgencies]) => (
            <div key={wave}>
              <div className="text-xs font-mono text-zinc-500 mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-cyan-500/20" />
                WAVE {wave}
                <span className="h-px flex-1 bg-cyan-500/20" />
              </div>
              <div className="grid gap-2">
                {waveAgencies.map((agency) => {
                  const config = statusConfig[agency.status] || statusConfig.PENDING
                  const Icon = config.icon
                  
                  return (
                    <div
                      key={agency.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5"
                    >
                      <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm font-medium text-zinc-200">
                          {agency.agency_name}
                        </div>
                        <div className="text-xs text-zinc-500 font-mono">
                          ID: {agency.agency_code}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${config.border} ${config.color}`}
                      >
                        {agency.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
