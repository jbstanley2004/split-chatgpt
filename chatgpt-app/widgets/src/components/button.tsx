"use client"

import type React from "react"
import { useTheme } from "./widget-wrapper"

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  variant?: "primary" | "secondary" | "outline"
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  loading,
  fullWidth,
}: ButtonProps) {
  const theme = useTheme()

  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: 600,
      borderRadius: "8px",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      opacity: disabled || loading ? 0.6 : 1,
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      width: fullWidth ? "100%" : "auto",
      border: "none",
    }

    if (variant === "primary") {
      return {
        ...base,
        backgroundColor: "#1a1a1a",
        color: "#fff",
      }
    }

    if (variant === "secondary") {
      return {
        ...base,
        backgroundColor: theme === "dark" ? "#333" : "#f0f0f0",
        color: theme === "dark" ? "#fff" : "#1a1a1a",
      }
    }

    return {
      ...base,
      backgroundColor: "transparent",
      border: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
      color: theme === "dark" ? "#fff" : "#1a1a1a",
    }
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={getStyles()}>
      {loading && (
        <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray="31.42"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button
