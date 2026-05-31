'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { IntelligenceReport } from '@/lib/types/database'
import { Radio, AlertTriangle, Info, AlertCircle, Zap } from 'lucide-react'

interface IntelligenceFeedProps {
  reports: IntelligenceReport[]
}

const severityConfig = {
  INFO: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  WARNING: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  CRITICAL: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  ALERT: { icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' }
}

export function IntelligenceFeed({ reports }: IntelligenceFeedProps) {
  return (
    <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader className="border-b border-cyan-500/20">
        <CardTitle className="flex items-center gap-2 text-cyan-400 font-mono">
          <Radio className="h-5 w-5 animate-pulse" />
          REAL-TIME INTELLIGENCE FEED
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 max-h-[400px] overflow-y-auto">
        <div className="divide-y divide-cyan-500/10">
          {reports.map((report) => {
            const config = severityConfig[report.severity] || severityConfig.INFO
            const Icon = config.icon
            
            return (
              <div
                key={report.id}
                className="p-4 hover:bg-cyan-500/5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium text-zinc-200">
                        {report.title}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${config.border} ${config.color}`}
                      >
                        {report.severity}
                      </Badge>
                    </div>
                    {report.content && (
                      <p className="text-xs text-zinc-400 mb-2 line-clamp-2">
                        {report.content}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="font-mono">{report.report_type}</span>
                      {report.source_node && (
                        <span className="ml-auto font-mono text-cyan-500/70">
                          NODE: {report.source_node}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
