"use client"

import React from "react"

interface Props {
  fallback?: React.ReactNode
  children: React.ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: "" }

  static getDerivedStateFromError(err: unknown) {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : "Unknown error",
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm font-mono">
            Component failed: {this.state.message}
          </div>
        )
      )
    }
    return this.props.children
  }
}
