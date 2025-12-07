"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"

// Types for window.openai
interface OpenAiGlobals {
  theme: "light" | "dark"
  locale: string
  maxHeight: number
  displayMode: "pip" | "inline" | "fullscreen"
  toolInput: Record<string, unknown>
  toolOutput: Record<string, unknown> | null
  toolResponseMetadata: Record<string, unknown> | null
  widgetState: Record<string, unknown> | null
}

interface OpenAiAPI {
  callTool: (name: string, args: Record<string, unknown>) => Promise<any>
  setWidgetState: (state: Record<string, unknown>) => Promise<void>
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>
  requestClose: () => void
  openExternal: (payload: { href: string }) => void
}

declare global {
  interface Window {
    openai: OpenAiGlobals & OpenAiAPI
  }
}

// Custom hook for widget state
export function useWidgetState<T extends Record<string, unknown>>(
  defaultState: T | (() => T),
): readonly [T, (state: T | ((prev: T) => T)) => void] {
  const [widgetState, _setWidgetState] = useState<T>(() => {
    const fromWindow = window.openai?.widgetState as T | null
    if (fromWindow != null) return fromWindow
    return typeof defaultState === "function" ? defaultState() : defaultState
  })

  const setWidgetState = useCallback((state: T | ((prev: T) => T)) => {
    _setWidgetState((prev) => {
      const newState = typeof state === "function" ? state(prev) : state
      window.openai?.setWidgetState(newState)
      return newState
    })
  }, [])

  return [widgetState, setWidgetState] as const
}

// Custom hook for tool output
export function useToolOutput<T>(): T | null {
  const [output, setOutput] = useState<T | null>(() => (window.openai?.toolOutput as T) ?? null)

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.globals?.toolOutput !== undefined) {
        setOutput(e.detail.globals.toolOutput as T)
      }
    }
    window.addEventListener("openai:set_globals", handler as EventListener)
    return () => window.removeEventListener("openai:set_globals", handler as EventListener)
  }, [])

  return output
}

// Custom hook for theme
export function useTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() => window.openai?.theme ?? "light")

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.globals?.theme !== undefined) {
        setTheme(e.detail.globals.theme)
      }
    }
    window.addEventListener("openai:set_globals", handler as EventListener)
    return () => window.removeEventListener("openai:set_globals", handler as EventListener)
  }, [])

  return theme
}

// Widget wrapper component
interface WidgetWrapperProps {
  children: React.ReactNode
  title?: string
  step?: number
  totalSteps?: number
}

export function WidgetWrapper({ children, title, step, totalSteps }: WidgetWrapperProps) {
  const theme = useTheme()

  return (
    <div
      className={`widget-container ${theme}`}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
        backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#1a1a1a",
        borderRadius: "12px",
        minHeight: "200px",
      }}
    >
      {(title || step) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "16px",
            borderBottom: `1px solid ${theme === "dark" ? "#333" : "#e5e5e5"}`,
          }}
        >
          {title && (
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              {title}
            </h2>
          )}
          {step && totalSteps && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: theme === "dark" ? "#888" : "#666",
                }}
              >
                Step {step} of {totalSteps}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                }}
              >
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: i < step ? "#10b981" : theme === "dark" ? "#444" : "#ddd",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export default WidgetWrapper
